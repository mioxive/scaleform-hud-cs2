var WaOwner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');
if (!WaOwner) {
	for (var WaAt = contextPanel.FindChildTraverse('hud-WPN-main'); WaAt; WaAt = WaAt.GetParent()) {
		if (WaAt.GetParent() === contextPanel) {
			WaOwner = WaAt;
			break;
		}
	}
}

var Wa = {
	plateWidth: 340,
	plateHeight: 59,
	rightGap: 0,
	bottomGap: 0,

	clipRight: 160,
	clipWidth: 72,
	clipY: 0,
	clipSize: 44,
	reserveRight: 110,
	reserveY: 2,
	reserveSize: 24,
	slashOpacity: '0.4',
	slashGap: 4,
	magWidth: 20,
	magGap: 4,
	magY: 1,

	color: '#ffffff',
	shadow: '0px 0px 3px 0.0 #000000DD',
	lowShadow: '0px 0px 9px 2.5 #DD0000',
	letterSpacing: 0,
};

var WaMags = ['magazine', 'banana_mag', 'shotgun_shell', 'box', 'revolver_loader', 'bizon_tube', 'p90'];
var WaMagClasses = WaMags.map(function (type) {
	return 'HUD--ammo-reserve--' + type;
});

var WaMagSrc = function (type) {
	return 's2r://panorama/images/hud/ammo_reserve_' + type + '.vsvg';
};

var WaAncestor = function (panel, names) {
	for (var at = panel; at; at = at.GetParent())
		for (var n = 0; n < names.length; ++n)
			if (at.BHasClass(names[n]))
				return names[n];
	return null;
};

var WaMain = WaOwner ? WaOwner.FindChildTraverse('hud-WPN-main') : null;
var WaSrcClip = null;
var WaSrcReserve = null;
if (WaMain) {
	WaMain.style.opacity = '0.0';
	var WaClipGroup = WaMain.FindChildrenWithClassTraverse('hud-WPN-text')[0];
	if (WaClipGroup)
		WaSrcClip = WaClipGroup.FindChildrenWithClassTraverse('hud-HA-health_or_ammo-label')[0];
	WaSrcReserve = WaMain.FindChildTraverse('HudReserveAmmoCounter');
}

var WaOldRoot = contextPanel.FindChildTraverse('Ammo');
if (WaOldRoot)
	WaOldRoot.DeleteAsync(0);

if (WaMain) {
	var WaRoot = $.CreatePanel('Panel', contextPanel, 'Ammo');
	WaRoot.hittest = false;
	WaRoot.style.width = Wa.plateWidth + 'px';
	WaRoot.style.height = Wa.plateHeight + 'px';
	WaRoot.style.horizontalAlign = 'right';
	WaRoot.style.verticalAlign = 'bottom';
	WaRoot.style.marginRight = Wa.rightGap + 'px';
	WaRoot.style.marginBottom = Wa.bottomGap + 'px';
	WaRoot.style.zIndex = '20';
	WaRoot.style.visibility = 'collapse';
	PaintArt(WaRoot, 'ammoplate');

	var WaClip = $.CreatePanel('Label', WaRoot, 'AmmoClip');
	WaClip.hittest = false;
	WaClip.style.width = Wa.clipWidth + 'px';
	WaClip.style.horizontalAlign = 'right';
	WaClip.style.verticalAlign = 'center';
	WaClip.style.marginRight = Wa.clipRight + 'px';
	WaClip.style.y = Wa.clipY + 'px';
	WaClip.style.fontFamily = 'Stratum2';
	WaClip.style.fontWeight = 'bold';
	WaClip.style.fontSize = Wa.clipSize + 'px';
	WaClip.style.lineHeight = Wa.clipSize + 'px';
	WaClip.style.color = Wa.color;
	WaClip.style.letterSpacing = Wa.letterSpacing + 'px';
	WaClip.style.textShadow = Wa.shadow;
	WaClip.style.textAlign = 'right';
	WaClip.style.textOverflow = 'shrink';

	var WaReserve = $.CreatePanel('Panel', WaRoot, 'AmmoReserve');
	WaReserve.hittest = false;
	WaReserve.style.flowChildren = 'right';
	WaReserve.style.width = 'fit-children';
	WaReserve.style.height = 'fit-children';
	WaReserve.style.horizontalAlign = 'right';
	WaReserve.style.verticalAlign = 'center';
	WaReserve.style.marginRight = (Wa.reserveRight - Wa.magWidth - Wa.magGap) + 'px';
	WaReserve.style.y = Wa.reserveY + 'px';

	var WaSlash = $.CreatePanel('Label', WaReserve, 'AmmoSlash');
	WaSlash.hittest = false;
	WaSlash.style.verticalAlign = 'center';
	WaSlash.style.fontFamily = 'Stratum2';
	WaSlash.style.fontWeight = 'bold';
	WaSlash.style.fontSize = Wa.reserveSize + 'px';
	WaSlash.style.lineHeight = Wa.reserveSize + 'px';
	WaSlash.style.color = Wa.color;
	WaSlash.style.opacity = Wa.slashOpacity;
	WaSlash.style.textShadow = Wa.shadow;
	WaSlash.style.marginRight = Wa.slashGap + 'px';
	WaSlash.text = '/';

	var WaCount = $.CreatePanel('Label', WaReserve, 'AmmoCount');
	WaCount.hittest = false;
	WaCount.style.verticalAlign = 'center';
	WaCount.style.fontFamily = 'Stratum2';
	WaCount.style.fontWeight = 'bold';
	WaCount.style.fontSize = Wa.reserveSize + 'px';
	WaCount.style.lineHeight = Wa.reserveSize + 'px';
	WaCount.style.color = Wa.color;
	WaCount.style.letterSpacing = Wa.letterSpacing + 'px';
	WaCount.style.textShadow = Wa.shadow;
	WaCount.style.textAlign = 'right';
	WaCount.style.marginRight = Wa.magGap + 'px';

	var WaMag = $.CreatePanel('Image', WaReserve, 'AmmoMag');
	WaMag.hittest = false;
	WaMag.SetImage(WaMagSrc('magazine'));
	WaMag.style.width = Wa.magWidth + 'px';
	WaMag.style.height = Wa.magWidth + 'px';
	WaMag.style.verticalAlign = 'center';
	WaMag.style.y = Wa.magY + 'px';
	WaMag.style.washColor = Wa.color;

}

