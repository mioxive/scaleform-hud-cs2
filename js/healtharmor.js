var HaOwner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');
if (!HaOwner) {
	for (var HaAt = contextPanel.FindChildTraverse('hud-HA-main'); HaAt; HaAt = HaAt.GetParent()) {
		if (HaAt.GetParent() === contextPanel) {
			HaOwner = HaAt;
			break;
		}
	}
}

var HaBox = {
	edgeGap: 0,
	bottomGap: 0,
	height: 55,
	hpWidth: 200,

	hpBgSize: '100% 100%',
	armorWidth: 265,

	iconFrameWidth: 30,
	iconSize: 20,
	hpIconX: 12,
	hpIconY: 3,
	armorIconX: 10,
	armorIconY: 2,
	iconOpacity: '0.85',

	textFrameWidth: 70,
	textFrameHeight: 51,
	hpTextX: 36,
	armorTextX: 38,
	textY: 3,
	armorBarX: 109,
	fontSize: 42,
	textMarginLeft: 5,
	color: '#ffffff',
	textShadow: '0px 0px 3px 0.0 #000000DD',
	criticalShadow: '0px 0px 9px 2.5 #DD0000',
	criticalAt: 25,
	criticalPlateOpacity: '0.92',
	criticalFill: '#ff0000',

	barWidth: 82,
	barHeight: 9,
	barX: 109,
	barY: 29,
	barTrack: '#03030399',
	barBorder: '1px solid #dddddd22',
	barOpacity: '0.70',
	barThreeDigitX: 109,
	healthDigitShift: 5,
	armorDigitShift: 19,
	armorMax: 100,
};

var HaFailures = {};

var HaSet = function (panel, property, value) {
	if (!panel)
		return;
	try {
		panel.style[property] = value;
	} catch (error) {
		if (!HaFailures[property]) {
			HaFailures[property] = true;
		}
	}
};

var HaHideNative = function () {
	var owner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');
	if (!owner)
		return null;
	HaSet(owner, 'opacity', '0.0');
	var nativeMain = owner.FindChildTraverse('SfMasterMain')
		|| contextPanel.FindChildTraverse('SfMasterMain');
	if (nativeMain) {
		HaSet(nativeMain, 'opacity', '0.0');
		HaSet(nativeMain, 'visibility', 'collapse');
		return nativeMain;
	}
	var nativeRoot = owner.FindChildrenWithClassTraverse('sfm-main')[0]
		|| contextPanel.FindChildrenWithClassTraverse('sfm-main')[0];
	if (nativeRoot) {
		HaSet(nativeRoot, 'opacity', '0.0');
		HaSet(nativeRoot, 'visibility', 'collapse');
		return nativeRoot;
	}
	for (var nativeId of ['SfMasterHealthBackground', 'SfMasterArmorBackground']) {
		var nativePlate = owner.FindChildTraverse(nativeId)
			|| contextPanel.FindChildTraverse(nativeId);
		if (nativePlate) {
			HaSet(nativePlate, 'opacity', '0.0');
			HaSet(nativePlate, 'visibility', 'collapse');
		}
	}
	return owner;
};

var HaTint = function () {
	try {
		return (typeof HudTextColor !== 'undefined' && HudTextColor) ? HudTextColor : HaBox.color;
	} catch (error) {
		return HaBox.color;
	}
};

var HaPlateOpacity = function () {
	try {
		return (typeof PlateAlphaValue !== 'undefined' && PlateAlphaValue !== null)
			? String(PlateAlphaValue) : '1.0';
	} catch (error) {
		return '1.0';
	}
};

var HaDigitCount = function (value) {
	value = Math.max(0, Math.floor(Math.abs(value)));
	if (value >= 100)
		return 3;
	if (value >= 10)
		return 2;
	return 1;
};

var HaPositionBar = function (bar, value, digitShift, threeDigitX) {
	if (!bar)
		return;
	var missing = 3 - HaDigitCount(value);
	bar._haX = (threeDigitX || HaBox.barThreeDigitX) - missing * digitShift;
	HaSet(bar, 'x', bar._haX + 'px');
};

var HaOldRoot = contextPanel.FindChildTraverse('HA');
if (HaOldRoot)
	HaOldRoot.DeleteAsync(0);

