var Sp = {
	width: 522,
	height: 99,
	bottom: 68 - 16,
	plateOpacity: '0.6',

	avatar: 78,
	avatarTop: 1,
	avatarInset: 3,
	avatarBg: 'gradient( linear, 0% 0%, 0% 100%, from( #666666 ), to( #181818 ) )',

	nameSize: 26,
	nameLeft: 83,
	nameLift: 20,
	nameRight: 20,
	nameCt: '#88a4d1',
	nameT: '#d4c072',
	nameNone: '#ffffff',

	stripHeight: 24,
	stripBg: 'gradient( linear, 0% 0%, 100% 0%, from( #00000000 ), color-stop( 0.26, #00000000 ),' + ' color-stop( 0.45, #00000079 ), to( #00000079 ) )',
	weaponSize: 18,
	weaponRight: 9,
	weaponBottom: 1,

	fade: 0.2,
	park: -3000,
};

var SpBorrow = {id: 'HudSpecplayer__Avatar'};
var SpSources = {name: {cls: 'HudSpecplayer__player-name'}, weapon: {id: 'WeaponNameLabel'}};
var SpFailures = (typeof SpFailures === 'undefined' ? {} : SpFailures);

var SpSet = function (panel, property, value) {
	if (!panel)
		return;
	try {
		panel.style[property] = value;
	} catch (error) {
		if (!SpFailures[property]) {
			SpFailures[property] = true;
					}
	}
};

var SpFind = function (root, want) {
	if (!root)
		return null;
	return want.id ? root.FindChildTraverse(want.id)
		: root.FindChildrenWithClassTraverse(want.cls)[0] || null;
};

var SpTeam = function (from) {
	for (var at = from; at; at = at.GetParent()) {
		if (at.BHasClass('HUD--team--ct'))
			return 'ct';
		if (at.BHasClass('HUD--team--terrorist'))
			return 't';
	}
	return null;
};

var SpWatching = function (owner) {
	if (owner.FindChildrenWithClassTraverse('HudSpecplayerRoot--visible').length)
		return true;
	for (var at = owner; at; at = at.GetParent())
		if (at.BHasClass('HUD--spectating-target'))
			return true;
	return false;
};

var SpHudDiffers = function () {
	try {
		var local = GameStateAPI.GetLocalPlayerXuid();
		var hud = GameStateAPI.GetHudPlayerXuid();
		return !!(hud && String(hud) !== String(local));
	} catch (error) {
		return false;
	}
};

var SpOwner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');

var SpRelease = function (host, fallbackParent) {
	if (!host)
		return;
	var strays = host.FindChildrenWithClassTraverse('spec-borrowed');
	for (var at = 0; at < strays.length; ++at) {
		try {
			strays[at].SetParent(fallbackParent);
		} catch (error) {
		}
	}
};

var SpOld = SpOwner ? SpOwner.FindChildTraverse('Spec') : null;
if (SpOld) {
	var SpCircle = SpOwner.FindChildrenWithClassTraverse('hud-HA-center__circle')[0];
	SpRelease(SpOld, SpCircle || SpOwner);
	SpOld.DeleteAsync(0);
}

var SpOldNote = contextPanel.FindChildTraverse('SpecDebug');
if (SpOldNote)
	SpOldNote.DeleteAsync(0);

var SpVoid = contextPanel.FindChildTraverse('SpecVoid');
if (!SpVoid && SpOwner) {
	SpVoid = $.CreatePanel('Panel', SpOwner, 'SpecVoid');
	SpVoid.hittest = false;
	SpSet(SpVoid, 'width', '0px');
	SpSet(SpVoid, 'height', '0px');
	SpSet(SpVoid, 'visibility', 'collapse');
}

