#include "hud.h"
#include "patterns.h"

#include <MinHook.h>
#include <cstring>

bool waitForModules(sdk::Module& panorama, sdk::Module& client)
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

    panorama = sdk::Module{ panoramaHandle };
    client = sdk::Module{ clientHandle };

    return true;
}


void* findEngine(const sdk::Module& panorama)
{
    void** engineSlot{};

    for (const char* pattern : patterns::kEngineGlobals)
    {
        auto* hit = panorama.find(pattern);
        if (!hit)
            continue;

        auto** slot = relativeToAbsolute<void**>(hit + patterns::kEngineGlobalOffset);
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


bool resolveVTable(const sdk::Module& panorama, void* engine, sdk::VTable& layout)
{
    auto* runScriptCode = panorama.find(patterns::kRunScript);
    auto* runFrameCode = panorama.find(patterns::kRunFrame);

    if (!runScriptCode || !runFrameCode) 
    {
        logLine("[hud] RunScript/RunFrame pattern not found, refusing to hook\n");
        return false;
    }

    layout.vtable = *reinterpret_cast<void***>(engine);

    layout.slots = 0;
    layout.runScriptIndex = patterns::kMaxVTableSlots;
    layout.runFrameIndex = patterns::kMaxVTableSlots;

    while (layout.slots < patterns::kMaxVTableSlots && panorama.has(layout.vtable[layout.slots]))
    {
        if (layout.vtable[layout.slots] == runScriptCode && layout.runScriptIndex == patterns::kMaxVTableSlots)
            layout.runScriptIndex = layout.slots;

        if (layout.vtable[layout.slots] == runFrameCode && layout.runFrameIndex == patterns::kMaxVTableSlots)
            layout.runFrameIndex = layout.slots;

        ++layout.slots;
    }

    if (layout.runScriptIndex == patterns::kMaxVTableSlots || layout.runFrameIndex == patterns::kMaxVTableSlots) 
    {
        logLine("[hud] that vtable is not the UI engine's, refusing to hook\n");
        return false;
    }

    if (layout.runScriptIndex != patterns::kRunScriptIndex || layout.runFrameIndex != patterns::kRunFrameIndex)
        logLine("[hud] slot numbers moved (were %zu / %zu), using the ones found\n", patterns::kRunScriptIndex, patterns::kRunFrameIndex);

    return true;
}

bool findPanelGlobals(const sdk::Module& client)
{
    struct PanelPattern 
    {
        const char* signature;
        int offset;
        sdk::CPanel2D*** out;
        const char* what;
    };

    const PanelPattern panelPatterns[] {
        {"EC ?? 48 8B 05 ?? ?? ?? ?? 48 8D 15 ?? ?? ?? ?? 48 8B 48 08", 5, &hud::g_mainMenu, "main menu"},
        {"48 89 35 ?? ?? ?? ?? E8 ?? ?? ?? ?? 48 85", 3, &hud::g_hudRoot, "CSGOHud"}
    };

    for (const auto& [signature, offset, out, what] : panelPatterns)
    {
        auto* hit = client.find(signature);
        if (!hit) {
            logLine("[hud] %s pattern not found in client.dll\n", what);
            continue;
        }

        *out = relativeToAbsolute<sdk::CPanel2D**>(hit + offset);
    }

    if (!hud::g_mainMenu && !hud::g_hudRoot)
    {
        logLine("[hud] neither panel global was found, refusing to hook\n");
        return false;
    }

    return true;
}


void installFrameHook(const sdk::VTable& layout, void* engine)
{
    void* target = layout.vtable[layout.runFrameIndex];

    const MH_STATUS initialized = MH_Initialize();

    if (initialized != MH_OK && initialized != MH_ERROR_ALREADY_INITIALIZED)
    {
        logLine("[hud] MinHook init failed\n");
        return;
    }

    if (MH_CreateHook(target, reinterpret_cast<void*>(&hkRunFrame), reinterpret_cast<void**>(&hud::g_runFrame)) != MH_OK)
    {
        logLine("[hud] MH_CreateHook failed\n");
        return;
    }

    if (MH_EnableHook(target) != MH_OK)
    {
        logLine("[hud] MH_EnableHook failed\n");
        return;
    }

    logLine("[hud] RunFrame hooked at %p, waiting for the main menu panel\n", target);
}


sdk::CUIPanel* hud::isPanelOf(sdk::CPanel2D** global)
{
    sdk::CPanel2D* clientPanel = global ? *global : nullptr;
    return clientPanel ? clientPanel->uiPanel : nullptr;
}
