var ScaleformPalette = [
	'#F5FFC0',
	'#FFFFFF',
	'#C4ECFE',
	'#6E9CFB',
	'#F294FF',
	'#FF6057',
	'#FFA557',
	'#FEFD55',
	'#78FF51',
	'#57FFBD',
	'#FFADC4',
];

var TeamColorCt = '#96c8fa';
var TeamColorT = '#eabe54';
var PaletteOffset = 1;
var TeammateColorIndex = 12;

var SettingsApi = (function () {
	try {
		return (typeof GameInterfaceAPI !== 'undefined' && GameInterfaceAPI.GetSettingString)
			? GameInterfaceAPI : null;
	} catch (error) {
		return null;
	}
})();

var Setting = function (name) {
	if (!SettingsApi)
		return null;
	try {
		var value = SettingsApi.GetSettingString(name);
		return (value === null || value === undefined || value === '') ? null : value;
	} catch (error) {
		return null;
	}
};

var SettingNumber = function (name, fallback) {
	var value = parseFloat(Setting(name));
	return isFinite(value) ? value : fallback;
};

var HudColorIndex = function () {
	var fromConvar = parseInt(Setting('cl_hud_color'), 10);
	if (isFinite(fromConvar))
		return fromConvar;
	for (var at = contextPanel; at; at = at.GetParent())
		for (var index = 0; index <= TeammateColorIndex; ++index)
			if (at.BHasClass('csgo-hud__color-' + index))
				return index;
	return 0;
};

var TeamTint = function () {
	if (contextPanel.BHasClass('HUD--team--terrorist'))
		return TeamColorT;
	return TeamColorCt;
};

var HudColor = function (index) {
	if (index === 0 || index === TeammateColorIndex)
		return TeamTint();
	var slot = index - PaletteOffset;
	if (slot < 0 || slot >= ScaleformPalette.length)
		return TeamTint();
	return ScaleformPalette[slot];
};

var RadarBorderAlpha = '19';
var DashboardTextAlpha = 'B2';

var RadarBorderWidth = '2px';
var RadarBorderOpacity = '0.50';

var ApplyRadarBorders = function (hex) {
	var painted = 0;
	for (var id of ['Radar__Round--Border', 'Radar__Square--Border']) {
		var border = contextPanel.FindChildTraverse(id);
		if (!border)
			continue;
		border.style.borderRadius = (id === 'Radar__Round--Border') ? '50% / 50%' : '0';
		border.style.borderWidth = RadarBorderWidth;
		border.style.borderStyle = 'solid';
		border.style.borderColor = hex + RadarBorderAlpha;
		border.style.opacity = RadarBorderOpacity;
		++painted;
	}
	return painted;
};

var TintNeutralText = true;

var NeutralTextIds = [
	'MoneyText',
	'AmmoClip',
	'AmmoSlash',
	'AmmoCount',
];

var TintClass = 'hud-colored';
var TintFillIds = ['HAHealthFill', 'HAArmorFill'];
var TintWashIds = ['AmmoMag', 'HAHealthIcon', 'HAArmorIcon'];
var HudTextColor = (typeof HudTextColor === 'undefined') ? '#ffffff' : HudTextColor;

var ApplyTextColor = function (hex) {
	var painted = 0;
	var paint = function (panel) {
		if (!panel)
			return;
		if (panel.TextColor === hex)
			return;
		panel.TextColor = hex;
		panel.style.color = hex;
		++painted;
	};

	for (var id of NeutralTextIds)
		paint(contextPanel.FindChildTraverse(id));
	for (var opted of contextPanel.FindChildrenWithClassTraverse(TintClass))
		paint(opted);
	return painted;
};

var ApplyFillColor = function (hex) {
	var painted = 0;
	for (var id of TintFillIds) {
		var fill = contextPanel.FindChildTraverse(id);
		if (!fill || fill.BHasClass('ha-critical') || fill.FillColor === hex)
			continue;
		fill.FillColor = hex;
		fill.style.backgroundColor = hex;
		++painted;
	}
	return painted;
};

