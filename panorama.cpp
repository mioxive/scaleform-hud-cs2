#include "hud.h"
#include "patterns.h"

#include <cstring>

namespace
{
    void** g_vtableAllocation{};
    void** g_hookedVTable{};
}

bool waitForModules(Module& panorama, Module& client)
{
    HMODULE panoramaHandle{};
    HMODULE clientHandle{};
    HMODULE renderSystemHandle{};

    for (int attempt = 0; attempt < 300 && (!panoramaHandle || !clientHandle || !renderSystemHandle); ++attempt)
    {
        panoramaHandle = GetModuleHandleA("panorama.dll");
        clientHandle = GetModuleHandleA("client.dll");
        renderSystemHandle = GetModuleHandleA("rendersystemdx11.dll");

        if (!panoramaHandle || !clientHandle || !renderSystemHandle)
            Sleep(100);
    }

    if (!panoramaHandle || !clientHandle) {
        return false;
    }

    panorama = Module{ panoramaHandle };
    client = Module{ clientHandle };

    return true;
}


void* findEngine(const Module& panorama)
{
    void** engineSlot{};

    for (const char* pattern : kEngineGlobalPatterns)
    {
        auto* hit = panorama.find(pattern);
        if (!hit)
            continue;

        auto** slot = relativeToAbsolute<void**>(hit + kEngineGlobalDisplacement);
        if (!panorama.has(slot))
            continue;


        if (!engineSlot)
            engineSlot = slot;
        else if (slot != engineSlot)
            logLine("[hud] engine-slot patterns disagree, keeping the first\n");
    }

    if (!engineSlot)
    {
        logLine("[hud] no engine-slot pattern matched\n");
        return nullptr;
    }

    for (int attempt = 0; attempt < 300 && !*engineSlot; ++attempt)
        Sleep(100);

    if (!*engineSlot)
        logLine("[hud] engine slot is still null\n");

    return *engineSlot;
}


bool resolveVTable(const Module& panorama, void* engine, VTable& layout)
{
    auto* runScriptCode = panorama.find(kRunScriptPattern);
    auto* runFrameCode = panorama.find(kRunFramePattern);

    if (!runScriptCode || !runFrameCode) 
    {
        logLine("[hud] RunScript/RunFrame pattern not found, refusing to hook\n");
        return false;
    }

    layout.vtable = *reinterpret_cast<void***>(engine);

    layout.slots = 0;
    layout.runScriptIndex = kMaxVTableSlots;
    layout.runFrameIndex = kMaxVTableSlots;

    while (layout.slots < kMaxVTableSlots && panorama.has(layout.vtable[layout.slots]))
    {
        if (layout.vtable[layout.slots] == runScriptCode && layout.runScriptIndex == kMaxVTableSlots)
            layout.runScriptIndex = layout.slots;

        if (layout.vtable[layout.slots] == runFrameCode && layout.runFrameIndex == kMaxVTableSlots)
            layout.runFrameIndex = layout.slots;

        ++layout.slots;
    }

    if (layout.runScriptIndex == kMaxVTableSlots || layout.runFrameIndex == kMaxVTableSlots) 
    {
        logLine("[hud] that vtable is not the UI engine's, refusing to hook\n");
        return false;
    }

    if (layout.runScriptIndex != kRunScriptIndexHint || layout.runFrameIndex != kRunFrameIndexHint)
        logLine("[hud] slot numbers moved (were %zu / %zu), using the ones found\n", kRunScriptIndexHint, kRunFrameIndexHint);

    return true;
}

bool findPanelGlobals(const Module& client)
{
    struct PanelPattern 
    {
        const char* signature;
        int offset;
        CPanel2D*** out;
        const char* what;
    };

    const PanelPattern panelPatterns[] {
        {"EC ?? 48 8B 05 ?? ?? ?? ?? 48 8D 15 ?? ?? ?? ?? 48 8B 48 08", 5, &g_mainMenu, "main menu"},
        {"48 89 35 ?? ?? ?? ?? E8 ?? ?? ?? ?? 48 85", 3, &g_hudRoot, "CSGOHud"}
    };

    for (const auto& [signature, offset, out, what] : panelPatterns)
    {
        auto* hit = client.find(signature);
        if (!hit) {
            logLine("[hud] %s pattern not found in client.dll\n", what);
            continue;
        }

        *out = relativeToAbsolute<CPanel2D**>(hit + offset);
    }

    if (!g_mainMenu && !g_hudRoot)
    {
        logLine("[hud] neither panel global was found, refusing to hook\n");
        return false;
    }

    return true;
}


void installFrameHook(const VTable& layout)
{
    g_vtableAllocation = new void*[layout.slots + 1];
    std::memcpy(g_vtableAllocation, layout.vtable - 1, (layout.slots + 1) * sizeof(void*));

    g_hookedVTable = g_vtableAllocation + 1;
    g_hookedVTable[layout.runFrameIndex] = reinterpret_cast<void*>(&hkRunFrame);

    *reinterpret_cast<void***>(g_engine) = g_hookedVTable;

    logLine("[hud] RunFrame hooked, waiting for the main menu panel\n");
}


CUIPanel* panelOf(CPanel2D** global)
{
    CPanel2D* clientPanel = global ? *global : nullptr;
    return clientPanel ? clientPanel->uiPanel : nullptr;
}
