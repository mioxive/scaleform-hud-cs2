import pathlib
import struct
import zlib

ROOT = pathlib.Path(__file__).parent.parent
OUT_IMAGES = ROOT / 'art'
OUT_HEADER = ROOT / 'hud_assets.h'
OUT_SCRIPTS_HEADER = ROOT / 'hud_scripts.h'
JS_DIR = ROOT / 'js'


def write_png(path, width, height, pixel):
    """pixel(x, y) -> (r, g, b, a)"""
    rows = []
    for y in range(height):
        row = bytearray()
        for x in range(width):
            row += bytes(pixel(x, y))

        rows.append(b'\x00' + bytes(row))

    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))

    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(b''.join(rows), 9))
           + chunk(b'IEND', b''))

    path.write_bytes(png)
    return png


def notice_bar(width, height):
    def pixel(x, y):
        across = x / (width - 1)
        alpha = int(0x26 + (0xe6 - 0x26) * across ** 1.4)
        middle = 1.0 - abs((y / (height - 1)) - 0.5) * 2.0
        shade = int(6 + 16 * middle)

        if y == 0:
            shade, alpha = 0x4a, min(0xff, alpha + 0x20)
        elif y == height - 1:
            shade, alpha = 0x00, min(0xff, alpha + 0x18)

        return (shade, shade, shade + 1, alpha)

    return pixel


def kill_badge(width, height, border=2.0, samples=3):
    tan = (174, 169, 150)
    interior = 0x5c

    centre = width / 2.0
    shoulder = 12.0 * height / 23.0

    pool_cx = centre
    pool_cy = height * 0.80
    pool_rx = width * 0.34
    pool_ry = height * 0.17

    def edge_at(y):
        return max(0.0, centre - max(0.0, y - shoulder))

    def pixel(x, y):
        lit = 0.0
        for sy in range(samples):
            fy = y + (sy + 0.5) / samples
            edge = edge_at(fy)

            for sx in range(samples):
                across = abs(x + (sx + 0.5) / samples - centre)
                if across > edge:
                    continue

                lit += 255.0 if (fy < border or across > edge - border) else interior

        r, g, b = tan
        a = min(255, int(round(lit / (samples * samples))))
        dx = (x + 0.5 - pool_cx) / pool_rx
        dy = (y + 0.5 - pool_cy) / pool_ry

        pool = dx * dx + dy * dy
        if pool < 1.0 and a:
            k = 0.65 * (1.0 - pool) ** 1.4
            r = int(r * (1.0 - k))
            g = int(g * (1.0 - k))
            b = int(b * (1.0 - k))

        return (r, g, b, a)

    return pixel

ART = pathlib.Path(__file__).parent.parent / 'art'

ASSETS = [
    ('kNoticeBarPng', 'notice_bar.png', (256, 32, notice_bar(256, 32))),
    ('kTopLeftPng', 'topleft.png', ART / 'topleft.png'),
    ('kAliveCtPng', 'alive_ct.png', ART / 'alive_ct.png'),
    ('kAliveTPng', 'alive_t.png', ART / 'alive_t.png'),
    ('kAliveSkullPng', 'alive_skull.png', ART / 'alive_skull.png'),
    ('kTeamTPng', 'team_t.png', ART / 'team_t.png'),
    ('kTeamCtPng', 'team_ct.png', ART / 'team_ct.png'),
    ('kYesVotePng', 'yesvote.png', ART / 'yesvote.png'),
    ('kNoVotePng', 'novote.png', ART / 'novote.png'),
    ('kWeaponPlatePng', 'weapon_plate.png', ART / 'weapon_plate.png'),
    ('kAmmoPlatePng', 'ammo_plate.png', ART / 'ammo_plate.png'),
    ('kHpPlatePng', 'hp_plate.png', ART / 'hp_plate.png'),
    ('kArmorPlatePng', 'armor_plate.png', ART / 'armor_plate.png'),
    ('kHpIconPng', 'hp_icon.png', ART / 'hp_icon.png'),
    ('kArmorIconPng', 'armor_icon.png', ART / 'armor_icon.png'),
    ('kHelmetIconPng', 'helmet_icon.png', ART / 'helmet_icon.png'),
    ('kHpRedPlatePng', 'hp_red.png', ART / 'hp_red.png'),
    ('kKillBadgePng', 'kill_badge.png', (23, 23, kill_badge(23, 23))),
    ('kKillIconPng', 'kill_icon.png', ART / 'kill_icon.png'),
    ('kKillIconHsPng', 'kill_icon_headshot.png', ART / 'kill_icon_headshot.png'),
    ('kKillOutlinePng', 'kill_icon_outline.png', ART / 'kill_icon_outline.png'),
    ('kWinStarPng', 'wp18_star.png', ART / 'wp18_star.png'),
    ('kWinPlateCtPng', 'win_ct.png', ART / 'win_ct.png'),
    ('kWinPlateTPng', 'win_t.png', ART / 'win_t.png'),
    ('kAlertIconPng', 'alert_icon.png', ART / 'alert_icon.png'),
    ('kDefuseIconPng', 'defuse_icon.png', ART / 'defuse_icon.png'),
    ('kFadePng', 'fade.png', ART / 'fade.png'),
    ('kGotvCtPng', 'gotv_ct.png', ART / 'gotv_ct.png'),
    ('kGotvTPng', 'gotv_t.png', ART / 'gotv_t.png'),
]


