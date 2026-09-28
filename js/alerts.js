var Al = {
	width: 700,
	height: 41,
	top: 300,
	bg: 'gradient( linear, 0% 0%, 100% 0%, from( #77777700 ), color-stop( 0.20, #00000099 ),'
		+ ' color-stop( 0.40, #00000099 ), color-stop( 0.60, #00000099 ),'
		+ ' color-stop( 0.80, #00000099 ), to( #00000000 ) )',

	fontSize: 32,
	textTop: 1,
	color: '#FFFFFF',
	matchStartColor: '#e10000',
	replayColor: '#c9c9c9',
	fade: 0.3,
	hideDuration: 1.0,
	hide: [
		{at: 0.00, opacity: '0.65', lit: false},
		{at: 0.21, opacity: '1.0', lit: true},
		{at: 0.42, opacity: '0.65', lit: false},
		{at: 1.00, opacity: '0.0', lit: false},
	],
	flashBrightness: '2.0',
	restBrightness: '1.0',
	park: -3000,
};

var AlOwner = contextPanel.FindChildTraverse('HudAlerts');

var AlPark = function (owner) {
	if (!owner)
		return false;
	if (owner.BHasClass('alert-parked')) {
		var held = true;
		try {
			var y = owner.style.y;
			if (typeof y === 'string' && y !== '')
				held = (y === Al.park + 'px');
		} catch (error) {
			held = true;
		}
		if (held)
			return false;
	}
	owner.AddClass('alert-parked');
	owner.style.y = Al.park + 'px';
	return true;
};

if (AlOwner)
	AlPark(AlOwner);

var AlOld = contextPanel.FindChildTraverse('Alert');
if (AlOld)
	AlOld.DeleteAsync(0);

var AlBar = $.CreatePanel('Panel', contextPanel, 'Alert');
AlBar.hittest = false;
AlBar.style.width = Al.width + 'px';
AlBar.style.height = Al.height + 'px';
AlBar.style.horizontalAlign = 'center';
AlBar.style.verticalAlign = 'top';
AlBar.style.marginTop = Al.top + 'px';
AlBar.style.backgroundColor = Al.bg;
AlBar.style.zIndex = '20';
AlBar.style.opacity = '0.0';
AlBar.style.brightness = Al.restBrightness;
AlBar.style.transitionProperty = 'opacity, brightness';
AlBar.style.transitionDuration = Al.fade + 's, ' + Al.fade + 's';
AlBar.style.transitionTimingFunction = 'linear';

var AlLabel = $.CreatePanel('Label', AlBar, 'AlertBarText');
AlLabel.hittest = false;
AlLabel.style.width = '100%';
AlLabel.style.horizontalAlign = 'center';
AlLabel.style.verticalAlign = 'center';
AlLabel.style.marginTop = Al.textTop + 'px';
AlLabel.style.textAlign = 'center';
AlLabel.style.fontFamily = 'Stratum2';
AlLabel.style.fontWeight = 'bold';
AlLabel.style.fontSize = Al.fontSize + 'px';
AlLabel.style.letterSpacing = '0px';
AlLabel.style.color = Al.color;
AlLabel.style.lineHeight = Al.fontSize + 'px';
AlLabel.style.textOverflow = 'shrink';

var AlShow = function (label, text) {
	var want = String(text).toUpperCase();
	if (label.Text === want)
		return;
	label.Text = want;
	label.text = want;
};

var AlDress = function (label, src) {
	var wanted = src.BHasClass('MatchStartAlert') ? Al.matchStartColor
		: (src.BHasClass('ReplayAlert') ? Al.replayColor : Al.color);
	if (label.Color !== wanted) {
		label.Color = wanted;
		label.style.color = wanted;
	}
	var mono = src.BHasClass('MatchAlertTimer');
	if (label.Mono !== mono) {
		label.Mono = mono;
		label.style.fontFamily = mono ? 'Stratum2 Bold Monodigit' : 'Stratum2';
	}
};

var AlHideSerial = (typeof AlHideSerial === 'undefined' ? 0 : AlHideSerial);

var AlLeg = function (bar, mine, span, stop) {
	try {
		if (mine !== AlHideSerial || !bar || !bar.IsValid())
			return;
		bar.style.transitionDuration = span + 's, ' + span + 's';
		bar.style.opacity = stop.opacity;
		bar.style.brightness = stop.lit ? Al.flashBrightness : Al.restBrightness;
	} catch (error) {
			}
};

var AlPlayHide = function (bar) {
	AlHideSerial = AlHideSerial + 1;
	var mine = AlHideSerial;
	var stops = Al.hide;

	AlLeg(bar, mine, 0, stops[0]);
	for (var at = 1; at < stops.length; ++at) {
		(function (index) {
			var from = stops[index - 1];
			var stop = stops[index];
			var span = (stop.at - from.at) * Al.hideDuration;
			$.Schedule(from.at * Al.hideDuration, function () {
				AlLeg(bar, mine, span, stop);
			});
		})(at);
	}
};

var AlRaise = function (bar) {
	AlHideSerial = AlHideSerial + 1;
	bar.style.transitionDuration = Al.fade + 's, ' + Al.fade + 's';
	bar.style.brightness = Al.restBrightness;
	bar.style.opacity = '1.0';
};

	var AlSaidRepark = false;

var AlWatch = function () {
	var owner = contextPanel.FindChildTraverse('HudAlerts');
	if (owner && AlPark(owner) && !AlSaidRepark) {
		AlSaidRepark = true;
	}
	var src = owner ? owner.FindChildTraverse('AlertText') : null;
	var bar = contextPanel.FindChildTraverse('Alert');
	var label = bar ? bar.FindChildTraverse('AlertBarText') : null;
	if (!owner || !src || !bar || !label)
		return;

	var up = (owner.BHasClass('AlertVisible') || owner.BHasClass('FlashAnim'))
		&& !owner.BHasClass('HideFlash');
	if (up) {
		var text = '';
		try {
			text = src.text || '';
		} catch (error) {
			text = '';
		}
		if (!text) {
			up = false;
		} else {
			AlDress(label, src);
			AlShow(label, text);
		}
	}

	var state = up ? 'up' : 'down';
	if (bar.State === state)
		return;
	var was = bar.State;
	bar.State = state;

	if (state === 'up') {
		AlRaise(bar);
	} else if (was === 'up') {
		AlPlayHide(bar);
	} else {
		return;
	}
};

var AlGeneration = (typeof AlGeneration === 'undefined' ? 0 : AlGeneration) + 1;

var AlTick = function (generation) {
	if (generation !== AlGeneration)
		return;
	try {
		AlWatch();
	} catch (error) {
			}
	$.Schedule(0.1, function () {
		AlTick(generation);
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		AlTick(generation);
	};
})(AlGeneration));
