var Ws = {
	blockRaise: 68,
	iconScale: 0.85,
	iconNudge: 6,
	iconDim: '#606060',
	iconLit: '#ffffff',

	plateOpacity: '0.58',

	plateWidth: '216px',
	plateRight: 0,

	keySize: 18,
	keyOpacity: '0.92',
	nameSize: 18,
	nameSpacing: '-0.4px',
	nameTop: 1,
	ownedColor: '#BFBFBF',
	ownedOpacity: '0.95',
	countSize: 16,
	countBottom: 5,
	keySource: 'bind',
	keyChars: 1,
	shadow: '0px 0px 0px #00000000',
	kitWidth: 43,
	kitHeight: 45,
	kitRight: 16,
	kitGap: 9,
	line: 84,
};

var WsList = contextPanel.FindChildTraverse('weapon-selection-list');
var WsAlways = contextPanel.FindChildTraverse('id-weapon-selection-list__always-on-container');
var WsClassic = null;
for (var WsAt = WsAlways || WsList; WsAt; WsAt = WsAt.GetParent())
	if (WsAt.BHasClass('weapon-selection-classic')) {
		WsClassic = WsAt;
		break;
	}

var WsRarityConvar = 'cl_weapon_selection_rarity_color';
try {
	var WsRarityWas = GameInterfaceAPI.GetSettingString(WsRarityConvar);
	if (WsRarityWas === '1') {
	} else {
		GameInterfaceAPI.ConsoleCommand(WsRarityConvar + ' 1');
	}
} catch (WsRarityError) {
	}

var WsRarityLogged = false;
var WsOwnerLogged = false;

var WsOldDefuse = contextPanel.FindChildTraverse('Defuse');
if (WsOldDefuse)
	WsOldDefuse.DeleteAsync(0);

if (WsClassic) {
	var WsDefuseIcon = $.CreatePanel('Image', WsClassic, 'Defuse');
	WsDefuseIcon.hittest = false;
	WsDefuseIcon.SetImage('s2r://panorama/images/icons/ui/defuser_white.vsvg');
	WsDefuseIcon.style.width = Ws.kitWidth + 'px';
	WsDefuseIcon.style.height = Ws.kitHeight + 'px';
	WsDefuseIcon.style.horizontalAlign = 'right';
	WsDefuseIcon.style.marginRight = Ws.kitRight + 'px';
	WsDefuseIcon.style.marginBottom = Ws.kitGap + 'px';
	WsDefuseIcon.style.washColor = '#ffffff';
	WsDefuseIcon.style.visibility = 'collapse';
	var WsBottom = WsClassic.GetChild(0);
	if (WsBottom && WsBottom !== WsDefuseIcon)
		WsClassic.MoveChildBefore(WsDefuseIcon, WsBottom);
}

var WsOnce = function (panel, marker, write) {
	if (!panel || panel.BHasClass(marker))
		return false;
	panel.AddClass(marker);
	write(panel);
	return true;
};

var WsSlots = ['gear-slot--0', 'gear-slot--1', 'gear-slot--2', 'gear-slot--3', 'gear-slot--4'];
var WsRarityClasses = ['weapon-selection-item--rarity-0', 'weapon-selection-item--rarity-1',
	'weapon-selection-item--rarity-2', 'weapon-selection-item--rarity-3',
	'weapon-selection-item--rarity-4', 'weapon-selection-item--rarity-5',
	'weapon-selection-item--rarity-6', 'weapon-selection-item--rarity-7',
	'weapon-selection-item--rarity-99'];
var WsRarityColors = ['#ffffff', '#b0c3d9', '#5e98d9', '#4b69ff', '#8847ff', '#d32ce6', '#eb4b4b',
	'#e4ae39', '#ffd700'];

var WsWhich = function (panel, names) {
	for (var at = 0; at < names.length; ++at)
		if (panel.BHasClass(names[at]))
			return at;
	return -1;
};

if (WsClassic)
	WsClassic.style.transform = 'translateY(-' + Ws.blockRaise + 'px)';

var WsPips = function () {
	if (!WsAlways || !WsAlways.IsValid())
		return;
	for (var pip of WsAlways.FindChildrenWithClassTraverse('grenade-pip_container'))
		WsOnce(pip, 'ws-pip', function (panel) {
			panel.style.visibility = 'collapse';
		});
};

