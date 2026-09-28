#include "hud.h"
#include "patterns.h"

#include <cstdarg>
#include <cstdio>


void* g_engine{};
RunScriptFn g_runScript{};
CPanel2D** g_mainMenu{};
CPanel2D** g_hudRoot{};

namespace 
{
    RunFrameFn g_oRunFrame{};
    CUIPanel* g_loadedHud{};
    CUIPanel* g_pendingHud{};
    std::uint64_t g_hudSeenAt{};
}

HMODULE g_selfModule{};

void logLine(const char* format, ...)
{
    char line[1024];

    std::va_list args;
    va_start(args, format);
    std::vsnprintf(line, sizeof(line), format, args);
    va_end(args);

#ifdef _DEBUG
    std::fputs(line, stdout);
#else
    OutputDebugStringA(line);
#endif
}

std::string hudModuleDir()
{
    char path[MAX_PATH]{};
    GetModuleFileNameA(g_selfModule, path, sizeof(path));

    std::string dir{path};
    const std::size_t slash = dir.find_last_of("\\/");
    return slash == std::string::npos ? std::string{} : dir.substr(0, slash);
}


namespace 
{

    constexpr std::uint64_t loadDelay = 1500;

    void reloadOnHotkey()
    {
        if (!(GetAsyncKeyState(VK_F7) & 1))
            return;

        g_loadedHud = nullptr;
        g_pendingHud = nullptr;
    }

    void followHudPanel(void* engine)
    {
        CUIPanel* hud = panelOf(g_hudRoot);

        if (!hud) 
        {
            g_loadedHud = nullptr;
            g_pendingHud = nullptr;
            return;
        }

        if (hud == g_loadedHud)
            return;

        if (hud != g_pendingHud)
        {
            g_pendingHud = hud;
            g_hudSeenAt = GetTickCount64();
        } 
        else if (GetTickCount64() - g_hudSeenAt >= loadDelay) 
        {
            loadScripts(engine, hud);
            g_loadedHud = hud;
        }
    }
} 

void hkRunFrame(void* engine)
{
    g_oRunFrame(engine);

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
        Module panorama{};
        Module client{};

        if (!waitForModules(panorama, client))
            return false;

        g_engine = findEngine(panorama);
        if (!g_engine)
            return false;

        VTable layout{};
        if (!resolveVTable(panorama, g_engine, layout))
            return false;

        g_runScript = reinterpret_cast<RunScriptFn>(layout.vtable[layout.runScriptIndex]);
        g_oRunFrame = reinterpret_cast<RunFrameFn>(layout.vtable[layout.runFrameIndex]);

        if (!findPanelGlobals(client))
            return false;

        installFrameHook(layout);
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
        g_selfModule = module;
        DisableThreadLibraryCalls(module);
        CloseHandle(CreateThread(nullptr, 0, start, nullptr, 0, nullptr));
    }
    return TRUE;
}
