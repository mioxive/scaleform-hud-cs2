#pragma once
#ifndef _DEBUG
#include "hud_scripts.h"
#endif

#include <windows.h>
#include <cstdint>
#include <cstdlib>
#include <string>
#include <vector>

struct CUIPanel;

struct CPanel2D 
{
    const void* vmt;
    CUIPanel* uiPanel;
};

using RunScriptFn = void (*)(void* engine, CUIPanel* contextPanel, const char* js, const char* originFile, std::uint64_t line);
using RunFrameFn = void (*)(void* engine);

void logLine(const char* format, ...);
std::string hudModuleDir();

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


template <typename T>
T relativeToAbsolute(std::uint8_t* displacement)
{
    return reinterpret_cast<T>(displacement + 4 + *reinterpret_cast<std::int32_t*>(displacement));
}


inline constexpr const char* originFile = "";
inline constexpr std::uint64_t noCache = 1;

extern void* g_engine;
extern RunScriptFn g_runScript;
extern CPanel2D** g_mainMenu;
extern CPanel2D** g_hudRoot;
extern HMODULE g_selfModule;


CUIPanel* panelOf(CPanel2D** global);

void* findEngine(const Module& panorama);

struct VTable 
{
    void** vtable{};
    std::size_t slots{};
    std::size_t runScriptIndex{};
    std::size_t runFrameIndex{};
};

bool resolveVTable(const Module& panorama, void* engine, VTable& layout);
bool findPanelGlobals(const Module& client);
void installFrameHook(const VTable& layout);
bool waitForModules(Module& panorama, Module& client);

void hkRunFrame(void* engine);

void loadScripts(void* engine, CUIPanel* panel);

void installImageHook(const Module& panorama);