var WsGlow = function () {
	if (!WsAlways || !WsAlways.IsValid())
		return;
	for (var glow of WsAlways.FindChildrenWithClassTraverse('hud-bottom-row-background--right--objective'))
		WsOnce(glow, 'ws-glow-column', function (panel) {
			panel.style.x = '0px';
		});
};

var WsDefuse = function () {
	if (WsAlways && WsAlways.IsValid())
		for (var row of WsAlways.FindChildrenWithClassTraverse('kit'))
			WsOnce(row, 'ws-kit-hidden', function (panel) {
				panel.style.visibility = 'collapse';
			});

	var icon = contextPanel.FindChildTraverse('Defuse');
	if (!icon)
		return;
	var kit = false;
	for (var at = icon; at && !kit; at = at.GetParent())
		kit = at.BHasClass('HUD--has-kit');

	if (icon.BHasClass('ws-haskit') !== kit) {
		icon.SetHasClass('ws-haskit', kit);
		icon.style.visibility = kit ? 'visible' : 'collapse';
	}
};

var WsBand = function () {
	if (!WsAlways || !WsAlways.IsValid())
		return;

	var nades = 0;
	var bombs = 0;
	var bombRow = null;
	for (var row of WsAlways.FindChildrenWithClassTraverse('weapon-row')) {
		var items = row.FindChildrenWithClassTraverse('weapon-selection-item').length;
		if (row.BHasClass('gear-slot--3'))
			nades += items;
		else if (row.BHasClass('gear-slot--4')) {
			bombRow = row;
			bombs += items;
		}
	}
	var lines = (nades > 0 ? 1 : 0) + (bombs > 0 ? 1 : 0);

	var drop = lines > 1 ? Ws.line : 0;
	if (bombRow && bombRow.WsDrop !== drop) {
		bombRow.WsDrop = drop;
		bombRow.style.transform = 'translateY(' + drop + 'px)';
	}

	if (WsAlways.WsLines !== lines) {
		WsAlways.WsLines = lines;
		WsAlways.style.visibility = lines > 0 ? 'visible' : 'collapse';
		WsAlways.style.height = (Math.max(lines, 1) * Ws.line) + 'px';
	}
};

var WsEmbeddedDone = false;
var WsEmbeddedTicks = 0;

var WsEmbedded = function () {
	if (WsEmbeddedDone || (WsEmbeddedTicks++ % 10) !== 0)
		return;
	var panel = contextPanel.FindChildTraverse('EmbeddedHudWeaponSelection');
	if (!panel)
		return;
	panel.style.visibility = 'collapse';
	WsEmbeddedDone = true;
};

