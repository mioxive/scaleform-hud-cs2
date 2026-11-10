var Pb = {
	width: 475,
	marginLeft: 130,
	marginTop: 32,

	anchorHeight: '50%',
	bg: 'gradient( linear, 0% 0%, 100% 0%, from( #000000BB ),' + ' color-stop( 0.7, #000000BB ), to( #00000000 ) )',

	iconSize: 114,
	iconMargin: -56,

	rowMarginLeft: 8,
	rowMarginTop: 11,

	titleFont: 24,
	titleColor: '#FFFFFF',
	timeFont: 24,
	timeColor: '#ff6060',

	textWidth: 360,
	trackWidth: 230,
	trackHeight: 13,
	trackMarginLeft: 0,
	trackBg: 'gradient( linear, 0% 0%, 100% 0%, from( #26262676 ),' + ' color-stop( 0.5, #26262676 ), to( #00000000 ) )',

	fillHeight: 9,
	fillColor: '#ff2222FF',

	infoFont: 22,
	infoColor: '#ffffff',
	infoOpacity: '0.9',
	infoMarginLeft: 0,
	infoMarginTop: 3,

	fade: 0.2,
	park: -3000,
	titleFallback: 'Defuse Time:',
};

var PbFailures = {};

var PbSet = function (panel, property, value) {
	if (!panel)
		return;
	try {
		panel.style[property] = value;
	} catch (error) {
		if (!PbFailures[property]) {
			PbFailures[property] = true;
					}
	}
};

var PbLocalize = function (token) {
	var text = $.Localize(token);
	return (text && text.length > 1 && text.charAt(0) !== '#') ? text : null;
};

var PbTitleCache = (typeof PbTitleCache === 'undefined' ? null : PbTitleCache);

var PbTitleText = function () {
	if (!PbTitleCache)
		PbTitleCache = PbLocalize('#SFUIHUD_InfoPanel_DefuseTitle') || Pb.titleFallback;
	return PbTitleCache;
};

var PbSeconds = function (text) {
	var raw = String(text === undefined || text === null ? '' : text).trim();
	if (!raw)
		return null;
	var parts = raw.split(':');
	var total = 0;
	for (var at = 0; at < parts.length; ++at) {
		var piece = parseFloat(parts[at]);
		if (!isFinite(piece) || piece < 0)
			return null;
		total = total * 60 + piece;
	}
	return total;
};

var PbFraction = function (remaining, total) {
	if (!(total > 0) || remaining === null || remaining === undefined)
		return null;
	var fraction = remaining / total;
	return fraction < 0 ? 0 : (fraction > 1 ? 1 : fraction);
};

var PbAdvance = function (shown, fraction) {
	if (fraction === null)
		return null;
	return (shown === undefined || fraction <= shown) ? fraction : null;
};

var PbPark = function (owner) {
	if (!owner || owner.BHasClass('progress-parked'))
		return;
	owner.AddClass('progress-parked');
	PbSet(owner, 'y', Pb.park + 'px');
};

var PbOld = contextPanel.FindChildTraverse('ProgressAnchor');
if (PbOld)
	PbOld.DeleteAsync(0);

var PbAnchor = $.CreatePanel('Panel', contextPanel, 'ProgressAnchor');
PbAnchor.hittest = false;
PbAnchor.hittestchildren = false;
PbSet(PbAnchor, 'width', '100%');
PbSet(PbAnchor, 'height', Pb.anchorHeight);
PbSet(PbAnchor, 'horizontalAlign', 'center');
PbSet(PbAnchor, 'verticalAlign', 'bottom');
PbSet(PbAnchor, 'overflow', 'noclip');
PbSet(PbAnchor, 'zIndex', '20');

var PbBar = $.CreatePanel('Panel', PbAnchor, 'Progress');
PbBar.hittest = false;
var PbIconInset = -Pb.iconMargin;
PbSet(PbBar, 'width', (Pb.width + PbIconInset) + 'px');
PbSet(PbBar, 'height', Pb.iconSize + 'px');
PbSet(PbBar, 'horizontalAlign', 'center');
PbSet(PbBar, 'verticalAlign', 'top');
PbSet(PbBar, 'marginTop', Pb.marginTop + 'px');
PbSet(PbBar, 'marginLeft', (Pb.marginLeft - PbIconInset) + 'px');
PbSet(PbBar, 'flowChildren', 'none');
PbSet(PbBar, 'overflow', 'noclip');
PbSet(PbBar, 'opacity', '0.0');
PbSet(PbBar, 'transitionProperty', 'opacity');
PbSet(PbBar, 'transitionDuration', Pb.fade + 's');
PbSet(PbBar, 'transitionDelay', '0s');
PbSet(PbBar, 'transitionTimingFunction', 'linear');

