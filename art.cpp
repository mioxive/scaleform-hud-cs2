#include "hud.h"
#include "patterns.h"

#ifndef _DEBUG
#include "hud_assets.h"
#endif

#include <MinHook.h>
#include <cstdio>
#include <cstring>
#include <string>

namespace
{
    sdk::ParseImageUrlFn oParseImageUrl{};
    

#ifndef _DEBUG

    constexpr hud::Asset assets[] {
        {"notice_bar.png", hud_assets::kNoticeBarPng, sizeof(hud_assets::kNoticeBarPng)},
        {"topleft.png", hud_assets::kTopLeftPng, sizeof(hud_assets::kTopLeftPng)},
        {"alive_ct.png", hud_assets::kAliveCtPng, sizeof(hud_assets::kAliveCtPng)},
        {"alive_t.png", hud_assets::kAliveTPng, sizeof(hud_assets::kAliveTPng)},
        {"alive_skull.png", hud_assets::kAliveSkullPng, sizeof(hud_assets::kAliveSkullPng)},
        {"team_ct.png", hud_assets::kTeamCtPng, sizeof(hud_assets::kTeamCtPng)},
        {"team_t.png", hud_assets::kTeamTPng, sizeof(hud_assets::kTeamTPng)},
        {"weapon_plate.png", hud_assets::kWeaponPlatePng, sizeof(hud_assets::kWeaponPlatePng)},
        {"ammo_plate.png", hud_assets::kAmmoPlatePng, sizeof(hud_assets::kAmmoPlatePng)},
        {"hp_plate.png", hud_assets::kHpPlatePng, sizeof(hud_assets::kHpPlatePng)},
        {"hp_red.png", hud_assets::kHpRedPlatePng, sizeof(hud_assets::kHpRedPlatePng)},
        {"armor_plate.png", hud_assets::kArmorPlatePng, sizeof(hud_assets::kArmorPlatePng)},
        {"hp_icon.png", hud_assets::kHpIconPng, sizeof(hud_assets::kHpIconPng)},
        {"armor_icon.png", hud_assets::kArmorIconPng, sizeof(hud_assets::kArmorIconPng)},
        {"helmet_icon.png", hud_assets::kHelmetIconPng, sizeof(hud_assets::kHelmetIconPng)},
        {"kill_badge.png", hud_assets::kKillBadgePng, sizeof(hud_assets::kKillBadgePng)},
        {"win_ct.png", hud_assets::kWinPlateCtPng, sizeof(hud_assets::kWinPlateCtPng)},
        {"win_t.png", hud_assets::kWinPlateTPng, sizeof(hud_assets::kWinPlateTPng)},
        {"alert_icon.png", hud_assets::kAlertIconPng, sizeof(hud_assets::kAlertIconPng)},
        {"yesvote.png", hud_assets::kYesVotePng, sizeof(hud_assets::kYesVotePng)},
        {"novote.png", hud_assets::kNoVotePng, sizeof(hud_assets::kNoVotePng)},
        {"defuse_icon.png", hud_assets::kDefuseIconPng, sizeof(hud_assets::kDefuseIconPng)},
        {"fade.png", hud_assets::kFadePng, sizeof(hud_assets::kFadePng)},
        {"gotv_ct.png", hud_assets::kGotvCtPng, sizeof(hud_assets::kGotvCtPng)},
        {"gotv_t.png", hud_assets::kGotvTPng, sizeof(hud_assets::kGotvTPng)},
    };
#endif


    const std::string& assetsFolder()
    {
        static const std::string folder = [] {
#ifdef _DEBUG
            const std::string dir = getOwnModuleDir();

            for (const char* subpath : {"\\..\\..\\art", "\\art"})
            {
                const std::string path = dir + subpath;
                if (GetFileAttributesA(path.c_str()) != INVALID_FILE_ATTRIBUTES)
                    return path;
            }
            return dir + "\\art";
#else
            char temp[MAX_PATH]{};
            std::string dir{temp, GetTempPathA(sizeof(temp), temp) };

            dir += "scaleform";

            CreateDirectoryA(dir.c_str(), nullptr);
            return dir;
#endif
        }();

        return folder;
    }

#ifndef _DEBUG
    void extractAssets()
    {
        const std::string& dir = assetsFolder();

        for (const auto& asset : assets)
        {
            const std::string path = dir + "\\" + asset.file;
            FILE* file = nullptr;

            if (fopen_s(&file, path.c_str(), "wb") == 0 && file)
            {
                std::fwrite(asset.bytes, 1, asset.size, file);
                std::fclose(file);
            }
        }
    }
#endif

    void hkParseImageUrl(void* out, const char* url)
    {
        const std::size_t schemeLen = std::strlen(hud::hudScheme);
        if (url && std::strncmp(url, hud::hudScheme, schemeLen) == 0)
        {
            const char* name = url + schemeLen;
            const char* query = std::strchr(name, '?');
            const int nameLen = query ? static_cast<int>(query - name) : static_cast<int>(std::strlen(name));

            char rewritten[1024];
            std::snprintf(rewritten, sizeof(rewritten), "raw://%s\\%.*s", assetsFolder().c_str(), nameLen, name);
            oParseImageUrl(out, rewritten);
            return;
        }

        oParseImageUrl(out, url);
    }
}


void installImageHook(const sdk::Module& panorama)
{
#ifndef _DEBUG
    extractAssets();
#endif

    auto* target = panorama.find(patterns::kImageUrl);

    if (!target) {
        logLine("[hud] ParseImageURL pattern not found\n");
        return;
    }

    const MH_STATUS initialized = MH_Initialize();

    if (initialized != MH_OK && initialized != MH_ERROR_ALREADY_INITIALIZED)
    {
        logLine("[hud] MinHook init failed\n");
        return;
    }

    if (MH_CreateHook(target, reinterpret_cast<void*>(&hkParseImageUrl), reinterpret_cast<void**>(&oParseImageUrl)) != MH_OK)
    {
        logLine("[hud] MH_CreateHook failed\n");
        return;
    }

    if (MH_EnableHook(target) != MH_OK) {
        logLine("[hud] MH_EnableHook failed\n");
        return;
    }

    logLine("[hud] image url parser hooked at %p, {hud} -> %s\n", static_cast<void*>(target), assetsFolder().c_str());
}