var SpBuild = function (owner) {
	var plate = $.CreatePanel('Panel', owner, 'Spec');
	plate.hittest = false;
	plate.hittestchildren = false;
	SpSet(plate, 'width', Sp.width + 'px');
	SpSet(plate, 'height', Sp.height + 'px');
	SpSet(plate, 'horizontalAlign', 'center');
	SpSet(plate, 'verticalAlign', 'bottom');
	SpSet(plate, 'marginBottom', Sp.bottom + 'px');
	SpSet(plate, 'zIndex', '20');
	SpSet(plate, 'overflow', 'noclip');
	SpSet(plate, 'opacity', '0.0');
	plate.SpUp = false;
	SpSet(plate, 'transitionProperty', 'opacity');
	SpSet(plate, 'transitionDuration', Sp.fade + 's');
	SpSet(plate, 'transitionTimingFunction', 'ease-in-out');
	PaintArt(plate, 'gotvct', {opacity: Sp.plateOpacity});

	var SpStrip = $.CreatePanel('Panel', plate, 'SpecStrip');
	SpStrip.hittest = false;
	SpSet(SpStrip, 'width', '100%');
	SpSet(SpStrip, 'height', Sp.stripHeight + 'px');
	SpSet(SpStrip, 'horizontalAlign', 'right');
	SpSet(SpStrip, 'verticalAlign', 'bottom');
	SpSet(SpStrip, 'backgroundColor', Sp.stripBg);

	var SpFrame = $.CreatePanel('Panel', plate, 'SpecAvatar');
	SpFrame.hittest = false;
	SpSet(SpFrame, 'width', Sp.avatar + 'px');
	SpSet(SpFrame, 'height', Sp.avatar + 'px');
	SpSet(SpFrame, 'horizontalAlign', 'left');
	SpSet(SpFrame, 'verticalAlign', 'top');
	SpSet(SpFrame, 'marginTop', Sp.avatarTop + 'px');
	SpSet(SpFrame, 'backgroundColor', Sp.avatarBg);

	SpReclaimAvatar(owner, plate);

	var SpNameLabel = $.CreatePanel('Label', plate, 'SpecName');
	SpNameLabel.hittest = false;
	SpNameLabel.AddClass('additive');
	SpSet(SpNameLabel, 'width', '100%');
	SpSet(SpNameLabel, 'maxWidth', (Sp.width - Sp.nameLeft - Sp.nameRight) + 'px');
	SpSet(SpNameLabel, 'height', (Sp.nameSize + 4) + 'px');
	SpSet(SpNameLabel, 'horizontalAlign', 'left');
	SpSet(SpNameLabel, 'verticalAlign', 'center');
	SpSet(SpNameLabel, 'marginLeft', Sp.nameLeft + 'px');
	SpSet(SpNameLabel, 'marginBottom', Sp.nameLift + 'px');
	SpSet(SpNameLabel, 'textAlign', 'left');
	SpSet(SpNameLabel, 'fontFamily', 'Stratum2');
	SpSet(SpNameLabel, 'fontWeight', 'bold');
	SpSet(SpNameLabel, 'fontSize', Sp.nameSize + 'px');
	SpSet(SpNameLabel, 'lineHeight', Sp.nameSize + 'px');
	SpSet(SpNameLabel, 'letterSpacing', '0px');
	SpSet(SpNameLabel, 'color', Sp.nameNone);
	SpSet(SpNameLabel, 'textOverflow', 'ellipsis');

	var SpWeaponLabel = $.CreatePanel('Label', plate, 'SpecWeapon', {html: 'true'});
	SpWeaponLabel.hittest = false;
	SpSet(SpWeaponLabel, 'width', (Sp.width - Sp.nameLeft) + 'px');
	SpSet(SpWeaponLabel, 'horizontalAlign', 'right');
	SpSet(SpWeaponLabel, 'verticalAlign', 'center');
	SpSet(SpWeaponLabel, 'marginBottom', Sp.weaponBottom + 'px');
	SpSet(SpWeaponLabel, 'paddingRight', Sp.weaponRight + 'px');
	SpSet(SpWeaponLabel, 'textAlign', 'right');
	SpSet(SpWeaponLabel, 'fontFamily', 'Stratum2');
	SpSet(SpWeaponLabel, 'fontWeight', 'normal');
	SpSet(SpWeaponLabel, 'fontSize', Sp.weaponSize + 'px');
	SpSet(SpWeaponLabel, 'lineHeight', Sp.weaponSize + 'px');
	SpSet(SpWeaponLabel, 'letterSpacing', '0px');
	SpSet(SpWeaponLabel, 'color', Sp.nameNone);
	SpSet(SpWeaponLabel, 'textOverflow', 'ellipsis');

	return plate;
};