if (HaOwner) {
	var HaRoot = $.CreatePanel('Panel', contextPanel, 'HA');
	HaRoot.hittest = false;
	HaSet(HaRoot, 'width', '100%');
	HaSet(HaRoot, 'height', '100%');
	HaSet(HaRoot, 'zIndex', '20');
	HaSet(HaRoot, 'visibility', 'collapse');
	HaHideNative();

	for (var HaGone of ['hud-HA-bar', 'hud-HA-center', 'hud-HA__stroke']) {
		var HaFound = HaOwner.FindChildrenWithClassTraverse(HaGone);
		for (var HaOne = 0; HaOne < HaFound.length; ++HaOne) {
			HaSet(HaFound[HaOne], 'visibility', 'collapse');
		}
	}

	var HaMain = HaOwner.FindChildTraverse('hud-HA-main');
	if (HaMain)
		HaSet(HaMain, 'opacity', '0.0');

	var HaRow = $.CreatePanel('Panel', HaRoot, 'HARow');
	HaRow.hittest = false;
	HaSet(HaRow, 'flowChildren', 'none');
	HaSet(HaRow, 'width', (HaBox.hpWidth + HaBox.armorWidth) + 'px');
	HaSet(HaRow, 'height', HaBox.height + 'px');
	HaSet(HaRow, 'horizontalAlign', 'left');
	HaSet(HaRow, 'verticalAlign', 'bottom');
	HaSet(HaRow, 'marginLeft', HaBox.edgeGap + 'px');
	HaSet(HaRow, 'marginBottom', HaBox.bottomGap + 'px');

		var HaGroup = function (id, token, width, x, iconX, iconY, textX, digitShift, bgSize, align) {
			var group = $.CreatePanel('Panel', HaRow, id);
			group.hittest = false;
			HaSet(group, 'width', width + 'px');
			HaSet(group, 'height', '100%');
			HaSet(group, 'x', x + 'px');
			HaSet(group, 'y', '0px');
			HaSet(group, 'horizontalAlign', 'left');
			HaSet(group, 'verticalAlign', 'top');
			HaSet(group, 'overflow', 'noclip');
			PaintArt(group, token, bgSize
				? {size: bgSize, opacity: HaPlateOpacity()}
				: {size: '100% 100%', opacity: HaPlateOpacity()});

		var iconFrame = $.CreatePanel('Panel', group, id + 'Icons');
		iconFrame.hittest = false;
		HaSet(iconFrame, 'width', HaBox.iconFrameWidth + 'px');
		HaSet(iconFrame, 'height', '100%');
		HaSet(iconFrame, 'x', iconX + 'px');
		HaSet(iconFrame, 'y', iconY + 'px');
		HaSet(iconFrame, 'overflow', 'noclip');

		var icon = $.CreatePanel('Panel', iconFrame, id + 'Icon');
		icon.hittest = false;
		HaSet(icon, 'width', HaBox.iconSize + 'px');
		HaSet(icon, 'height', HaBox.iconSize + 'px');
		HaSet(icon, 'horizontalAlign', 'center');
		HaSet(icon, 'verticalAlign', 'center');
		HaSet(icon, 'opacity', HaBox.iconOpacity);

		var textFrame = $.CreatePanel('Panel', group, id + 'TextFrame');
		textFrame.hittest = false;
		HaSet(textFrame, 'width', HaBox.textFrameWidth + 'px');
		HaSet(textFrame, 'height', HaBox.textFrameHeight + 'px');
		HaSet(textFrame, 'x', textX + 'px');
		HaSet(textFrame, 'y', HaBox.textY + 'px');
		HaSet(textFrame, 'overflow', 'noclip');

		var label = $.CreatePanel('Label', textFrame, id + 'Text');
		label.hittest = false;
		HaSet(label, 'width', '100%');
		HaSet(label, 'fontFamily', 'Stratum2');
		HaSet(label, 'fontWeight', 'bold');
		HaSet(label, 'fontSize', HaBox.fontSize + 'px');
		HaSet(label, 'color', HaBox.color);
		HaSet(label, 'letterSpacing', '0px');
		HaSet(label, 'textShadow', HaBox.textShadow);
		HaSet(label, 'marginLeft', HaBox.textMarginLeft + 'px');
		HaSet(label, 'textAlign', align || 'center');
		HaSet(label, 'horizontalAlign', align === 'left' ? 'left' : 'center');
		HaSet(label, 'textOverflow', 'shrink');
		label.AddClass('hud-colored');

		var bar = $.CreatePanel('Panel', group, id + 'Bar');
		bar.hittest = false;
		var barHome = (id === 'HAArmor') ? HaBox.armorBarX : HaBox.barThreeDigitX;
		bar._haX = barHome;
		HaSet(bar, 'width', HaBox.barWidth + 'px');
		HaSet(bar, 'height', HaBox.barHeight + 'px');
		HaSet(bar, 'x', barHome + 'px');
		HaSet(bar, 'y', HaBox.barY + 'px');
		HaSet(bar, 'horizontalAlign', 'left');
		HaSet(bar, 'verticalAlign', 'top');
		HaSet(bar, 'border', HaBox.barBorder);
		HaSet(bar, 'borderRadius', '0px');
		HaSet(bar, 'backgroundColor', HaBox.barTrack);
		HaSet(bar, 'opacity', HaBox.barOpacity);
		HaSet(bar, 'overflow', 'noclip');

		var fill = $.CreatePanel('Panel', bar, id + 'Fill');
		fill.hittest = false;
		HaSet(fill, 'height', '100%');
		HaSet(fill, 'width', '100%');
		HaSet(fill, 'horizontalAlign', 'left');
		HaSet(fill, 'verticalAlign', 'top');
		HaSet(fill, 'backgroundColor', HaTint());

		return {group: group, icon: icon, label: label, bar: bar, fill: fill,
			digitShift: digitShift, token: token, bgSize: bgSize, barHome: barHome};
	};

	var HaHealth = HaGroup('HAHealth', 'hpplate', HaBox.hpWidth, 0,
		HaBox.hpIconX, HaBox.hpIconY, HaBox.hpTextX, HaBox.healthDigitShift, HaBox.hpBgSize, 'center');
	var HaArmor = HaGroup('HAArmor', 'armorplate', HaBox.armorWidth, HaBox.hpWidth,
		HaBox.armorIconX, HaBox.armorIconY, HaBox.armorTextX, HaBox.armorDigitShift, '100% 100%', 'left');

	PaintArt(HaHealth.icon, 'hpicon', {size: 'contain'});
	PaintArt(HaArmor.icon, 'armoricon', {size: 'contain'});
}

