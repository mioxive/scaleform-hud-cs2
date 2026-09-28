var Msg = {
	width: 440,
	height: 107,
	nudge: 130,
	raise: 173,
	fade: '0.2s',
	park: -3000,
	bg: 'gradient( linear, 0% 0%, 100% 0%, from( #000000BB ), color-stop( 0.7, #000000BB ), to( #00000000 ) )',
	bgStart: 'gradient( linear, 0% 0%, 100% 0%, from( #000000BB ), color-stop( 0.2, #00000000 ), to( #00000000 ) )',

	icon: 108,
	iconLeft: -54,
	iconEdge: -2,
	textLeft: 7,

	alertColor: '#ff5454',
	alertSize: 24,
	textSize: 22,
	textLine: 23,
	textMax: 340,
	textOpacity: '0.9',
	textTop: 9,
	textBottom: 8,

	chatBottom: 54,
	chatBg: '#00000099',
};

var MsgOnce = function (panel, marker, write) {
	if (!panel || panel.BHasClass(marker))
		return false;
	panel.AddClass(marker);
	write(panel);
	return true;
};

var MsgAlive = function (panel) {
	try {
		return !!(panel && panel.IsValid());
	} catch (error) {
		return false;
	}
};

var MsgAlertText = function () {
	var text = $.Localize('#UI_Alert');
	return (!text || text.charAt(0) === '#') ? 'ALERT' : text;
};

var MsgSources = [];
for (var MsgFound of contextPanel.FindChildrenWithClassTraverse('hud-hint')) {
	MsgSources.push({
		root: MsgFound,
		label: MsgFound.FindChildTraverse('JsHintLabel'),
		high: MsgFound.BHasClass('high-priority'),
	});
	MsgOnce(MsgFound, 'msg-parked', function (panel) {
		panel.style.y = Msg.park + 'px';
	});
}

MsgSources.sort(function (a, b) {
	return (b.high ? 1 : 0) - (a.high ? 1 : 0);
});

var MsgOldBar = contextPanel.FindChildTraverse('Hint');
if (MsgOldBar)
	MsgOldBar.DeleteAsync(0);

var MsgBar = $.CreatePanel('Panel', contextPanel, 'Hint');
MsgBar.hittest = false;
MsgBar.style.width = Msg.width + 'px';
MsgBar.style.height = Msg.height + 'px';
MsgBar.style.flowChildren = 'right';
MsgBar.style.horizontalAlign = 'center';
MsgBar.style.verticalAlign = 'bottom';
MsgBar.style.marginBottom = Msg.raise + 'px';
MsgBar.style.marginLeft = Msg.nudge + 'px';
MsgBar.style.backgroundColor = Msg.bgStart;
MsgBar.style.overflow = 'noclip';
MsgBar.style.opacity = '0.0';

MsgBar.style.transitionProperty = 'background-color';
MsgBar.style.transitionDuration = Msg.fade;
MsgBar.style.transitionTimingFunction = 'ease-in-out';

var MsgIcon = $.CreatePanel('Panel', MsgBar, 'HintIcon');
MsgIcon.hittest = false;
MsgIcon.style.width = Msg.icon + 'px';
MsgIcon.style.height = Msg.icon + 'px';
MsgIcon.style.marginLeft = Msg.iconLeft + 'px';
MsgIcon.style.marginTop = Msg.iconEdge + 'px';
MsgIcon.style.marginBottom = Msg.iconEdge + 'px';
MsgIcon.style.verticalAlign = 'center';
PaintArt(MsgIcon, 'alerticon', {size: 'contain'});

var MsgColumn = $.CreatePanel('Panel', MsgBar, 'HintText');
MsgColumn.hittest = false;
MsgColumn.style.flowChildren = 'down';
MsgColumn.style.verticalAlign = 'top';
MsgColumn.style.horizontalAlign = 'left';
MsgColumn.style.height = 'fit-children';
MsgColumn.style.marginLeft = Msg.textLeft + 'px';
MsgColumn.style.paddingTop = Msg.textTop + 'px';
MsgColumn.style.paddingBottom = Msg.textBottom + 'px';

var MsgAlert = $.CreatePanel('Label', MsgColumn, 'HintAlert');
MsgAlert.hittest = false;
MsgAlert.text = MsgAlertText();
MsgAlert.style.color = Msg.alertColor;
MsgAlert.style.fontFamily = 'Stratum2';
MsgAlert.style.fontWeight = 'medium';
MsgAlert.style.fontSize = Msg.alertSize + 'px';
MsgAlert.style.letterSpacing = '0px';
MsgAlert.style.paddingBottom = '1px';
MsgAlert.style.horizontalAlign = 'left';
MsgAlert.style.textAlign = 'left';