WEAPONS_DIR = ART / 'weapons'
for _wpn in sorted(WEAPONS_DIR.glob('wpn_*.png')) if WEAPONS_DIR.is_dir() else []:
    _sym = 'k' + ''.join(part.capitalize() for part in _wpn.stem.split('_')) + 'Png'
    ASSETS.append((_sym, _wpn.name, _wpn))


def make_scripts():
    lines = ['#pragma once', '', '#include <cstddef>', '', 'namespace hud_scripts {', '']

    scripts = sorted(JS_DIR.glob('*.js'))
    entries = []

    for script_path in scripts:
        name = script_path.name
        symbol = 'k' + name.replace('.', '_').replace('-', '_').replace(' ', '_')
        content = script_path.read_bytes()

        lines.append(f'// {name}, {len(content)} bytes')
        lines.append(f'inline constexpr unsigned char {symbol}[]{{')
        for at in range(0, len(content), 16):
            lines.append('    ' + ' '.join(f'0x{b:02x},' for b in content[at:at + 16]))
        lines += ['};', '']

        entries.append((name, symbol, len(content)))

    lines.append('struct ScriptEntry {')
    lines.append('    const char* name;')
    lines.append('    const unsigned char* bytes;')
    lines.append('    std::size_t size;')
    lines.append('};')
    lines.append('')
    lines.append('inline constexpr ScriptEntry kScripts[]{')
    for name, symbol, size in entries:
        lines.append(f'    {{"{name}", {symbol}, {size}}},')
    lines.append('};')
    lines.append('')
    lines.append(f'inline constexpr std::size_t kScriptCount = {len(entries)};')
    lines.append('')
    lines.append('}  // namespace hud_scripts')
    lines.append('')

    OUT_SCRIPTS_HEADER.write_text('\n'.join(lines), encoding='utf-8')
    print(f'wrote {OUT_SCRIPTS_HEADER} ({len(entries)} script(s))')


def main():
    OUT_IMAGES.mkdir(parents=True, exist_ok=True)
    lines = ['#pragma once', '', '#include <cstddef>', '', 'namespace hud_assets {', '']

    for symbol, filename, source in ASSETS:
        if isinstance(source, pathlib.Path):
            png = source.read_bytes()
            width, height = struct.unpack('>II', png[16:24])

        else:
            width, height, pixel = source
            png = write_png(OUT_IMAGES / filename, width, height, pixel)

        lines.append(f'// {filename}, {width}x{height}, {len(png)} bytes')
        lines.append(f'inline constexpr unsigned char {symbol}[]{{')

        for at in range(0, len(png), 16):
            lines.append('    ' + ' '.join(f'0x{b:02x},' for b in png[at:at + 16]))
        lines += ['};', '']

        print(f'{filename}: {width}x{height}, {len(png)} bytes -> {symbol}')

    lines += ['}  // namespace hud_assets', '']
    OUT_HEADER.write_text('\n'.join(lines), encoding='utf-8')
    print(f'wrote {OUT_HEADER}')

    make_scripts()


if __name__ == '__main__':
    main()
