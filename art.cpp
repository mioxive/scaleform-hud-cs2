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
        {"kill_icon.png", hud_assets::kKillIconPng, sizeof(hud_assets::kKillIconPng)},
        {"kill_icon_headshot.png", hud_assets::kKillIconHsPng, sizeof(hud_assets::kKillIconHsPng)},
        {"kill_icon_outline.png", hud_assets::kKillOutlinePng, sizeof(hud_assets::kKillOutlinePng)},
        {"wp18_star.png", hud_assets::kWinStarPng, sizeof(hud_assets::kWinStarPng)},
        {"win_ct.png", hud_assets::kWinPlateCtPng, sizeof(hud_assets::kWinPlateCtPng)},
        {"win_t.png", hud_assets::kWinPlateTPng, sizeof(hud_assets::kWinPlateTPng)},
        {"alert_icon.png", hud_assets::kAlertIconPng, sizeof(hud_assets::kAlertIconPng)},
        {"yesvote.png", hud_assets::kYesVotePng, sizeof(hud_assets::kYesVotePng)},
        {"novote.png", hud_assets::kNoVotePng, sizeof(hud_assets::kNoVotePng)},
        {"defuse_icon.png", hud_assets::kDefuseIconPng, sizeof(hud_assets::kDefuseIconPng)},
        {"fade.png", hud_assets::kFadePng, sizeof(hud_assets::kFadePng)},
        {"gotv_ct.png", hud_assets::kGotvCtPng, sizeof(hud_assets::kGotvCtPng)},
        {"gotv_t.png", hud_assets::kGotvTPng, sizeof(hud_assets::kGotvTPng)},
        {"wpn_ak47.png", hud_assets::kWpnAk47Png, sizeof(hud_assets::kWpnAk47Png)},
        {"wpn_awp.png", hud_assets::kWpnAwpPng, sizeof(hud_assets::kWpnAwpPng)},
        {"wpn_awp2.png", hud_assets::kWpnAwp2Png, sizeof(hud_assets::kWpnAwp2Png)},
        {"wpn_bayonet.png", hud_assets::kWpnBayonetPng, sizeof(hud_assets::kWpnBayonetPng)},
        {"wpn_c4_.png", hud_assets::kWpnC4Png, sizeof(hud_assets::kWpnC4Png)},
        {"wpn_deagle.png", hud_assets::kWpnDeaglePng, sizeof(hud_assets::kWpnDeaglePng)},
        {"wpn_decoy2.png", hud_assets::kWpnDecoy2Png, sizeof(hud_assets::kWpnDecoy2Png)},
        {"wpn_elite.png", hud_assets::kWpnElitePng, sizeof(hud_assets::kWpnElitePng)},
        {"wpn_firebomb2.png", hud_assets::kWpnFirebomb2Png, sizeof(hud_assets::kWpnFirebomb2Png)},
        {"wpn_flashbang2.png", hud_assets::kWpnFlashbang2Png, sizeof(hud_assets::kWpnFlashbang2Png)},
        {"wpn_frag_grenade2.png", hud_assets::kWpnFragGrenade2Png, sizeof(hud_assets::kWpnFragGrenade2Png)},
        {"wpn_hegrenade2.png", hud_assets::kWpnHegrenade2Png, sizeof(hud_assets::kWpnHegrenade2Png)},
        {"wpn_hkp2000.png", hud_assets::kWpnHkp2000Png, sizeof(hud_assets::kWpnHkp2000Png)},
        {"wpn_incgrenade2.png", hud_assets::kWpnIncgrenade2Png, sizeof(hud_assets::kWpnIncgrenade2Png)},
        {"wpn_knife.png", hud_assets::kWpnKnifePng, sizeof(hud_assets::kWpnKnifePng)},
        {"wpn_knife_bowie.png", hud_assets::kWpnKnifeBowiePng, sizeof(hud_assets::kWpnKnifeBowiePng)},
        {"wpn_knife_butterfly.png", hud_assets::kWpnKnifeButterflyPng, sizeof(hud_assets::kWpnKnifeButterflyPng)},
        {"wpn_knife_flip.png", hud_assets::kWpnKnifeFlipPng, sizeof(hud_assets::kWpnKnifeFlipPng)},
        {"wpn_knife_gut.png", hud_assets::kWpnKnifeGutPng, sizeof(hud_assets::kWpnKnifeGutPng)},
        {"wpn_knife_karambit.png", hud_assets::kWpnKnifeKarambitPng, sizeof(hud_assets::kWpnKnifeKarambitPng)},
        {"wpn_knife_m9_bayonet.png", hud_assets::kWpnKnifeM9BayonetPng, sizeof(hud_assets::kWpnKnifeM9BayonetPng)},
        {"wpn_knife_push.png", hud_assets::kWpnKnifePushPng, sizeof(hud_assets::kWpnKnifePushPng)},
        {"wpn_knife_survival_bowie.png", hud_assets::kWpnKnifeSurvivalBowiePng, sizeof(hud_assets::kWpnKnifeSurvivalBowiePng)},
        {"wpn_knife_t.png", hud_assets::kWpnKnifeTPng, sizeof(hud_assets::kWpnKnifeTPng)},
        {"wpn_knife_tactical.png", hud_assets::kWpnKnifeTacticalPng, sizeof(hud_assets::kWpnKnifeTacticalPng)},
        {"wpn_m4a1.png", hud_assets::kWpnM4a1Png, sizeof(hud_assets::kWpnM4a1Png)},
        {"wpn_m4a1_silencer.png", hud_assets::kWpnM4a1SilencerPng, sizeof(hud_assets::kWpnM4a1SilencerPng)},
        {"wpn_m4a1_silencer_off.png", hud_assets::kWpnM4a1SilencerOffPng, sizeof(hud_assets::kWpnM4a1SilencerOffPng)},
        {"wpn_mag7.png", hud_assets::kWpnMag7Png, sizeof(hud_assets::kWpnMag7Png)},
        {"wpn_molotov2.png", hud_assets::kWpnMolotov2Png, sizeof(hud_assets::kWpnMolotov2Png)},
        {"wpn_p2000.png", hud_assets::kWpnP2000Png, sizeof(hud_assets::kWpnP2000Png)},
        {"wpn_smokegrenade2.png", hud_assets::kWpnSmokegrenade2Png, sizeof(hud_assets::kWpnSmokegrenade2Png)},
        {"wpn_ssg08.png", hud_assets::kWpnSsg08Png, sizeof(hud_assets::kWpnSsg08Png)},
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
