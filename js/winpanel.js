var Win = {
	y: 112,
	width: 818,
	height: 126,
	titleSize: 38,
	titleTop: 9,
	titleColor: '#b9bfc5',
	mvpLeft: 21,
	mvpBottom: 6,
	avatar: 60,
	avatarBg: 'gradient( linear, 0% 0%, 0% 100%, from( #7d7d7d ), to( #464646) )',
	avatarShadow: '#000000A5 0px 0px 3px 2px',
	star: 16,
	starColor: '#ffd856',
	nameSize: 20,
	nameColor: '#c4c4c471',
	kitSize: 15,
	kitColor: '#bcbcbc9A',
	funfactSize: 19,
	funfactColor: '#FFFFFFC1',
	funfactBg: '#000000AE',
	flash: 0.4,
	flashIn: 0.16,
	fact: 0.22,
	factDrop: 110,
	hide: 0.2,
};

var WinDrawBg = 'gradient( linear, 100% 0%, 0% 0%, from( #00000000 ), color-stop( 0.20, #00000099 ),'
	+ ' color-stop( 0.50, #000000e6 ), color-stop( 0.80, #00000099 ), to( #00000000 ) )';

var WinNoShadow = '0px 0px 0px #00000000';

var WinFirst = function (root, cls) {
	if (!root)
		return null;
	var found = root.FindChildrenWithClassTraverse(cls);
	return found.length ? found[0] : null;
};

var WinOnce = function (panel, marker) {
	if (!panel || panel.BHasClass(marker))
		return false;
	panel.AddClass(marker);
	return true;
};

var WinHasClass = function (from, name) {
	for (var at = from; at; at = at.GetParent()) {
		if (at.BHasClass(name))
			return true;
		if (at === contextPanel)
			break;
	}
	return false;
};

var WinCollapse = function (panel) {
	if (WinOnce(panel, 'win-hidden'))
		panel.style.visibility = 'collapse';
};

var WinTeam = function (root) {
	if (WinHasClass(root, 'WinPanelRoot--Win--CT'))
		return 'ct';
	if (WinHasClass(root, 'WinPanelRoot--Win--T'))
		return 't';
	return 'draw';
};

var WinTitle = function (result) {
	return WinFirst(result, 'win-title') || WinFirst(result, 'WinPanel__Result__Title');
};

var WinTitleCache = (typeof WinTitleCache === 'undefined' ? {} : WinTitleCache);

var WinLocalize = function (token) {
	var text = $.Localize(token);
	return (text && text.length > 1 && text.charAt(0) !== '#') ? text : null;
};

var WinTitleText = function (team) {
	if (team === 'draw')
		return null;
	if (WinTitleCache[team])
		return WinTitleCache[team];
	var whole = team === 'ct'
		? (WinLocalize('#SFUI_Winpanel_ct_win') || WinLocalize('#SFUI_WinPanel_ct_win'))
		: (WinLocalize('#SFUI_Winpanel_t_win') || WinLocalize('#SFUI_WinPanel_t_win'));
	if (!whole) {
		var side = WinLocalize(team === 'ct' ? '#counter-terrorists' : '#terrorists')
			|| (team === 'ct' ? 'Counter-Terrorists' : 'Terrorists');
		whole = side + ' Win';
	}
	WinTitleCache[team] = whole;
	return whole;
};

var WinDressPlate = function (root, result) {
	if (!WinOnce(result, 'win-plate-3'))
		return;
	result.style.width = Win.width + 'px';
	result.style.height = Win.height + 'px';
	result.style.border = '0px solid #00000000';
	result.style.borderRadius = '0px';
	try {
		result.style.worldBlur = 'none';
	} catch (error) {
			}
	var section = WinFirst(root, 'WinPanelTopSection');
	if (section) {
		section.style.width = Win.width + 'px';
		section.style.marginBottom = '0px';
	}
	var contents = WinFirst(root, 'WinPanelTopSection__Contents');
	if (contents)
		contents.style.width = Win.width + 'px';

	var white = WinFirst(result, 'WinPanel__Result__white');
	if (white) {
		white.RemoveClass('win-hidden');
		white.style.visibility = 'visible';
		white.style.transitionProperty = 'opacity';
		white.style.transitionDuration = '0.06s';
		white.style.transitionDelay = '0s';
		white.style.opacity = '0.0';
		var first = result.GetChild(0);
		if (first && first !== white)
			result.MoveChildBefore(white, first);
	}
};