var PbBackground = $.CreatePanel('Panel', PbBar, 'ProgressBackground');
PbBackground.hittest = false;
PbSet(PbBackground, 'x', PbIconInset + 'px');
PbSet(PbBackground, 'width', Pb.width + 'px');
PbSet(PbBackground, 'height', '100%');
PbSet(PbBackground, 'backgroundColor', Pb.bg);

var PbIcon = $.CreatePanel('Panel', PbBar, 'ProgressIcon');
PbIcon.hittest = false;
PbSet(PbIcon, 'width', Pb.iconSize + 'px');
PbSet(PbIcon, 'height', Pb.iconSize + 'px');
PbSet(PbIcon, 'x', '0px');
PbSet(PbIcon, 'verticalAlign', 'center');
PbSet(PbIcon, 'zIndex', '1');
for (var PbToken of ['defuseicon', 'alerticon']) {
	var PbLayer = $.CreatePanel('Panel', PbIcon, 'ProgressIcon_' + PbToken);
	PbLayer.hittest = false;
	PbSet(PbLayer, 'width', '100%');
	PbSet(PbLayer, 'height', '100%');
	PaintArt(PbLayer, PbToken, {size: 'contain'});
}

var PbWarmOld = contextPanel.FindChildTraverse('ProgressWarm');
if (PbWarmOld)
	PbWarmOld.DeleteAsync(0);

var PbCol = $.CreatePanel('Panel', PbBar, 'ProgressCol');
PbCol.hittest = false;
PbSet(PbCol, 'flowChildren', 'down');
PbSet(PbCol, 'width', Pb.textWidth + 'px');
PbSet(PbCol, 'height', 'fit-children');
PbSet(PbCol, 'x', (Pb.iconSize + Pb.rowMarginLeft) + 'px');
PbSet(PbCol, 'marginTop', Pb.rowMarginTop + 'px');

var PbRow = $.CreatePanel('Panel', PbCol, 'ProgressRow');
PbRow.hittest = false;
PbSet(PbRow, 'width', '100%');
PbSet(PbRow, 'height', Pb.titleFont + 'px');

var PbTitle = $.CreatePanel('Label', PbRow, 'ProgressTitle');
PbTitle.hittest = false;
PbSet(PbTitle, 'horizontalAlign', 'left');
PbSet(PbTitle, 'verticalAlign', 'center');
PbSet(PbTitle, 'fontFamily', 'Stratum2');
PbSet(PbTitle, 'fontWeight', 'bold');
PbSet(PbTitle, 'fontSize', Pb.titleFont + 'px');
PbSet(PbTitle, 'lineHeight', Pb.titleFont + 'px');
PbSet(PbTitle, 'letterSpacing', '0px');
PbSet(PbTitle, 'color', Pb.titleColor);
PbTitle.text = PbTitleText();

var PbTime = $.CreatePanel('Label', PbRow, 'ProgressTime');
PbTime.hittest = false;
PbSet(PbTime, 'horizontalAlign', 'right');
PbSet(PbTime, 'verticalAlign', 'center');
PbSet(PbTime, 'textAlign', 'right');
PbSet(PbTime, 'fontFamily', 'Stratum2');
PbSet(PbTime, 'fontWeight', 'bold');
PbSet(PbTime, 'fontSize', Pb.timeFont + 'px');
PbSet(PbTime, 'lineHeight', Pb.timeFont + 'px');
PbSet(PbTime, 'color', Pb.timeColor);

var PbTrack = $.CreatePanel('Panel', PbCol, 'ProgressTrack');
PbTrack.hittest = false;
PbSet(PbTrack, 'width', Pb.trackWidth + 'px');
PbSet(PbTrack, 'height', Pb.trackHeight + 'px');
PbSet(PbTrack, 'marginLeft', Pb.trackMarginLeft + 'px');
PbSet(PbTrack, 'horizontalAlign', 'left');
PbSet(PbTrack, 'backgroundColor', Pb.trackBg);

var PbFill = $.CreatePanel('Panel', PbTrack, 'ProgressFill');
PbFill.hittest = false;
PbSet(PbFill, 'width', '100%');
PbSet(PbFill, 'height', Pb.fillHeight + 'px');
PbSet(PbFill, 'horizontalAlign', 'left');
PbSet(PbFill, 'verticalAlign', 'center');
PbSet(PbFill, 'backgroundColor', Pb.fillColor);

