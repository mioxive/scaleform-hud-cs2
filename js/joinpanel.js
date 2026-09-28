var Jp = {
	width: 700,
	height: 56,
	top: 86,
	inset: 2,
	logoScale: 0.75,
	logoOpacity: '0.95',
	logoTop: 2,
	logoLeft: 0,
	verb: 'Playing on team',
	fontSize: 34,
	fontWeight: 'black',
	textTop: 6,
	textOpacity: '0.85',
	letterSpacing: 0,
	color: '#ffffff',
	logoGap: 8,

	fade: 0.6,
	rise: -35,
	hold: 3.0,
	permanent: false,
};

var JpSides = {
	ct: {
		cls: 'HUD--team--ct',
		logo: 's2r://panorama/images/icons/ct_logo.vsvg',
		side: '#counter-terrorists',
		english: 'Counter-Terrorists',
	},
	t: {
		cls: 'HUD--team--terrorist',
		logo: 's2r://panorama/images/icons/t_logo.vsvg',
		side: '#terrorists',
		english: 'Terrorists',
	},
};

var JpLocalize = function (token) {
	try {
		var text = $.Localize(token);
		return (text && text.length > 1 && text.charAt(0) !== '#') ? text : null;
	} catch (error) {
		return null;
	}
};

var JpTextCache = (typeof JpTextCache === 'undefined' ? {} : JpTextCache);

var JpText = function (which) {
	var key = which + '|' + Jp.verb;
	if (JpTextCache[key])
		return JpTextCache[key];
	var side = JpSides[which];
	var whole = (Jp.verb + ' ' + (JpLocalize(side.side) || side.english)).toUpperCase();
	JpTextCache[key] = whole;
	return whole;
};

var JpTeam = function () {
	try {
		var team = GameStateAPI.GetPlayerTeamNumber(GameStateAPI.GetLocalPlayerXuid());
		if (team === 3)
			return 'ct';
		if (team === 2)
			return 't';
	} catch (error) {
	}
	for (var at = contextPanel; at; at = at.GetParent()) {
		if (at.BHasClass(JpSides.ct.cls))
			return 'ct';
		if (at.BHasClass(JpSides.t.cls))
			return 't';
	}
	for (var cls of [JpSides.ct.cls, JpSides.t.cls]) {
		if (contextPanel.FindChildrenWithClassTraverse(cls).length)
			return cls === JpSides.ct.cls ? 'ct' : 't';
	}
	return null;
};

var JpOld = contextPanel.FindChildTraverse('Join');
if (JpOld)
	JpOld.DeleteAsync(0);

var JpBar = $.CreatePanel('Panel', contextPanel, 'Join');
JpBar.hittest = false;
JpBar.style.width = Jp.width + 'px';
JpBar.style.height = Jp.height + 'px';
JpBar.style.horizontalAlign = 'center';
JpBar.style.verticalAlign = 'top';
JpBar.style.marginTop = Jp.top + 'px';
JpBar.style.zIndex = '21';
JpBar.style.overflow = 'noclip';
JpBar.style.opacity = '0.0';
JpBar.style.transform = 'translateY(' + Jp.rise + 'px)';
JpBar.style.transitionProperty = 'opacity, transform';
JpBar.style.transitionDuration = Jp.fade + 's, ' + Jp.fade + 's';
JpBar.style.transitionTimingFunction = 'linear';
PaintArt(JpBar, 'joinplate');

var JpLogoBox = Math.round(Jp.height * Jp.logoScale);
var JpLogo = $.CreatePanel('Image', JpBar, 'JoinLogo');
JpLogo.hittest = false;
JpLogo.SetImage(JpSides.ct.logo);
JpLogo.style.width = JpLogoBox + 'px';
JpLogo.style.height = JpLogoBox + 'px';
JpLogo.style.horizontalAlign = 'left';
JpLogo.style.verticalAlign = 'top';
JpLogo.style.marginLeft = (Jp.inset + Jp.logoLeft) + 'px';
JpLogo.style.marginTop = (Jp.inset + Jp.logoTop) + 'px';
JpLogo.style.opacity = Jp.logoOpacity;

var JpTextLeft = Jp.inset + JpLogoBox + Jp.logoGap;
var JpTextWidth = Jp.width - JpTextLeft - 12;

var JpTextZone = $.CreatePanel('Panel', JpBar, 'JoinTextZone');
JpTextZone.hittest = false;
JpTextZone.style.width = JpTextWidth + 'px';
JpTextZone.style.height = '100%';
JpTextZone.style.marginLeft = JpTextLeft + 'px';
JpTextZone.style.overflow = 'noclip';

