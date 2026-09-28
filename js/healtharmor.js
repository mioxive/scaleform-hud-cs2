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
	iconY: 0,
	textY: 0,
	height: 57,
	hpWidth: 197,
	hpBgSize: '107% 100%',
	armorWidth: 230,

	iconWidth: 22,
	iconHeight: 22,
	iconX: 19,
	iconOpacity: '0.85',
	textWidth: 70,
	textX: 40,
	fontSize: 42,
	letterSpacing: -1,
	textMarginLeft: 5,
	color: '#ffffff',
	textShadow: '0px 0px 3px 0.0 #000000DD',
	criticalShadow: '0px 0px 9px 2.5 #DD0000',
	criticalAt: 25,
	criticalPlateOpacity: '0.92',
	criticalFill: '#ff0000',
	barWidth: 80,
	barHeight: 8,
	barX: 116,
	barY: 6,
	barTrack: '#03030399',
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

	for (var HaGone of ['hud-HA-bar', 'hud-HA-center', 'hud-HA__stroke']) {
		var HaFound = HaOwner.FindChildrenWithClassTraverse(HaGone);
		for (var HaOne = 0; HaOne < HaFound.length; ++HaOne) {
			HaSet(HaFound[HaOne], 'visibility', 'collapse');
		}
	}

	var HaMain = HaOwner.FindChildTraverse('hud-HA-main');
	var HaSrcHealth = null;
	var HaSrcArmor = null;
	if (HaMain) {
		HaSet(HaMain, 'opacity', '0.0');
		var HaHealthGroup = HaMain.FindChildrenWithClassTraverse('hud-HA-health')[0];
		var HaArmorGroup = HaMain.FindChildrenWithClassTraverse('hud-HA-armor')[0];
		if (HaHealthGroup)
			HaSrcHealth = HaHealthGroup.FindChildrenWithClassTraverse('hud-HA-health_or_ammo-label')[0];
		if (HaArmorGroup)
			HaSrcArmor = HaArmorGroup.FindChildrenWithClassTraverse('hud-HA-armor-label')[0];
	}

	var HaRow = $.CreatePanel('Panel', HaRoot, 'HARow');
	HaRow.hittest = false;
	HaSet(HaRow, 'flowChildren', 'right');
	HaSet(HaRow, 'width', 'fit-children');
	HaSet(HaRow, 'height', HaBox.height + 'px');
	HaSet(HaRow, 'horizontalAlign', 'left');
	HaSet(HaRow, 'verticalAlign', 'bottom');
	HaSet(HaRow, 'marginLeft', HaBox.edgeGap + 'px');
	HaSet(HaRow, 'marginBottom', HaBox.bottomGap + 'px');

	var HaGroup = function (id, token, width, bgSize) {
		var group = $.CreatePanel('Panel', HaRow, id);
		group.hittest = false;
		HaSet(group, 'width', width + 'px');
		HaSet(group, 'height', '100%');
		PaintArt(group, token, bgSize
			? {size: bgSize, opacity: HaPlateOpacity()}
			: {opacity: HaPlateOpacity()});

		var icon = $.CreatePanel('Panel', group, id + 'Icon');
		icon.hittest = false;
		HaSet(icon, 'width', HaBox.iconWidth + 'px');
		HaSet(icon, 'height', HaBox.iconHeight + 'px');
		HaSet(icon, 'x', HaBox.iconX + 'px');
		HaSet(icon, 'y', HaBox.iconY + 'px');
		HaSet(icon, 'horizontalAlign', 'left');
		HaSet(icon, 'verticalAlign', 'center');
		HaSet(icon, 'opacity', HaBox.iconOpacity);

		var label = $.CreatePanel('Label', group, id + 'Text');
		label.hittest = false;
		HaSet(label, 'width', HaBox.textWidth + 'px');
		HaSet(label, 'x', HaBox.textX + 'px');
		HaSet(label, 'y', HaBox.textY + 'px');
		HaSet(label, 'horizontalAlign', 'left');
		HaSet(label, 'verticalAlign', 'center');
		HaSet(label, 'lineHeight', HaBox.fontSize + 'px');
		HaSet(label, 'fontFamily', 'Stratum2');
		HaSet(label, 'fontWeight', 'bold');
		HaSet(label, 'fontSize', HaBox.fontSize + 'px');
		HaSet(label, 'color', HaBox.color);
		HaSet(label, 'letterSpacing', HaBox.letterSpacing + 'px');
		HaSet(label, 'textShadow', HaBox.textShadow);
		HaSet(label, 'marginLeft', HaBox.textMarginLeft + 'px');
		HaSet(label, 'textAlign', 'center');
		HaSet(label, 'textOverflow', 'shrink');
		label.AddClass('hud-colored');

		var bar = $.CreatePanel('Panel', group, id + 'Bar');
		bar.hittest = false;
		HaSet(bar, 'width', HaBox.barWidth + 'px');
		HaSet(bar, 'height', HaBox.barHeight + 'px');
		HaSet(bar, 'x', HaBox.barX + 'px');
		HaSet(bar, 'y', HaBox.barY + 'px');
		HaSet(bar, 'horizontalAlign', 'left');
		HaSet(bar, 'verticalAlign', 'center');
		HaSet(bar, 'backgroundColor', HaBox.barTrack);

		var fill = $.CreatePanel('Panel', bar, id + 'Fill');
		fill.hittest = false;
		HaSet(fill, 'height', '100%');
		HaSet(fill, 'width', '100%');
		HaSet(fill, 'horizontalAlign', 'left');
		HaSet(fill, 'verticalAlign', 'top');
		HaSet(fill, 'backgroundColor', HaTint());

		return {group: group, icon: icon, label: label, fill: fill};
	};

	var HaHealth = HaGroup('HAHealth', 'hpplate', HaBox.hpWidth, HaBox.hpBgSize);
	var HaArmor = HaGroup('HAArmor', 'armorplate', HaBox.armorWidth, null);

	PaintArt(HaHealth.icon, 'hpicon', {size: 'contain'});
	PaintArt(HaArmor.icon, 'armoricon', {size: 'contain'});
}

