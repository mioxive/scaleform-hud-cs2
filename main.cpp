#include "hud.h"
#include "patterns.h"

#include <cstdarg>
#include <cstdio>

namespace
{
    sdk::CUIPanel* loadedHud{};
    sdk::CUIPanel* pendingHud{};
    std::uint64_t g_hudSeenAt{};
    constexpr std::uint64_t loadDelay = 1500;

    void reloadOnHotkey()
    {
        if (!(GetAsyncKeyState(VK_F7) & 1))
            return;

        loadedHud = nullptr;
        pendingHud = nullptr;
    }

    void followHudPanel(void* engine)
    {
        sdk::CUIPanel* hud_panel = hud::isPanelOf(hud::g_hudRoot);

        if (!hud_panel) 
        {
            loadedHud = nullptr;
            pendingHud = nullptr;
            return;
        }

        if (hud_panel == loadedHud)
            return;

        if (hud_panel != pendingHud)
        {
            pendingHud = hud_panel;
            g_hudSeenAt = GetTickCount64();
        } 
        else if (GetTickCount64() - g_hudSeenAt >= loadDelay) 
        {
            hud::loadScripts(engine, hud_panel);
            loadedHud = hud_panel;
        }
    }
} 

void hkRunFrame(void* engine)
{
    hud::g_runFrame(engine);

    static unsigned frames{};
    if (frames == 0)
        logLine("[hud] RunFrame hook is alive\n");

    ++frames;

    __try
    {
        reloadOnHotkey();
        followHudPanel(engine);
    }
    __except (EXCEPTION_EXECUTE_HANDLER)
    {
    }
}

namespace 
{
    bool start()
    {
        sdk::Module panorama{};
        sdk::Module client{};

        if (!waitForModules(panorama, client))
            return false;

        hud::g_engine = findEngine(panorama);
        if (!hud::g_engine)
            return false;

        sdk::VTable layout{};
        if (!resolveVTable(panorama, hud::g_engine, layout))
            return false;

        hud::g_runScript = reinterpret_cast<sdk::RunScriptFn>(layout.vtable[layout.runScriptIndex]);

        if (!findPanelGlobals(client))
            return false;

        installFrameHook(layout, hud::g_engine);
        installImageHook(panorama);

        return true;
    }

    DWORD WINAPI start(LPVOID)
    {
#ifdef _DEBUG
        AllocConsole();
        FILE* stream{};
        freopen_s(&stream, "CONOUT$", "w", stdout);

        logLine("[hud] CS2 Scaleform hud (debug mode)\n");
#else
        logLine("[hud] CS2 Scaleform hud\n");
        logLine("[hud] %zu scripts total\n", hud_scripts::kScriptCount);
#endif
        start();

        return 0;
    }
}

BOOL APIENTRY DllMain(HMODULE module, DWORD reason, LPVOID)
{
    if (reason == DLL_PROCESS_ATTACH) 
    {
        hud::g_selfModule = module;
        DisableThreadLibraryCalls(module);
        CloseHandle(CreateThread(nullptr, 0, start, nullptr, 0, nullptr));
    }
    return TRUE;
}