var WinDressTitle = function (title) {
	if (!title)
		return;
	title.AddClass('win-title');
	if (!WinOnce(title, 'win-title-2'))
		return;
	title.RemoveClass('WinPanel__Result__Title');
	title.style.fontFamily = 'Stratum2';
	title.style.fontSize = Win.titleSize + 'px';
	title.style.fontWeight = 'bold';
	title.style.color = Win.titleColor;
	title.style.washColor = '#FFFFFF';
	title.style.textShadow = WinNoShadow;
	title.style.width = '100%';
	title.style.height = (Win.titleSize + 22) + 'px';
	title.style.verticalAlign = 'top';
	title.style.horizontalAlign = 'center';
	title.style.textAlign = 'center';
	title.style.marginTop = Win.titleTop + 'px';
	title.style.marginBottom = '0px';
};

var WinPulse = function (plate, white, up) {
	try {
		if (!plate.BHasClass('win-shown'))
			return;
		plate.style.brightness = up ? '2.0' : '1.0';
		if (white)
			white.style.opacity = up ? '0.4' : '0.0';
	} catch (error) {
			}
};

var WinFadePlate = function (plate, white, shown) {
	if (!plate)
		return;
	if (WinOnce(plate, 'win-fade-1')) {
		plate.style.transform = 'translateY(0px)';
		plate.style.transform = 'none';
		plate.style.transitionProperty = 'opacity, brightness';
		plate.style.transitionDuration = Win.flashIn + 's, 0.06s';
		plate.style.transitionTimingFunction = 'linear';
		plate.style.transitionDelay = '0s';
		plate.style.opacity = '0.0';
		plate.style.brightness = '1.0';
		plate.RemoveClass('win-shown');
	}
	if (plate.BHasClass('win-shown') === shown)
		return;
	plate.SetHasClass('win-shown', shown);
	plate.style.transitionDuration = (shown ? Win.flashIn : Win.hide) + 's, 0.06s';
	plate.style.opacity = shown ? '1.0' : '0.0';
	if (!shown) {
		plate.style.brightness = '1.0';
		if (white)
			white.style.opacity = '0.0';
		return;
	}
	$.Schedule(Win.flash * 0.5, function () {
		WinPulse(plate, white, true);
	});
	$.Schedule(Win.flash * 0.75, function () {
		WinPulse(plate, white, false);
	});
};

var WinSlideRow = function (panel, shown) {
	if (!panel)
		return;

	if (WinOnce(panel, 'win-slide-4')) {

		panel.style.animationName = 'none';
		var stockText = panel.FindChildTraverse('FunFactText');
		if (stockText)
			stockText.style.animationName = 'none';
		panel.style.transitionProperty = 'opacity, transform';
		panel.style.transitionDuration = '0.1s, ' + Win.fact + 's';
		panel.style.transitionTimingFunction = 'linear, ease-out';
		panel.style.transitionDelay = '0s';
		panel.style.transform = 'translateY(' + Win.factDrop + 'px)';
		panel.style.opacity = '0.0';
		panel.RemoveClass('win-shown');
		return;
	}
	if (panel.BHasClass('win-shown') === shown)
		return;
	panel.SetHasClass('win-shown', shown);
	panel.style.transform = shown ? 'translateY(0px)' : 'translateY(' + Win.factDrop + 'px)';
	panel.style.opacity = shown ? '1.0' : '0.0';
};

var WinDressFunfact = function (root) {
	var funfact = root.FindChildTraverse('Funfact');
	var contents = WinFirst(root, 'WinPanelTopSection__Contents');
	if (!funfact || !contents || !WinOnce(funfact, 'win-funfact-2'))
		return;
	if (funfact.GetParent() !== contents) {
		funfact.SetParent(contents);
		var surrender = root.FindChildTraverse('Surrender');
		if (surrender)
			contents.MoveChildBefore(funfact, surrender);
	}
	funfact.style.width = '99.75%';
	funfact.style.horizontalAlign = 'center';
	funfact.style.backgroundColor = Win.funfactBg;
	funfact.style.marginTop = '2px';
	funfact.style.marginLeft = '2px';
	funfact.style.marginRight = '2px';
	funfact.style.padding = '6px 6px 8px 6px';
	funfact.style.height = (Win.funfactSize + 20) + 'px';

	var text = root.FindChildTraverse('FunFactText');
	if (text) {
		text.style.fontSize = Win.funfactSize + 'px';
		text.style.fontWeight = 'medium';
		text.style.color = Win.funfactColor;
		text.style.letterSpacing = '-0.2px';
		text.style.textAlign = 'center';
		text.style.width = '100%';
		text.style.height = (Win.funfactSize + 6) + 'px';
		text.style.margin = '0px';
		text.style.textShadow = WinNoShadow;
	}
};