var HaGeneration = (typeof HaGeneration === 'undefined' ? 0 : HaGeneration) + 1;

var HaSource = function () {
	var owner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');
	var main = owner ? owner.FindChildTraverse('hud-HA-main') : null;
	if (!main)
		main = contextPanel.FindChildTraverse('hud-HA-main');
	if (!main)
		return null;
	var healthGroup = main.FindChildrenWithClassTraverse('hud-HA-health')[0];
	var armorGroup = main.FindChildrenWithClassTraverse('hud-HA-armor')[0];
	return {
		health: healthGroup ? healthGroup.FindChildrenWithClassTraverse('hud-HA-health_or_ammo-label')[0] : null,
		armor: armorGroup ? armorGroup.FindChildrenWithClassTraverse('hud-HA-armor-label')[0] : null,
	};
};

var HaRead = function (label) {
	if (!label || !label.IsValid())
		return null;
	try {
		var value = parseInt(label.text, 10);
		return isFinite(value) ? value : null;
	} catch (error) {
		return null;
	}
};

var HaShow = function (parts, value, max, critical) {
	if (!parts || !parts.label)
		return;
	var shown = (value === null) ? 0 : value;
	if (parts.label.Value !== shown) {
		parts.label.Value = shown;
		parts.label.text = String(shown);
	}
	var pct = Math.max(0, Math.min(100, Math.round((shown / max) * 100)));
	HaSet(parts.fill, 'width', pct + '%');
	HaPositionBar(parts.bar, shown, parts.digitShift, parts.barHome);
	if (critical !== undefined) {
		var lit = shown <= HaBox.criticalAt;
		parts.label.Critical = lit;
		HaSet(parts.label, 'textShadow', lit ? HaBox.criticalShadow : HaBox.textShadow);
		HaSet(parts.fill, 'backgroundColor', lit ? HaBox.criticalFill : HaTint());
		if (parts.group) {
			parts.group.SetHasClass('ha-critical', lit);
			PaintArt(parts.group, lit ? 'hpredplate' : parts.token, {
				size: parts.bgSize,
				opacity: lit ? HaBox.criticalPlateOpacity : HaPlateOpacity(),
			});
		}
	}
};

var HaTick = function (generation) {
	if (generation !== HaGeneration)
		return;
	try {
		var owner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');
		var healthLabel = contextPanel.FindChildTraverse('HAHealthText');
		if (owner && healthLabel) {
			HaHideNative();
			var root = contextPanel.FindChildTraverse('HA');
			if (root) {
				var active = owner.BHasClass('HUD--HA--active');
				if (root.BHasClass('ha-active') !== active) {
					root.SetHasClass('ha-active', active);
					HaSet(root, 'visibility', active ? 'visible' : 'collapse');
				}
			}

			var health = {
				label: healthLabel,
				fill: contextPanel.FindChildTraverse('HAHealthFill'),
				bar: contextPanel.FindChildTraverse('HAHealthBar'),
				group: contextPanel.FindChildTraverse('HAHealth'),
				digitShift: HaBox.healthDigitShift,
				token: 'hpplate',
				bgSize: HaBox.hpBgSize,
				barHome: HaBox.barThreeDigitX,
			};
			var armor = {
				label: contextPanel.FindChildTraverse('HAArmorText'),
				fill: contextPanel.FindChildTraverse('HAArmorFill'),
				bar: contextPanel.FindChildTraverse('HAArmorBar'),
				group: contextPanel.FindChildTraverse('HAArmor'),
				digitShift: HaBox.armorDigitShift,
				token: 'armorplate',
				bgSize: '100% 100%',
				barHome: HaBox.armorBarX,
			};
			var src = HaSource();
			HaShow(health, HaRead(src && src.health), 100, true);
			HaShow(armor, HaRead(src && src.armor), HaBox.armorMax);

			var main = contextPanel.FindChildTraverse('hud-HA-main');
			var icon = contextPanel.FindChildTraverse('HAArmorIcon');
			if (main && icon) {
				var wanted = main.BHasClass('HUD--has-helmet') ? 'helmeticon' : 'armoricon';
				if (icon.Src !== wanted) {
					icon.Src = wanted;
					PaintArt(icon, wanted, {size: 'contain'});
				}
			}
		}
	} catch (error) {
	}
	$.Schedule(0.1, function () {
		HaTick(generation);
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		HaTick(generation);
	};
})(HaGeneration));