var WaGeneration = (typeof WaGeneration === 'undefined' ? 0 : WaGeneration) + 1;
var WaRead = function (label) {
	if (!label)
		return null;
	try {
		var value = parseInt(label.text, 10);
		return isFinite(value) ? value : null;
	} catch (error) {
		return null;
	}
};

var WaTick = function (generation) {
	if (generation !== WaGeneration)
		return;
	try {
		var owner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');
		var root = contextPanel.FindChildTraverse('Ammo');
		var main = contextPanel.FindChildTraverse('hud-WPN-main');
		if (owner && root && main) {
			var active = owner.BHasClass('HUD--HA--active');
			if (root.BHasClass('ammo-active') !== active) {
				root.SetHasClass('ammo-active', active);
				root.style.visibility = active ? 'visible' : 'collapse';
			}

			var clipLabel = contextPanel.FindChildTraverse('AmmoClip');
			var reserveRow = contextPanel.FindChildTraverse('AmmoReserve');
			var countLabel = contextPanel.FindChildTraverse('AmmoCount');
			var magIcon = contextPanel.FindChildTraverse('AmmoMag');

			var holding = !!WaAncestor(main, ['HUD--holding-0ammo', 'HUD--holding-1ammo']);
			if (clipLabel && reserveRow && clipLabel.BHasClass('ammo-empty') !== holding) {
				clipLabel.SetHasClass('ammo-empty', holding);
				clipLabel.style.visibility = holding ? 'collapse' : 'visible';
				reserveRow.style.visibility = holding ? 'collapse' : 'visible';
			}

			if (!holding) {
				var clip = WaRead(WaSrcClip);
				if (clipLabel && clip !== null && clipLabel.Value !== clip) {
					clipLabel.Value = clip;
					clipLabel.text = String(clip);
					var low = !!WaAncestor(main, ['HUD--ammo-clip--low']);
					if (clipLabel.Low !== low) {
						clipLabel.Low = low;
						clipLabel.style.textShadow = low ? Wa.lowShadow : Wa.shadow;
					}
				}

				var reserve = WaRead(WaSrcReserve);
				if (countLabel && reserve !== null && countLabel.Value !== reserve) {
					countLabel.Value = reserve;
					countLabel.text = String(reserve);
				}
				if (magIcon) {
					var found = WaAncestor(main, WaMagClasses);
					var type = found ? found.substring('HUD--ammo-reserve--'.length) : 'magazine';
					if (magIcon.Mag !== type) {
						magIcon.Mag = type;
						magIcon.SetImage(WaMagSrc(type));
					}
				}
			}
		}
	} catch (error) {
			}
	$.Schedule(0.1, function () {
		WaTick(generation);
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		WaTick(generation);
	};
})(WaGeneration));