var WsRow = function (row) {
	var slot = WsWhich(row, WsSlots);
	WsOnce(row, 'ws-row-inset', function (panel) {
		panel.style.marginRight = '0px';
		for (var container of panel.FindChildrenWithClassTraverse('weapon-row-horiz-container'))
			container.style.marginRight = '6px';
	});

	for (var background of row.FindChildrenWithClassTraverse('weapon-row-background'))
		WsOnce(background, 'ws-plate', function (panel) {
			panel.style.width = Ws.plateWidth;
			panel.style.horizontalAlign = 'right';
			panel.style.marginRight = Ws.plateRight + 'px';
			PaintArt(panel, 'weaponplate', {size: '100% 100%', opacity: Ws.plateOpacity});
		});

	for (var number of row.FindChildrenWithClassTraverse('weapon-row-number')) {
		WsOnce(number, 'ws-key-2', function (panel) {
			panel.style.fontSize = Ws.keySize + 'px';
			panel.style.fontWeight = 'bold';
			panel.style.opacity = Ws.keyOpacity;
			panel.style.textShadow = Ws.shadow;
			panel.style.whiteSpace = 'nowrap';
			panel.style.textOverflow = 'noclip';
			panel.style.overflow = 'noclip';
		});
		var current = String(number.text || '').trim();
		var want = null;
		if (Ws.keySource === 'slot')
			want = slot >= 0 ? String(slot + 1) : null;
		else if (Ws.keyChars > 0)
			want = current.substring(0, Ws.keyChars);
		if (want && number.text !== want)
			number.text = want;
	}

	var iconTransform = 'scale3d(' + Ws.iconScale + ',' + Ws.iconScale + ',1)'
		+ (slot >= 3 ? ' translateY(' + Ws.iconNudge + 'px)' : '');

	for (var item of row.FindChildrenWithClassTraverse('weapon-selection-item')) {
		var selected = item.BHasClass('weapon-selection-item--selected');
		var rarity = WsWhich(item, WsRarityClasses);

		if (selected && !WsRarityLogged) {
			WsRarityLogged = true;
		}

		for (var icon of item.FindChildrenWithClassTraverse('weapon-selection-item-icon-main')) {
			WsOnce(icon, 'ws-icon', function (panel) {
				panel.style.transform = iconTransform;
				panel.style.opacity = '1.0';
				panel.style.overflow = 'noclip';
				if (slot >= 3)
					try {
						panel.style.preTransformScale2d = '-1, 1';
					} catch (error) {
											}
			});
			var wash = selected ? Ws.iconLit : Ws.iconDim;
			if (icon.WsWash !== wash) {
				icon.WsWash = wash;
				icon.style.washColor = wash;
			}
		}

		for (var box of item.FindChildrenWithClassTraverse('weapon-selection-item-icon'))
			WsOnce(box, 'ws-iconbox', function (panel) {
				panel.style.overflow = 'noclip';
			});

		var nameColor = selected && rarity >= 0 ? WsRarityColors[rarity] : '#ffffff';
		var plainName = '';
		for (var name of item.FindChildrenWithClassTraverse('weapon-selection-item-name-text')) {
			plainName = String(name.text || '');
			WsOnce(name, 'ws-name-2', function (panel) {
				panel.style.fontFamily = 'Stratum2';
				panel.style.fontWeight = 'bold';
				panel.style.fontSize = Ws.nameSize + 'px';
				panel.style.letterSpacing = Ws.nameSpacing;
				panel.style.marginTop = Ws.nameTop + 'px';
				panel.style.textOverflow = 'noclip';
				panel.style.textShadow = Ws.shadow;
			});
			if (name.WsColor !== nameColor) {
				name.WsColor = nameColor;
				name.style.color = nameColor;
			}
		}

		for (var owned of item.FindChildrenWithClassTraverse('weapon-selection-item-name-text-owned')) {
			WsOnce(owned, 'ws-owned-2', function (panel) {
				panel.style.fontFamily = 'Stratum2';
				panel.style.fontWeight = 'bold';
				panel.style.fontSize = Ws.nameSize + 'px';
				panel.style.letterSpacing = Ws.nameSpacing;
				panel.style.marginTop = Ws.nameTop + 'px';
				panel.style.textOverflow = 'noclip';
				panel.style.textShadow = Ws.shadow;
				panel.style.color = Ws.ownedColor;
				panel.style.opacity = Ws.ownedOpacity;
			});

			if (!selected || rarity < 0)
				continue;
			var ownedRaw = String(owned.text || '');
			var plainText = plainName && plainName.charAt(0) !== '{' && plainName.charAt(0) !== '#' ? plainName : '';
			var cut = plainText ? ownedRaw.indexOf(plainText) : -1;
			if (ownedRaw.indexOf('<font') >= 0 || cut < 0) {
				if (!WsOwnerLogged) {
					WsOwnerLogged = true;
				}
				continue;
			}
			var want = ownedRaw.slice(0, cut) + '<font color="' + nameColor + '">' + plainText + '</font>'
				+ ownedRaw.slice(cut + plainText.length);
			if (owned.WsOwnedWant !== want) {
				owned.WsOwnedWant = want;
				owned.text = want;
			}
			if (!WsOwnerLogged) {
				WsOwnerLogged = true;
			}
		}

		for (var count of item.FindChildrenWithClassTraverse('weapon-selection-item-count'))
			WsOnce(count, 'ws-count-2', function (panel) {
				panel.style.fontSize = Ws.countSize + 'px';
				panel.style.marginBottom = Ws.countBottom + 'px';
				panel.style.textShadow = Ws.shadow;
			});
	}
};

var WsGeneration = (typeof WsGeneration === 'undefined' ? 0 : WsGeneration) + 1;

var WsTick = function (generation) {
	if (generation !== WsGeneration)
		return;
	try {
		WsPips();
		WsBand();
		WsEmbedded();
		WsGlow();
		WsDefuse();
		for (var container of [WsAlways, WsList]) {
			if (!container || !container.IsValid())
				continue;
			for (var row of container.FindChildrenWithClassTraverse('weapon-row'))
				WsRow(row);
		}
	} catch (error) {
			}
	$.Schedule(0.1, function () {
		WsTick(generation);
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		WsTick(generation);
	};
})(WsGeneration));