var JpLabel = $.CreatePanel('Label', JpTextZone, 'JoinText');
JpLabel.hittest = false;
JpLabel.style.width = 'fit-children';
JpLabel.style.height = (Jp.fontSize + 4) + 'px';
JpLabel.style.horizontalAlign = 'center';
JpLabel.style.verticalAlign = 'top';
JpLabel.style.marginTop = (Jp.inset + Jp.textTop) + 'px';
JpLabel.style.textAlign = 'center';
JpLabel.style.fontFamily = 'Stratum2';
JpLabel.style.fontWeight = Jp.fontWeight;
JpLabel.style.fontSize = Jp.fontSize + 'px';
JpLabel.style.lineHeight = Jp.fontSize + 'px';
JpLabel.style.letterSpacing = Jp.letterSpacing + 'px';
JpLabel.style.color = Jp.color;
JpLabel.style.opacity = Jp.textOpacity;
JpLabel.style.whiteSpace = 'nowrap';

var JpFitFont = function (label, max) {
	if (!label)
		return;
	var size = Jp.fontSize;
	var tries = 0;
	var step = function () {
		if (!label.IsValid())
			return;
		var scale = label.actualuiscale_x || 1;
		var width = label.actuallayoutwidth / scale;
		if (width > 0 && (width <= max || tries >= 6))
			return;
		if (width > 0)
			tries += 1;
		size -= 2;
		if (size < 18)
			return;
		label.style.fontSize = size + 'px';
		label.style.lineHeight = size + 'px';
		label.style.height = (size + 4) + 'px';
		$.Schedule(0.05, step);
	};
	$.Schedule(0.05, step);
};

var JpHide = function (bar) {
	if (!bar || !bar.IsValid() || !bar.Shown)
		return;
	bar.Shown = false;
	bar.style.opacity = '0.0';
	bar.style.transform = 'translateY(' + Jp.rise + 'px)';
};

var JpSerial = (typeof JpSerial === 'undefined' ? 0 : JpSerial);

var JpShow = function (bar, which) {
	var side = JpSides[which];
	var logo = bar.FindChildTraverse('JoinLogo');
	var label = bar.FindChildTraverse('JoinText');
	if (!logo || !label)
		return;
	logo.SetImage(side.logo);
	label.text = JpText(which);
	label.FitSize = Jp.fontSize;
	label.style.fontSize = Jp.fontSize + 'px';
	label.style.lineHeight = Jp.fontSize + 'px';
	label.style.height = (Jp.fontSize + 4) + 'px';
	JpFitFont(label, JpTextWidth - 8);
	bar.Shown = true;
	bar.style.opacity = '1.0';
	bar.style.transform = 'translateY(0px)';

	JpSerial = JpSerial + 1;
	if (Jp.permanent) {
		return;
	}
	var mine = JpSerial;
	$.Schedule(Jp.fade + Jp.hold, function () {
		try {
			if (mine === JpSerial)
				JpHide(bar);
		} catch (error) {
					}
	});
};

var JpGates = {
	live: 'HUD--HA--active',
	intro: 'HUD--team-preview-camera',
};

var JpGamephase = function () {
	try {
		var data = GameStateAPI.GetTimeDataJSO();
		return data ? Number(data.gamephase) : -1;
	} catch (error) {
		return -1;
	}
};

var JpReady = function () {
	if (JpGamephase() !== 2 && JpGamephase() !== 3)
		return false;
	for (var at = contextPanel; at; at = at.GetParent())
		if (at.BHasClass(JpGates.intro))
			return false;
	var owner = contextPanel.FindChildTraverse('jsHudHealthArmorAmmoMore');
	return !!owner && owner.BHasClass(JpGates.live);
};

var JpWatch = function () {
	var bar = contextPanel.FindChildTraverse('Join');
	if (!bar)
		return;
	var team = JpTeam();
	var ready = JpReady();

	if (typeof bar.Seed === 'undefined') {
		bar.Seed = team;

		bar.Owed = !!team;
		return;
	}

	if (bar.Seed !== team) {
		bar.Seed = team;
		bar.Owed = !!team;
	}

	if (!bar.Owed || !team || !ready)
		return;
	bar.Owed = false;
	JpShow(bar, team);
};

var JpGeneration = (typeof JpGeneration === 'undefined' ? 0 : JpGeneration) + 1;

var JpTick = function (generation) {
	if (generation !== JpGeneration)
		return;
	try {
		JpWatch();
	} catch (error) {
			}
	$.Schedule(0.25, function () {
		JpTick(generation);
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		JpTick(generation);
	};
})(JpGeneration));
