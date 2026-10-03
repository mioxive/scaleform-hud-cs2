#pragma once
#ifndef _DEBUG
#include "hud_scripts.h"
#endif

#include <windows.h>
#include <cstdarg>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>

inline std::vector<int> parsePattern(const char* pattern)
{
    std::vector<int> bytes;

    for (const char* c = pattern; *c;)
    {
        if (*c == ' ')
        {
            ++c;
        }
        else if (*c == '?')
        {
            bytes.push_back(-1);
            while (*c == '?')
                ++c;
        } 
        else
        {
            bytes.push_back(static_cast<int>(std::strtoul(c, nullptr, 16)));
            c += 2;
        }
    }

    return bytes;
}

template <typename T>
T relativeToAbsolute(std::uint8_t* displacement)
{
    return reinterpret_cast<T>(displacement + 4 + *reinterpret_cast<std::int32_t*>(displacement));
}

namespace sdk
{
    struct CUIPanel;
    struct CPanel2D
    {
        const void* vmt;
        CUIPanel* uiPanel;
    };

    struct VTable
    {
        void** vtable{};
        std::size_t slots{};
        std::size_t runScriptIndex{};
        std::size_t runFrameIndex{};
    };

    using RunScriptFn = void (*)(void* engine, CUIPanel* contextPanel, const char* js, const char* originFile, std::uint64_t line);
    using RunFrameFn = void (*)(void* engine);
    using ParseImageUrlFn = void (*)(void* out, const char* url);

    
    struct Module
    {
        std::uint8_t* base{};
        std::uint32_t size{};

        explicit Module(HMODULE module = nullptr) : base(reinterpret_cast<std::uint8_t*>(module))
        {
            if (!base)
                return;

            const auto* dos = reinterpret_cast<IMAGE_DOS_HEADER*>(base);
            size = reinterpret_cast<IMAGE_NT_HEADERS64*>(base + dos->e_lfanew)->OptionalHeader.SizeOfImage;
        }

        std::uint8_t* find(const char* pattern) const
        {
            const auto bytes = parsePattern(pattern);
            if (!base || bytes.empty() || bytes.size() > size)
                return nullptr;

            for (std::uint32_t i = 0; i + bytes.size() <= size; ++i)
            {
                std::size_t matched = 0;
                while (matched < bytes.size() && (bytes[matched] == -1 || base[i + matched] == bytes[matched]))
                    ++matched;

                if (matched == bytes.size())
                    return base + i;
            }
            return nullptr;
        }

        bool has(const void* address) const
        {
            const auto value = reinterpret_cast<std::uintptr_t>(address);
            const auto start = reinterpret_cast<std::uintptr_t>(base);
            return base && value >= start && value < start + size;
        }

        std::uint64_t rva(const void* address) const
        {
            return static_cast<std::uint64_t>(reinterpret_cast<const std::uint8_t*>(address) - base);
        }
    };
}


inline void logLine(const char* format, ...)
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

namespace hud
{
    struct Asset
    {
        const char* file;
        const unsigned char* bytes;
        std::size_t size;
    };

    inline void* g_engine{};
    inline sdk::RunFrameFn g_runFrame{};
    inline sdk::RunScriptFn g_runScript{};
    inline sdk::CPanel2D** g_mainMenu{};
    inline sdk::CPanel2D** g_hudRoot{};
    inline HMODULE g_selfModule{};
    inline constexpr const char* originFile = "";
    inline constexpr const char* hudScheme = "file://{hud}/";
    inline constexpr std::uint64_t noCache = 1;
    sdk::CUIPanel* isPanelOf(sdk::CPanel2D** global);
    void loadScripts(void* engine, sdk::CUIPanel* panel);

}

inline std::string getOwnModuleDir()
{
    char path[MAX_PATH]{};
    GetModuleFileNameA(hud::g_selfModule, path, sizeof(path));

    std::string dir{ path };
    const std::size_t slash = dir.find_last_of("\\/");
    return slash == std::string::npos ? std::string{} : dir.substr(0, slash);
}


bool resolveVTable(const sdk::Module& panorama, void* engine, sdk::VTable& layout);
bool findPanelGlobals(const sdk::Module& client);
bool waitForModules(sdk::Module& panorama, sdk::Module& client);
void* findEngine(const sdk::Module& panorama);
void hkRunFrame(void* engine);

void installImageHook(const sdk::Module& panorama);
void installFrameHook(const sdk::VTable& layout, void* engine);