var ApplyWashColor = function (hex) {
	var painted = 0;
	for (var id of TintWashIds) {
		var image = contextPanel.FindChildTraverse(id);
		if (!image || image.WashColor === hex)
			continue;
		image.WashColor = hex;
		image.style.washColor = hex;
		++painted;
	}
	return painted;
};

var PlateAlphaFallback = 1.0;
var PlateAlphaValue = (typeof PlateAlphaValue === 'undefined') ? 1.0 : PlateAlphaValue;
var ApplyPlateAlpha = function (alpha) {
	if (typeof PaintArt === 'undefined')
		return 0;
	var painted = 0;
	var repaint = function (panel, token, extra) {
		if (panel && PaintArt(panel, token, extra))
			++painted;
	};
	var text = String(alpha);

	repaint(contextPanel.FindChildTraverse('DashboardLabel'), 'topleft', {opacity: text});

	var health = contextPanel.FindChildTraverse('HAHealth');
	if (health && !health.BHasClass('ha-critical')) {
		var hpSize = (typeof HaBox !== 'undefined' && HaBox && HaBox.hpBgSize) || undefined;
		repaint(health, 'hpplate', hpSize ? {size: hpSize, opacity: text} : {opacity: text});
	}
	repaint(contextPanel.FindChildTraverse('HAArmor'), 'armorplate', {opacity: text});
	repaint(contextPanel.FindChildTraverse('Ammo'), 'ammoplate', {opacity: text});
	if (typeof PlateImgOpacity !== 'undefined')
		PlateImgOpacity = text;
	return painted;
};

var SettingsPollSeconds = 0.5;
var LastHudColor = null;
var LastPlateAlpha = null;
var SettingsSaid = {};
var ApplySettings = function (why) {
	var index = HudColorIndex();
	var hex = HudColor(index);
	var textHex = (TintNeutralText && index !== 0 && index !== TeammateColorIndex) ? hex : '#ffffff';
	HudTextColor = textHex;
	var alpha = SettingNumber('cl_hud_radar_background_alpha', PlateAlphaFallback);
	alpha = Math.max(0, Math.min(1, alpha));

	var stamp = hex + '|' + textHex;
	var colorChanged = stamp !== LastHudColor;
	var alphaChanged = alpha !== LastPlateAlpha;
	if (!colorChanged && !alphaChanged && why === 'poll')
		return;

	var said = SettingsSaid;
	var failed = null;
	var section = function (name, fn) {
		try {
			return fn();
		} catch (error) {
			if (!said[name]) {
				said[name] = true;
							}
			failed = failed ? failed + ',' + name : name;
			return null;
		}
	};

	var borders = section('radar', function () {
		return ApplyRadarBorders(hex);
	});

	section('location', function () {
		var dashboard = contextPanel.FindChildTraverse('DashboardLabel');
		if (dashboard)
			dashboard.style.color = hex + DashboardTextAlpha;
		return true;
	});

	var tinted = section('text', function () {
		return ApplyTextColor(textHex);
	});
	var fills = section('fills', function () {
		return ApplyFillColor(textHex);
	});
	var washes = section('wash', function () {
		return ApplyWashColor(textHex);
	});
	var plate = alphaChanged
		? section('plates', function () {
			PlateAlphaValue = alpha;
			var painted = ApplyPlateAlpha(alpha);
			if (typeof MoneyApplyAlpha === 'function')
				MoneyApplyAlpha(alpha);
			return painted;
		})
		: null;

	if (!failed) {
		LastHudColor = stamp;
		LastPlateAlpha = alpha;
	}

};

var SettingsGeneration = (typeof SettingsGeneration === 'undefined' ? 0 : SettingsGeneration) + 1;

var SettingsTick = function (generation, why) {
	if (generation !== SettingsGeneration)
		return;
	try {
		ApplySettings(why);
	} catch (error) {
			}
	$.Schedule(SettingsPollSeconds, function () {
		SettingsTick(generation, 'poll');
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		SettingsTick(generation, 'load');
	};
})(SettingsGeneration));
