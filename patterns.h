#pragma once
#include <cstddef>

namespace patterns
{
    inline constexpr const char* kRunScript = "4C 89 4C 24 ?? 4C 89 44 24 ?? 48 89 54 24 ?? 55 53 56 57 41 54 41 56 41 57 48 8D 6C 24";
    inline constexpr const char* kRunFrame = "48 89 5C 24 ?? 48 89 6C 24 ?? 56 57 41 54 41 56 41 57 48 81 EC 80 00 00 00 45 33 F6";

    inline constexpr std::size_t kRunFrameIndex = 5;
    inline constexpr std::size_t kRunScriptIndex = 77;
    inline constexpr std::size_t kMaxVTableSlots = 512;

    inline constexpr int kEngineGlobalOffset = 3;
    inline constexpr const char* kEngineGlobals[]{
        "4C 89 35 ?? ?? ?? ?? 48 8B 01",
        "4C 89 3D ?? ?? ?? ?? 41 8B F7",
        "48 8B 05 ?? ?? ?? ?? 48 8B 80 F8 0B 00 00 C3",
    };

    inline constexpr const char* kImageUrl = "40 53 57 41 56 48 81 EC 40 04 00 00";
}