var WinDressMvp = function (root, result) {
	var mvp = root.FindChildTraverse('MVP');
	if (mvp && WinOnce(mvp, 'win-mvp-2')) {
		if (mvp.GetParent() !== result)
			mvp.SetParent(result);
		mvp.style.verticalAlign = 'bottom';
		mvp.style.horizontalAlign = 'left';
		mvp.style.marginLeft = Win.mvpLeft + 'px';
		mvp.style.marginBottom = Win.mvpBottom + 'px';
		mvp.style.opacity = '1.0';
		mvp.style.transitionDuration = '0.0s';
	}
	if (mvp && mvp.GetParent() === result)
		WinCollapse(WinFirst(root, 'MVP_section'));

	var row = WinFirst(root, 'MVP__Winner');
	if (row && WinOnce(row, 'win-mvp-row')) {
		row.style.height = (Win.avatar + 6) + 'px';
		var icons = WinFirst(root, 'MVP__Winner_Icons');
		if (icons)
			icons.style.height = '100%';
	}

	var avatar = root.FindChildTraverse('MVPAvatar');
	if (avatar && WinOnce(avatar, 'win-avatar')) {
		avatar.style.width = Win.avatar + 'px';
		avatar.style.height = Win.avatar + 'px';
		avatar.style.verticalAlign = 'bottom';
		avatar.style.marginBottom = '3px';
		avatar.style.marginRight = '8px';
		avatar.style.backgroundColor = Win.avatarBg;
		avatar.style.boxShadow = Win.avatarShadow;
	}
	WinCollapse(root.FindChildTraverse('jsHonorIcon'));
};

var WinDressText = function (root) {
	var name = WinFirst(root, 'MVP__WinnerName');
	var reason = WinFirst(root, 'MVP__Reason');
	var row = name ? name.GetParent() : null;

	if (name && WinOnce(name, 'win-name-2')) {
		name.style.fontFamily = 'Stratum2';
		name.style.fontSize = Win.nameSize + 'px';
		name.style.fontWeight = 'medium';
		name.style.color = Win.nameColor;
		name.style.width = 'fit-children';
		name.style.maxWidth = '360px';
		name.style.height = (Win.nameSize + 6) + 'px';
		name.style.verticalAlign = 'middle';
		name.style.paddingLeft = '2px';
		name.style.brightness = '1.0';
		name.style.textShadow = WinNoShadow;
	}

	if (reason && row && WinOnce(reason, 'win-reason-2')) {
		if (reason.GetParent() !== row)
			reason.SetParent(row);
		reason.style.fontFamily = 'Stratum2';
		reason.style.backgroundColor = '#00000000';
		reason.style.color = Win.nameColor;
		reason.style.fontSize = Win.nameSize + 'px';
		reason.style.fontWeight = 'medium';
		reason.style.width = 'fit-children';
		reason.style.height = (Win.nameSize + 6) + 'px';
		reason.style.verticalAlign = 'middle';
		reason.style.padding = '0px';
		reason.style.marginLeft = '4px';
	}

	if (name && reason) {
		var rawName = String(name.text);
		if (rawName !== '' && rawName.indexOf('MVP: ') !== 0)
			name.text = 'MVP: ' + rawName;
		var rawReason = String(reason.text);
		if (rawReason.indexOf('MVP') === 0)
			reason.text = rawReason.substring(3).replace(/^[\s:.-]+/, '');
	}

	if (row && name && !root.FindChildTraverse('MvpStar')) {
		var star = $.CreatePanel('Image', row, 'MvpStar');
		star.SetImage('s2r://panorama/images/icons/ui/star.vsvg');
		star.style.width = Win.star + 'px';
		star.style.height = Win.star + 'px';
		star.style.verticalAlign = 'middle';
		star.style.margin = '0px 2px 3px 0px';
		star.style.washColor = Win.starColor;
		row.MoveChildBefore(star, name);
	}

	for (var kit of root.FindChildrenWithClassTraverse('MVP__MusicKitText')) {
		if (!WinOnce(kit, 'win-kit'))
			continue;
		kit.style.fontSize = Win.kitSize + 'px';
		kit.style.fontWeight = 'light';
		kit.style.color = Win.kitColor;
		kit.style.brightness = '1.0';
		kit.style.textShadow = WinNoShadow;
		kit.style.width = 'fit-children';
		kit.style.maxWidth = '400px';
		kit.style.marginRight = '6px';
	}

	var kitBlock = root.FindChildTraverse('MVPMusicKit');
	if (kitBlock && WinOnce(kitBlock, 'win-kit-row')) {
		kitBlock.style.flowChildren = 'right';
		kitBlock.style.width = 'fit-children';
	}

	var kitIcon = root.FindChildTraverse('MVPMusicKitIcon');
	if (kitIcon && kitBlock && WinOnce(kitIcon, 'win-kit-icon')) {
		if (kitIcon.GetParent() !== kitBlock) {
			kitIcon.SetParent(kitBlock);
			var kitName = root.FindChildTraverse('MVPMusicKitName');
			if (kitName)
				kitBlock.MoveChildBefore(kitIcon, kitName);
		}
		kitIcon.style.width = 'fit-children';
		kitIcon.style.height = '34px';
		kitIcon.style.transform = 'translateY(0px) translateX(0px)';
		kitIcon.style.verticalAlign = 'bottom';
		kitIcon.style.marginTop = '1px';
		kitIcon.style.marginRight = '4px';
	}

	var surrender = root.FindChildTraverse('Surrender');
	if (surrender && WinOnce(surrender, 'win-surrender')) {
		surrender.style.width = '100%';
		surrender.style.fontSize = '16px';
		surrender.style.color = 'white';
		surrender.style.textAlign = 'center';
	}
};