var SpRead = function (owner, want) {
	var panel = SpFind(owner, want);
	if (!panel)
		return '';
	var text = panel.text || '';
	var first = text.charAt(0);
	return (first === '{' || first === '#') ? '' : text;
};

var SpMarkup = function (text) {
	return text.replace(/<img[^>]*>/gi, '').replace(/\s+/g, ' ').trim();
};

var SpReclaimAvatar = function (owner, plate) {
	var frame = plate ? plate.FindChildTraverse('SpecAvatar') : null;
	var avatar = SpFind(owner, SpBorrow);
	if (!avatar || !frame)
		return;
	if (avatar.GetParent() !== frame) {
		if (!avatar.SpHome || !avatar.SpHome.IsValid())
			avatar.SpHome = avatar.GetParent();
		avatar.AddClass('spec-borrowed');
		avatar.SetParent(frame);
	}
	var faces = avatar.FindChildrenWithClassTraverse('HudSpecplayerRoot__avatar');
	var face = Sp.avatar - 2 * Sp.avatarInset;
	for (var at = 0; at < faces.length; ++at) {
		SpSet(faces[at], 'width', face + 'px');
		SpSet(faces[at], 'height', face + 'px');
		SpSet(faces[at], 'borderRadius', '0px');
	}
};

var SpParkStock = function (owner) {
	if (SpVoid && !SpVoid.IsValid())
		SpVoid = contextPanel.FindChildTraverse('SpecVoid');
	if (!SpVoid && SpOwner && SpOwner.IsValid()) {
		SpVoid = $.CreatePanel('Panel', SpOwner, 'SpecVoid');
		SpVoid.hittest = false;
		SpSet(SpVoid, 'width', '0px');
		SpSet(SpVoid, 'height', '0px');
		SpSet(SpVoid, 'visibility', 'collapse');
	}
	if (!SpVoid)
		return;
	for (var victim of ['jsHudSpecplayer__Bg', 'HudHighlightClip']) {
		var panel = owner.FindChildTraverse(victim);
		if (panel && panel.GetParent() !== SpVoid) {
			panel.SetParent(SpVoid);
		}
		if (panel) {
			SpSet(panel, 'visibility', 'collapse');
			SpSet(panel, 'y', Sp.park + 'px');
		}
	}
};

if (SpOwner)
	SpBuild(SpOwner);

var SpGeneration = (typeof SpGeneration === 'undefined' ? 0 : SpGeneration) + 1;

var SpTick = function (generation) {
	if (generation !== SpGeneration)
		return;
	try {
		SpWatch();
	} catch (error) {
			}
	$.Schedule(0.25, function () {
		SpTick(generation);
	});
};

var SpWatch = function () {
	var owner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');
	if (!owner)
		return;

	var plate = owner.FindChildTraverse('Spec');
	if (!plate || !plate.IsValid())
		plate = SpBuild(owner);

	var watching = SpWatching(owner) || SpHudDiffers();
	if (plate) {
		if (plate.SpUp !== watching) {
			plate.SpUp = watching;
			SpSet(plate, 'opacity', watching ? '1.0' : '0.0');
		}
		if (!watching)
			return;

		var name = SpRead(owner, SpSources.name);
		var weapon = SpMarkup(SpRead(owner, SpSources.weapon));
		var team = SpTeam(owner);

		var nameLabel = plate.FindChildTraverse('SpecName');
		if (nameLabel && nameLabel.text !== name)
			nameLabel.text = name;
		var weaponLabel = plate.FindChildTraverse('SpecWeapon');
		if (weaponLabel && weaponLabel.SpWeaponText !== weapon) {
			weaponLabel.SpWeaponText = weapon;
			weaponLabel.text = weapon;
		}

		if (plate.SpSide !== team) {
			plate.SpSide = team;
			PaintArt(plate, team === 't' ? 'gotvt' : 'gotvct', {opacity: Sp.plateOpacity});
			if (nameLabel)
				SpSet(nameLabel, 'color', team === 'ct' ? Sp.nameCt
					: (team === 't' ? Sp.nameT : Sp.nameNone));
		}
	}

	try {
		SpParkStock(owner);
	} catch (error) {
			}
	try {
		SpReclaimAvatar(owner, plate);
	} catch (error) {
			}
};

SpTick(SpGeneration);