var MsgLabel = $.CreatePanel('Label', MsgColumn, 'HintLabel');
MsgLabel.hittest = false;
MsgLabel.style.color = '#ffffff';
MsgLabel.style.opacity = Msg.textOpacity;
MsgLabel.style.fontFamily = 'Stratum2';
MsgLabel.style.fontWeight = 'medium';
MsgLabel.style.fontSize = Msg.textSize + 'px';
MsgLabel.style.lineHeight = Msg.textLine + 'px';
MsgLabel.style.maxWidth = Msg.textMax + 'px';
MsgLabel.style.letterSpacing = '0px';
MsgLabel.style.horizontalAlign = 'left';
MsgLabel.style.textAlign = 'left';

var MsgPlain = function (text) {
	return text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
};

var MsgWatch = function () {
	for (var at = MsgSources.length - 1; at >= 0; --at) {
		var parked = MsgSources[at];
		if (!MsgAlive(parked.root)) {
			MsgSources.splice(at, 1);
			continue;
		}
		try {
			MsgOnce(parked.root, 'msg-parked', function (panel) {
				panel.style.y = Msg.park + 'px';
			});
		} catch (error) {
		}
	}

	if (!MsgSources.length) {
		for (var fresh of contextPanel.FindChildrenWithClassTraverse('hud-hint')) {
			var freshLabel = null;
			var freshHigh = false;
			try {
				freshLabel = fresh.FindChildTraverse('JsHintLabel');
				freshHigh = fresh.BHasClass('high-priority');
			} catch (error) {
				continue;
			}
			try {
				fresh.style.y = Msg.park + 'px';
				fresh.AddClass('msg-parked');
			} catch (error) {
			}
			MsgSources.push({root: fresh, label: freshLabel, high: freshHigh});
		}
		MsgSources.sort(function (a, b) {
			return (b.high ? 1 : 0) - (a.high ? 1 : 0);
		});
	}

	var live = null;
	var text = '';
	for (var src of MsgSources) {
		if (!MsgAlive(src.root))
			continue;
		var visible = false;
		try {
			visible = src.root.BHasClass('hud-hint--visible');
		} catch (error) {
			continue;
		}
		if (!visible)
			continue;

		var found = '';
		try {
			found = (src.label && src.label.text) || '';
		} catch (error) {
			found = '';
		}
		if (!found)
			continue;
		live = src;
		text = MsgPlain(found);
		break;
	}

	var shown = live ? 1 : 0;
	if (MsgBar.Shown !== shown) {
		MsgBar.Shown = shown;
		MsgBar.style.opacity = shown ? '1.0' : '0.0';
		MsgBar.style.backgroundColor = shown ? Msg.bg : Msg.bgStart;
	}
	if (!live)
		return;

	if (MsgLabel.Text !== text) {
		MsgLabel.Text = text;
		MsgLabel.text = text;
	}
};

var MsgRadioDress = function () {
	var root = contextPanel.FindChildTraverse('HudRadio');
	if (!root)
		return;
	MsgOnce(root.FindChildTraverse('RadioPanelBG'), 'msg-radio-bg', function (panel) {
		panel.style.width = '100%';
		panel.style.height = '100%';
		panel.style.backgroundColor = '#000000';
		panel.style.opacity = '0.45';
	});
	MsgOnce(root.FindChildTraverse('RadioPanel'), 'msg-radio-box', function (panel) {
		panel.style.fontFamily = 'Stratum2';
		panel.style.fontWeight = 'normal';
		panel.style.backgroundColor = '#000000b3';
		panel.style.paddingBottom = '12px';
		panel.style.margin = '8px';
	});
	for (var opts of root.FindChildrenWithClassTraverse('RadioTextOptions'))
		MsgOnce(opts, 'msg-radio-opt', function (panel) {
			panel.style.fontSize = '18px';
			panel.style.color = '#CCCCCC';
			panel.style.margin = '0px 0px 0px 12px';
		});
};

var MsgRadioHeads = function () {
	var root = contextPanel.FindChildTraverse('HudRadio');
	if (!root)
		return;
	for (var head of root.FindChildrenWithClassTraverse('RadioTextHeading'))
		MsgOnce(head, 'msg-radio-head', function (panel) {
			panel.style.fontWeight = 'bold';
			panel.style.fontSize = '24px';
			panel.style.color = '#999999';
			panel.style.textTransform = 'uppercase';
			panel.style.letterSpacing = '0.5px';
			panel.style.textShadow = '1px 1px 1px 1.0 #000000';
		});
};

var MsgGeneration = (typeof MsgGeneration === 'undefined' ? 0 : MsgGeneration) + 1;

var MsgTick = function (generation) {
	if (generation !== MsgGeneration)
		return;
	try {
		MsgWatch();
	} catch (error) {
			}
	try {
		MsgRadioHeads();
	} catch (error) {
			}
	try {
		MsgRadioDress();
	} catch (error) {
			}
	$.Schedule(0.1, function () {
		MsgTick(generation);
	});
};

$.Schedule(0.1, (function (generation) {
	return function () {
		MsgTick(generation);
	};
})(MsgGeneration));
