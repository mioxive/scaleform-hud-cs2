#include "hud.h"

#include <algorithm>
#include <cstdio>
#include <string>
#include <vector>

#ifdef _DEBUG

namespace
{
    constexpr const char* header = "var contextPanel = $.GetContextPanel();\n";

    const std::string& scriptsFolder()
    {
        static const std::string folder = [] {
            const std::string dir = hudModuleDir();

            for (const char* subpath : {"\\..\\..\\js", "\\js"})
            {
                const std::string path = dir + subpath;
                if (GetFileAttributesA(path.c_str()) != INVALID_FILE_ATTRIBUTES)
                    return path;
            }
            return dir + "\\js";
        }();

        return folder;
    }

    std::string readFile(const std::string& path)
    {
        FILE* file = nullptr;
        if (fopen_s(&file, path.c_str(), "rb") != 0 || !file)
            return {};

        std::string content;
        char buffer[8192];

        std::size_t read{};
        while ((read = std::fread(buffer, 1, sizeof(buffer), file)) > 0)
            content.append(buffer, read);

        std::fclose(file);

        return content;
    }
}

void loadScripts(void* engine, CUIPanel* panel)
{
    const std::string& folder = scriptsFolder();

    WIN32_FIND_DATAA data{};
    HANDLE find = FindFirstFileA((folder + "\\*.js").c_str(), &data);

    if (find == INVALID_HANDLE_VALUE)
    {
        logLine("[hud] no .js files in %s\n", folder.c_str());
        return;
    }

    std::vector<std::string> names;

    do
    {
        if (!(data.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY))
            names.push_back(data.cFileName);

    } while (FindNextFileA(find, &data));

    FindClose(find);
    std::sort(names.begin(), names.end());

    for (const auto& name : names)
    {
        const std::string source = readFile(folder + "\\" + name);
        if (source.empty())
            continue;

        std::string js{"try {\n"};
        js += header;
        js += source;
        js += "\n} catch (error) { $.Msg(\"[hud] " + name + ": \" + error); }";

        g_runScript(engine, panel, js.c_str(), originFile, noCache);
        logLine("[hud] ran %s (%zu bytes)\n", name.c_str(), source.size());
    }

    logLine("[hud] %zu script(s) from %s\n", names.size(), folder.c_str());
}

#else

#include "hud_scripts.h"

namespace
{
    constexpr const char* header = "var contextPanel = $.GetContextPanel();\n";
}

void loadScripts(void* engine, CUIPanel* panel)
{
    for (std::size_t i = 0; i < hud_scripts::kScriptCount; ++i)
    {
        const hud_scripts::ScriptEntry& script = hud_scripts::kScripts[i];

        std::string js{"try {\n"};
        js += header;
        js.append(reinterpret_cast<const char*>(script.bytes), script.size);
        js += "\n} catch (error) { $.Msg(\"[hud] " + std::string{script.name} + ": \" + error); }";

        g_runScript(engine, panel, js.c_str(), originFile, noCache);

        logLine("[hud] ran %s (%zu bytes)\n", script.name, script.size);
    }

    logLine("[hud] %zu script(s) embedded\n", hud_scripts::kScriptCount);
}

#endif