var PbInfo = $.CreatePanel('Label', PbCol, 'ProgressInfo');
PbInfo.hittest = false;
PbSet(PbInfo, 'width', '100%');
PbSet(PbInfo, 'horizontalAlign', 'left');
PbSet(PbInfo, 'textAlign', 'left');
PbSet(PbInfo, 'marginLeft', Pb.infoMarginLeft + 'px');
PbSet(PbInfo, 'marginTop', Pb.infoMarginTop + 'px');
PbSet(PbInfo, 'fontFamily', 'Stratum2');
PbSet(PbInfo, 'fontWeight', 'medium');
PbSet(PbInfo, 'fontSize', Pb.infoFont + 'px');
PbSet(PbInfo, 'lineHeight', '24px');
PbSet(PbInfo, 'letterSpacing', '0px');
PbSet(PbInfo, 'color', Pb.infoColor);
PbSet(PbInfo, 'opacity', Pb.infoOpacity);
PbSet(PbInfo, 'textOverflow', 'shrink');

var PbCountdown = function (owner) {
	var found = owner.FindChildrenWithClassTraverse('hud-progress-bar-info-countdown-text');
	return (found && found.length) ? found[0] : null;
};

var PbRead = function (panel) {
	if (!panel)
		return '';
	try {
		return String(panel.text === undefined || panel.text === null ? '' : panel.text);
	} catch (error) {
		return '';
	}
};

var PbWrite = function (panel, text) {
	if (!panel || panel.Text === text)
		return;
	panel.Text = text;
	panel.text = text;
};

var PbWatch = function () {
	var owner = contextPanel.FindChildTraverse('HudProgressBar');
	var bar = contextPanel.FindChildTraverse('Progress');
	if (!owner || !bar)
		return;
	PbPark(owner);
	var icon = bar.FindChildTraverse('ProgressIcon');
	var time = bar.FindChildTraverse('ProgressTime');
	var fill = bar.FindChildTraverse('ProgressFill');
	var info = bar.FindChildTraverse('ProgressInfo');
	if (!icon || !time || !fill || !info)
		return;

	var up = owner.BHasClass('hud-progress-bar--visible');
	var defusing = owner.BHasClass('hud-progress-bar__defuse')
		|| owner.BHasClass('hud-progress-bar__defuse-nokit');
	PbSet(icon.FindChildTraverse('ProgressIcon_defuseicon'), 'visibility', defusing ? 'visible' : 'collapse');
	PbSet(icon.FindChildTraverse('ProgressIcon_alerticon'), 'visibility', defusing ? 'collapse' : 'visible');

	if (up) {
		var raw = PbRead(PbCountdown(owner));
		var remaining = PbSeconds(raw);

		if (remaining !== null && remaining > 0 && !(bar.Total > 0))
			bar.Total = remaining;

		if (owner.BHasClass('hud-progress-bar--switched')) {
			if (!bar.Switched) {
				bar.Switched = true;
				if (remaining !== null && remaining > 0)
					bar.Total = remaining;
				bar.Shown = undefined;
			}
		} else {
			bar.Switched = false;
		}

		var fraction = PbAdvance(bar.Shown, PbFraction(remaining, bar.Total));
		if (fraction !== null) {
			bar.Shown = fraction;
			PbSet(fill, 'width', (fraction * 100) + '%');
		}

		PbWrite(time, raw);
		PbWrite(info, PbRead(owner.FindChildTraverse('ActionLabel')));
	}

	var state = up ? 'up' : 'down';
	if (bar.State === state)
		return;
	var was = bar.State;
	bar.State = state;

	if (state === 'up') {
		PbSet(bar, 'opacity', '1.0');
	} else if (was === 'up') {
		PbSet(bar, 'opacity', '0.0');
		bar.Total = null;
		bar.Shown = undefined;
		bar.Switched = false;
		PbSet(fill, 'width', '100%');
	} else {
		return;
	}
};

var PbGeneration = (typeof PbGeneration === 'undefined' ? 0 : PbGeneration) + 1;

var PbTick = function (generation) {
	if (generation !== PbGeneration)
		return;
	try {
		PbWatch();
	} catch (error) {
			}
	$.Schedule(0.1, function () {
		PbTick(generation);
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		PbTick(generation);
	};
})(PbGeneration));