var WinStep = function (what, step) {
	try {
		step();
	} catch (error) {
			}
};

var WinApply = function () {
	var root = contextPanel.FindChildTraverse('HudWinPanel');
	if (!root)
		return;
	var result = WinFirst(root, 'WinPanel__Result');
	if (!result)
		return;

	if (WinOnce(root, 'win-root'))
		root.style.y = Win.y + 'px';

	WinStep('plate', function () {
		WinDressPlate(root, result);
	});
	WinStep('title', function () {
		WinDressTitle(WinTitle(result));
	});
	WinStep('funfact', function () {
		WinDressFunfact(root);
	});
	WinStep('mvp', function () {
		WinDressMvp(root, result);
	});
	WinStep('text', function () {
		WinDressText(root);
	});

	for (var cls of ['WinPanel__Result__double-arrows', 'WinPanel__Result__glitch', 'MVP__white']) {
		for (var decor of root.FindChildrenWithClassTraverse(cls))
			WinCollapse(decor);
	}
	WinCollapse(root.FindChildTraverse('id-match-mvp-map-container'));
	var team = WinTeam(result);
	var artMarker = 'win-art-' + team;
	if (!result.BHasClass(artMarker)) {
		for (var was of ['win-art-ct', 'win-art-t', 'win-art-draw'])
			result.RemoveClass(was);
		result.AddClass(artMarker);
		if (team === 'draw') {
			result.style.backgroundImage = 'none';
			result.style.backgroundColor = WinDrawBg;
			result.ArtStamp = null;
		} else {
			PaintArt(result, team === 'ct' ? 'winpanelct' : 'winpanelt', {size: '100% 100%'});
		}
	}

	var mvp = root.FindChildTraverse('MVP');
	if (mvp) {
		var showMvp = WinHasClass(result, 'winpanel-mvp--show');
		if (mvp.BHasClass('win-mvp-shown') !== showMvp) {
			mvp.SetHasClass('win-mvp-shown', showMvp);
			mvp.style.visibility = showMvp ? 'visible' : 'collapse';
		}
	}

	var kitIcon = root.FindChildTraverse('MVPMusicKitIcon');
	if (kitIcon) {
		var showKit = WinHasClass(result, 'MVP__MusicKit--show');
		if (kitIcon.BHasClass('win-kit-shown') !== showKit) {
			kitIcon.SetHasClass('win-kit-shown', showKit);
			kitIcon.style.visibility = showKit ? 'visible' : 'collapse';
		}
	}

	var visible = WinHasClass(result, 'winpanel-basic-round-result-visible');
	var title = WinTitle(result);

	if (title) {
		var want = WinTitleText(team);
		if (want && title.text !== want)
			title.text = want;
	}

	WinFadePlate(result, WinFirst(result, 'WinPanel__Result__white'), visible);
	WinSlideRow(root.FindChildTraverse('Funfact'),
		visible && WinHasClass(result, 'winpanel-funfacts--show'));

	if (root.BHasClass('win-visible') !== visible) {
		root.SetHasClass('win-visible', visible);
	}
};

var WinGeneration = (typeof WinGeneration === 'undefined' ? 0 : WinGeneration) + 1;

var WinTick = function (generation) {
	if (generation !== WinGeneration)
		return;
	try {
		WinApply();
	} catch (error) {
			}
	$.Schedule(0.1, function () {
		WinTick(generation);
	});
};

WinTick(WinGeneration);