var HaGeneration = (typeof HaGeneration === 'undefined' ? 0 : HaGeneration) + 1;
var HaSaid = -1;

var HaRead = function (label) {
	if (!label)
		return null;
	try {
		var value = parseInt(label.text, 10);
		return isFinite(value) ? value : null;
	} catch (error) {
		return null;
	}
};

var HaShow = function (parts, value, max, critical) {
	if (!parts || value === null)
		return;
	if (parts.label.Value !== value) {
		parts.label.Value = value;
		parts.label.text = String(value);
		var pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
		HaSet(parts.fill, 'width', pct + '%');
		if (critical !== undefined) {
			var lit = value <= HaBox.criticalAt;
			if (parts.label.Critical !== lit) {
				parts.label.Critical = lit;
				HaSet(parts.label, 'textShadow', lit ? HaBox.criticalShadow : HaBox.textShadow);
				HaSet(parts.fill, 'backgroundColor', lit ? HaBox.criticalFill : HaTint());
				parts.fill.SetHasClass('ha-critical', lit);
				if (parts.group) {
					parts.group.SetHasClass('ha-critical', lit);
					PaintArt(parts.group, lit ? 'hpredplate' : 'hpplate', {
						size: HaBox.hpBgSize,
						opacity: lit ? HaBox.criticalPlateOpacity : HaPlateOpacity(),
					});
				}
			}
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
				group: contextPanel.FindChildTraverse('HAHealth'),
			};
			var armor = {
				label: contextPanel.FindChildTraverse('HAArmorText'),
				fill: contextPanel.FindChildTraverse('HAArmorFill'),
			};
			if (health.fill)
				HaShow(health, HaRead(HaSrcHealth), 100, true);
			if (armor.label && armor.fill)
				HaShow(armor, HaRead(HaSrcArmor), HaBox.armorMax);

			var main = contextPanel.FindChildTraverse('hud-HA-main');
			var icon = contextPanel.FindChildTraverse('HAArmorIcon');
			if (main && icon) {
				var wanted = main.BHasClass('HUD--has-helmet') ? 'helmeticon' : 'armoricon';
				if (icon.Src !== wanted) {
					icon.Src = wanted;
					PaintArt(icon, wanted, {size: 'contain'});
				}
			}

			if (HaSaid !== generation && owner.actuallayoutwidth > 0 && healthLabel.actuallayoutwidth > 0) {
				HaSaid = generation;
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
