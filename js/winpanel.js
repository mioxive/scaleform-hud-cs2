var Win = {
	y: 112,
	width: 818,
	height: 126,
	titleSize: 38,
	titleTop: 6,
	titleColor: '#C1C1C1B8',
	mvpLeft: 21,
	mvpBottom: 6,
	mvpHeight: 66,
	avatar: 60,
	avatarBorder: '#858585',
	star: 16,
	starColor: '#ffd856',
	nameSize: 20,
	nameColor: '#999999ff',
	nameTop: 55,
	kitTop: 80,
	kitIcon: 40,
	kitHeight: 40,
	kitSize: 15,
	kitColor: '#bcbcbc9A',
	funfactSize: 19,
	funfactColor: '#FFFFFFC1',
	funfactBg: '#000000AE',
	funfactHeight: 41,
	factDrop: 120,
	flash: 0.4,
	flashIn: 0.4,
	fact: 0.16,
	hide: 0.2,
};

var WinDrawBg = 'gradient( linear, 100% 0%, 0% 0%, from( #00000000 ), color-stop( 0.20, #00000099 ),'
	+ ' color-stop( 0.50, #000000e6 ), color-stop( 0.80, #00000099 ), to( #00000000 ) )';

var WinNoShadow = '0px 0px 0px #00000000';

var WinMvpXuid = (typeof WinMvpXuid === 'undefined' ? '' : WinMvpXuid);
var WinMvpEvents = (typeof WinMvpEvents === 'undefined' ? false : WinMvpEvents);
if (!WinMvpEvents) {
	try {
		$.RegisterForUnhandledEvent('HudWinPanel_MVP', function (xuid) {
			WinMvpXuid = String(xuid || '');
		});
		WinMvpEvents = true;
	} catch (error) {
	}
}

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

var WinStyleOnce = function (panel, marker) {
	if (!panel)
		return false;
	var stamps = panel.WinStyleStamps || (panel.WinStyleStamps = {});
	if (stamps[marker] === WinGeneration)
		return false;
	stamps[marker] = WinGeneration;
	return true;
};

var WinHasClass = function (from, name) {
	for (var at = from; at; at = at.GetParent()) {
		try {
			if (at.BHasClass(name))
				return true;
		} catch (error) {
		}
		if (at === contextPanel)
			break;
	}
	try {
		var found = from && from.FindChildrenWithClassTraverse(name);
		if (found && found.length)
			return true;
	} catch (error) {
	}
	return false;
};

var WinCollapse = function (panel) {
	if (WinOnce(panel, 'win-hidden'))
		panel.style.visibility = 'collapse';
};

var WinTeam = function (root) {
	for (var at = root; at && at !== contextPanel; at = at.GetParent()) {
		var ct = at.BHasClass('WinPanelRoot--Win--CT');
		var t = at.BHasClass('WinPanelRoot--Win--T');
		if (ct !== t)
			return ct ? 'ct' : 't';
	}
	return 'draw';
};

var WinPaintTeam = function (result, team) {
	for (var side of ['ct', 't']) {
		var id = 'SfWinPlate_' + side;
		var image = result.FindChildTraverse(id);
		if (!image) {
			image = $.CreatePanel('Image', result, id);
			image.hittest = false;
			image.SetImage(ArtUrl(side === 'ct' ? 'winpanelct' : 'winpanelt'));
			image.style.width = '100%';
			image.style.height = '100%';
			var first = result.GetChild(0);
			if (first && first !== image)
				result.MoveChildBefore(image, first);
		}
		image.style.visibility = team === side ? 'visible' : 'collapse';
	}
	result.style.backgroundImage = 'none';
	result.style.backgroundColor = team === 'draw' ? WinDrawBg : '#00000000';
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

var WinText = function (panel) {
	if (!panel)
		return '';
	var text = '';
	try {
		text = String(panel.text || panel.Text || '');
		if (!text || text.charAt(0) === '#' || text.charAt(0) === '{')
			text = String(panel.GetAttributeString('text', '') || '');
	} catch (error) {
		return '';
	}
	if (text.charAt(0) === '#' || text.charAt(0) === '{')
		return '';
	return text;
};

var WinMvpText = function (name, reason) {
	if (!name)
		return reason || '';
	var plainName = name.replace(/<[^>]*>/g, '');
	var plainReason = reason.replace(/<[^>]*>/g, '');
	if (plainReason.indexOf('MVP: ' + plainName) === 0)
		return reason;
	var suffix = reason.replace(/^\s*MVP\s*[:.\-]?\s*/i, '');
	return 'MVP: ' + name + (suffix ? ' ' + suffix : '');
};

var WinMvpApiName = function (root) {
	try {
		if (typeof GameStateAPI === 'undefined' || typeof GameStateAPI.GetPlayerName !== 'function')
			return '';
		var avatar = root && root.FindChildTraverse('MVPAvatar');
		var xuid = avatar ? String(avatar.steamid || avatar.xuid || '') : '';
		if (avatar && (!xuid || xuid.charAt(0) === '{'))
			xuid = String(avatar.GetAttributeString('steamid', '') || avatar.GetAttributeString('xuid', '') || '');
		var candidates = [];
		if (WinMvpXuid)
			candidates.push(WinMvpXuid);
		if (xuid && xuid.charAt(0) !== '{' && xuid !== '0')
			candidates.push(xuid);
		for (var at = 0; at < candidates.length; ++at) {
			var candidate = candidates[at];
			if (!candidate || candidate.charAt(0) === '{' || candidate === '0')
				continue;
			var name = String(GameStateAPI.GetPlayerName(candidate) || '');
			if (name && name.charAt(0) !== '#' && name.charAt(0) !== '{')
				return name;
		}
		return '';
	} catch (error) {
		return '';
	}
};

var WinDressPlate = function (root, result) {
	if (!WinStyleOnce(result, 'win-plate-3'))
		return;
	result.style.width = Win.width + 'px';
	result.style.height = Win.height + 'px';
	result.style.border = '0px solid #00000000';
	result.style.borderRadius = '0px';
	result.style.flowChildren = 'none';
	try {
		result.style.worldBlur = 'none';
	} catch (error) {
	}
	var section = WinFirst(root, 'WinPanelTopSection');
	if (section) {
		section.style.width = Win.width + 'px';
		section.style.marginBottom = '0px';
		section.style.horizontalAlign = 'center';
		section.style.overflow = 'noclip';
	}
	var contents = WinFirst(root, 'WinPanelTopSection__Contents');
	if (contents) {
		contents.style.width = Win.width + 'px';
		contents.style.overflow = 'noclip';
	}
	var container = WinFirst(root, 'WinPanelBasicContainer');
	if (container)
		container.style.overflow = 'noclip';

	var white = WinFirst(result, 'WinPanel__Result__white');
	if (white) {
		white.RemoveClass('win-hidden');
		white.style.visibility = 'visible';
		white.style.width = '100%';
		white.style.height = '100%';
		white.style.zIndex = '50';
		white.style.backgroundColor = '#ffffff';
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
	if (!WinStyleOnce(title, 'win-title-2'))
		return;
	title.RemoveClass('WinPanel__Result__Title');
	title.style.fontFamily = 'Stratum2';
	title.style.fontSize = Win.titleSize + 'px';
	title.style.fontWeight = 'bold';
	title.style.color = Win.titleColor;
	title.style.washColor = '#FFFFFF';
	title.style.textShadow = WinNoShadow;
	title.style.width = '100%';
	title.style.height = (Win.titleSize + 10) + 'px';
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
		if (white) {
			white.style.transitionDuration = '0.04s';
			white.style.opacity = up ? '0.4' : '0.0';
		}
	} catch (error) {
	}
};

var WinFadePlate = function (plate, white, shown) {
	if (!plate)
		return;
	if (WinOnce(plate, 'win-fade-1')) {
		plate.style.transform = 'none';
		plate.style.transitionProperty = 'opacity, brightness';
		plate.style.transitionDuration = (Win.flashIn * 0.4) + 's, 0.06s';
		plate.style.transitionTimingFunction = 'linear';
		plate.style.transitionDelay = '0s';
		plate.style.opacity = '0.0';
		plate.style.brightness = '1.0';
		plate.RemoveClass('win-shown');
	}
	if (plate.BHasClass('win-shown') === shown)
		return;
	plate.SetHasClass('win-shown', shown);
	plate.style.transitionDuration = (shown ? Win.flashIn * 0.4 : Win.hide) + 's, 0.06s';
	plate.style.opacity = shown ? '1.0' : '0.0';
	if (!shown) {
		plate.style.brightness = '1.0';
		if (white)
			white.style.opacity = '0.0';
		return;
	}
	$.Schedule(Win.flash * 0.6, function () {
		WinPulse(plate, white, true);
	});
	$.Schedule(Win.flash * 0.75, function () {
		WinPulse(plate, white, false);
	});
};

var WinSlideRow = function (panel, shown, ready) {
	if (!panel)
		return;

	panel.style.animationName = 'none';
	var stockText = panel.FindChildTraverse('FunFactText');
	if (stockText)
		stockText.style.animationName = 'none';
	if (WinStyleOnce(panel, 'win-slide-5')) {
		panel.style.transitionProperty = 'opacity, transform';
		panel.style.transitionDuration = '0.08s, ' + Win.fact + 's';
		panel.style.transitionTimingFunction = 'linear, ease-out';
		panel.style.transitionDelay = '0s';
	}
	if (!ready || !shown) {
		panel.RemoveClass('win-shown');
		panel.style.opacity = '0.0';
		panel.style.transform = 'translateY(' + Win.factDrop + 'px)';
		panel.style.visibility = 'collapse';
		return;
	}
	panel.style.visibility = 'visible';
	panel.style.transitionDelay = '0s';
	if (stockText) {
		stockText.style.transitionDuration = '0s';
		stockText.style.transitionDelay = '0s';
	}

	if (panel.BHasClass('win-shown') === shown)
		return;
	panel.SetHasClass('win-shown', shown);
	panel.style.transform = shown ? 'translateY(0px)' : 'translateY(' + Win.factDrop + 'px)';
	panel.style.opacity = shown ? '1.0' : '0.0';
};

var WinFactText = function (root, result) {
	for (var scope of [result, root]) {
		try {
			var text = String($.Localize('{s:winpanel-funfact}', scope) || '');
			if (text && text.charAt(0) !== '{' && text.charAt(0) !== '#')
				return text;
		} catch (error) {
		}
	}
	return '';
};

var WinApplyFunfact = function (root, result, visible) {
	var fact = root.FindChildTraverse('Funfact');
	if (!fact)
		return;
	var display = fact.FindChildTraverse('SfWinFactText');
	if (!display)
		return;
	var value = WinFactText(root, result);
	var state = fact.WinFactState;
	if (!state)
		state = fact.WinFactState = {previous: value, visible: false, ready: false, last: ''};
	if (!visible) {
		if (state.visible) {
			state.previous = state.last || value;
			state.ready = false;
		}
	} else if (value && (value !== state.previous
		|| WinHasClass(root, 'winpanel-funfacts--show'))) {
		state.ready = true;
	}
	state.visible = visible;
	var shown = visible && state.ready && !!value;
	var text = shown ? value : '';
	if (shown)
		state.last = value;
	if (display.text !== text)
		display.text = text;
	WinSlideRow(fact, shown, !!text);
};

var WinDressFunfact = function (root) {
	var funfact = root.FindChildTraverse('Funfact');
	var contents = WinFirst(root, 'WinPanelTopSection__Contents');
	if (!funfact || !contents || !WinStyleOnce(funfact, 'win-funfact-2'))
		return;
	if (funfact.GetParent() !== contents) {
		funfact.SetParent(contents);
		var surrender = root.FindChildTraverse('Surrender');
		if (surrender)
			contents.MoveChildBefore(funfact, surrender);
	}
	for (var at = funfact.GetParent(); at; at = at.GetParent()) {
		try { at.style.overflow = 'noclip noclip'; } catch (clipErr) {}
		if (at === root)
			break;
	}
	funfact.style.width = '99.75%';
	funfact.style.horizontalAlign = 'center';
	funfact.style.backgroundColor = Win.funfactBg;
	funfact.style.marginTop = '2px';
	funfact.style.marginLeft = '2px';
	funfact.style.marginRight = '2px';
	funfact.style.padding = '6px 6px 8px 6px';
	funfact.style.height = (Win.funfactSize + 20) + 'px';

	var source = funfact.FindChildTraverse('FunFactText');
	if (source)
		source.style.visibility = 'collapse';
	var text = funfact.FindChildTraverse('SfWinFactText')
		|| $.CreatePanel('Label', funfact, 'SfWinFactText');
	if (text) {
		text.hittest = false;
		text.html = true;
		text.style.fontFamily = 'Stratum2';
		text.style.fontSize = Win.funfactSize + 'px';
		text.style.fontWeight = 'medium';
		text.style.color = Win.funfactColor;
		text.style.letterSpacing = '0px';
		text.style.textAlign = 'center';
		text.style.width = '100%';
		text.style.height = (Win.funfactSize + 5) + 'px';
		text.style.margin = '0px';
		text.style.textShadow = WinNoShadow;
		text.style.opacity = '1.0';
		text.style.animationName = 'none';
		text.style.transitionDuration = '0s';
		text.style.transitionDelay = '0s';
	}
};

var WinDressMvp = function (root, result) {
	var mvp = root.FindChildTraverse('MVP');
	if (mvp && WinStyleOnce(mvp, 'win-mvp-2')) {
		if (mvp.GetParent() !== result)
			mvp.SetParent(result);
		mvp.style.verticalAlign = 'bottom';
		mvp.style.horizontalAlign = 'left';
		mvp.style.marginLeft = Win.mvpLeft + 'px';
		mvp.style.marginBottom = Win.mvpBottom + 'px';
		mvp.style.width = '696px';
		mvp.style.height = Win.mvpHeight + 'px';
		mvp.style.opacity = '1.0';
		mvp.style.overflow = 'noclip';
		mvp.style.transitionDuration = '0.0s';
	}
	if (mvp && mvp.GetParent() === result)
		WinCollapse(WinFirst(root, 'MVP_section'));

	var row = WinFirst(root, 'MVP__Winner');
	if (row && WinStyleOnce(row, 'win-mvp-row')) {
		row.style.width = '100%';
		row.style.height = Win.mvpHeight + 'px';
		row.style.flowChildren = 'right';
		row.style.horizontalAlign = 'left';
		row.style.verticalAlign = 'bottom';
		var icons = WinFirst(root, 'MVP__Winner_Icons');
		if (icons) {
			icons.style.width = '68px';
			icons.style.height = Win.mvpHeight + 'px';
			icons.style.verticalAlign = 'bottom';
			icons.style.overflow = 'noclip';
		}
	}

	var avatar = root.FindChildTraverse('MVPAvatar');
	if (avatar && WinStyleOnce(avatar, 'win-avatar')) {
		avatar.style.width = Win.avatar + 'px';
		avatar.style.height = Win.avatar + 'px';
		avatar.style.verticalAlign = 'bottom';
		avatar.style.marginBottom = '3px';
		avatar.style.marginRight = '8px';
		avatar.style.border = '2px solid ' + Win.avatarBorder;
		avatar.style.borderRadius = '0px';
		avatar.style.backgroundColor = Win.avatarBorder;
		avatar.style.boxShadow = 'none';
		var img = WinFirst(avatar, 'AvatarImage');
		if (img) {
			img.style.padding = '0px';
			img.style.border = '0px solid #00000000';
			img.style.boxShadow = 'none';
		}
	}
	WinCollapse(root.FindChildTraverse('jsHonorIcon'));
};

var WinMakeMvpLine = function (result) {
	if (!result)
		return null;
	var line = result.FindChildTraverse('SfWinMvpLine');
	var row = result.FindChildTraverse('SfWinMvpRow')
		|| $.CreatePanel('Panel', result, 'SfWinMvpRow');
	var restyle = WinStyleOnce(row, 'mvp-line');
	if (line && !restyle)
		return line;
	row.hittest = false;
	row.style.width = '690px';
	row.style.height = '28px';
	row.style.x = '88px';
	row.style.y = Win.nameTop + 'px';
	row.style.flowChildren = 'right';
	row.style.overflow = 'noclip';
	row.style.zIndex = '40';

	var star = row.FindChildTraverse('SfWinMvpStar')
		|| $.CreatePanel('Image', row, 'SfWinMvpStar');
	star.hittest = false;
	star.SetImage(ArtUrl('winstar'));
	star.style.width = Win.star + 'px';
	star.style.height = Win.star + 'px';
	star.style.verticalAlign = 'center';
	star.style.margin = '0px 5px 2px 0px';
	star.style.washColor = Win.starColor;

	line = line || $.CreatePanel('Label', row, 'SfWinMvpLine');
	line.hittest = false;
	line.html = true;
	line.style.width = '640px';
	line.style.height = '28px';
	line.style.fontFamily = 'Stratum2';
	line.style.fontSize = Win.nameSize + 'px';
	line.style.fontWeight = 'medium';
	line.style.color = Win.nameColor;
	line.style.washColor = '#ffffffff';
	line.style.letterSpacing = '0px';
	line.style.textShadow = WinNoShadow;
	line.style.whiteSpace = 'nowrap';
	line.style.textOverflow = 'ellipsis';
	line.style.verticalAlign = 'center';
	return line;
};

var WinDressText = function (root, result) {
	var name = WinFirst(root, 'MVP__WinnerName');
	var reason = WinFirst(root, 'MVP__Reason');
	var line = WinMakeMvpLine(result);

	if (line) {
		var rawReason = WinText(reason);
		var rawName = WinText(name) || WinMvpApiName(root);
		var want = WinMvpText(rawName, rawReason);
		if (line.text !== want)
			line.text = want;
		var ready = want.length > 0;
		if (root.BHasClass('win-mvp-line') !== ready) {
			root.SetHasClass('win-mvp-line', ready);
		}
		for (var cls of ['MVP__WinnerName', 'MVP__Reason']) {
			for (var source of root.FindChildrenWithClassTraverse(cls)) {
				source.style.visibility = ready ? 'collapse' : 'visible';
			}
		}
		for (var oldId of ['SfWp18NameRow', 'MvpStar']) {
			var oldRow = root.FindChildTraverse(oldId);
			if (oldRow)
				oldRow.style.visibility = ready ? 'collapse' : 'visible';
		}
	}

	var kitBlock = root.FindChildTraverse('MVPMusicKit');
	if (kitBlock && result && WinStyleOnce(kitBlock, 'win-kit-row-2')) {
		if (kitBlock.GetParent() !== result)
			kitBlock.SetParent(result);
		kitBlock.style.flowChildren = 'right';
		kitBlock.style.width = '620px';
		kitBlock.style.height = Win.kitHeight + 'px';
		kitBlock.style.horizontalAlign = 'left';
		kitBlock.style.verticalAlign = 'top';
		kitBlock.style.x = '88px';
		kitBlock.style.y = Win.kitTop + 'px';
		kitBlock.style.margin = '0px';
		kitBlock.style.padding = '0px';
		kitBlock.style.opacity = '1.0';
		kitBlock.style.transform = 'none';
		kitBlock.style.transitionDuration = '0s';
		kitBlock.style.transitionDelay = '0s';
		kitBlock.style.overflow = 'noclip';
		kitBlock.style.zIndex = '40';
	}

	var kitIcon = root.FindChildTraverse('MVPMusicKitIcon');
	if (kitIcon && kitBlock && WinStyleOnce(kitIcon, 'win-kit-icon-2')) {
		if (kitIcon.GetParent() !== kitBlock) {
			kitIcon.SetParent(kitBlock);
			var kitName = root.FindChildTraverse('MVPMusicKitName');
			if (kitName)
				kitBlock.MoveChildBefore(kitIcon, kitName);
		}
		kitIcon.style.width = Win.kitIcon + 'px';
		kitIcon.style.height = Win.kitIcon + 'px';
		kitIcon.style.transform = 'none';
		kitIcon.style.verticalAlign = 'bottom';
		kitIcon.style.marginRight = '4px';
		kitIcon.style.visibility = 'visible';
		kitIcon.style.opacity = '1.0';
	}

	for (var kit of root.FindChildrenWithClassTraverse('MVP__MusicKitText')) {
		if (!WinStyleOnce(kit, 'win-kit-2'))
			continue;
		kit.style.fontFamily = 'Stratum2';
		kit.style.fontSize = Win.kitSize + 'px';
		kit.style.fontWeight = 'light';
		kit.style.color = Win.kitColor;
		kit.style.washColor = '#ffffff';
		kit.style.opacity = '1.0';
		kit.style.brightness = '1.0';
		kit.style.textShadow = WinNoShadow;
		kit.style.width = 'fit-children';
		kit.style.maxWidth = '400px';
		kit.style.height = '24px';
		kit.style.verticalAlign = 'bottom';
		kit.style.marginBottom = '2px';
		kit.style.marginRight = '6px';
		kit.style.paddingLeft = '4px';
	}

	var surrender = root.FindChildTraverse('Surrender');
	if (surrender && WinStyleOnce(surrender, 'win-surrender')) {
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

	if (WinStyleOnce(root, 'win-root')) {
		root.style.y = Win.y + 'px';
		root.style.horizontalAlign = 'center';
		root.style.overflow = 'noclip';
	}

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
		WinDressText(root, result);
	});

	for (var cls of ['WinPanel__Result__double-arrows', 'WinPanel__Result__glitch', 'MVP__white']) {
		for (var decor of root.FindChildrenWithClassTraverse(cls))
			WinCollapse(decor);
	}
	WinCollapse(root.FindChildTraverse('id-match-mvp-map-container'));
	var team = WinTeam(root);
	WinPaintTeam(result, team);

	var mvp = root.FindChildTraverse('MVP');
	if (mvp) {
		var visible = WinHasClass(root, 'winpanel-basic-round-result-visible');
		var nativeMvpState = WinHasClass(root, 'winpanel-mvp--show');
		var mvpName = WinText(WinFirst(root, 'MVP__WinnerName'));
		var mvpReason = WinText(WinFirst(root, 'MVP__Reason'));
		var showMvp = visible && (nativeMvpState || !!WinMvpText(mvpName, mvpReason) || !!WinMvpXuid);
		if (mvp.BHasClass('win-mvp-shown') !== showMvp) {
			mvp.SetHasClass('win-mvp-shown', showMvp);
			mvp.style.visibility = showMvp ? 'visible' : 'collapse';
		}
		var mvpRow = result.FindChildTraverse('SfWinMvpRow');
		if (mvpRow)
			mvpRow.style.visibility = showMvp && root.BHasClass('win-mvp-line') ? 'visible' : 'collapse';
	}

	var kitBlock = root.FindChildTraverse('MVPMusicKit');
	if (kitBlock) {
		var showKit = WinHasClass(root, 'winpanel-basic-round-result-visible')
			&& WinHasClass(root, 'MVP__MusicKit--show');
		kitBlock.SetHasClass('win-kit-shown', showKit);
		kitBlock.style.visibility = showKit ? 'visible' : 'collapse';
	}

	var visible = WinHasClass(root, 'winpanel-basic-round-result-visible');
	var title = WinTitle(result);

	if (title) {
		var want = WinTitleText(team) || WinText(WinFirst(result, 'WinPanel__Result__Title'));
		if (want && title.text !== want)
			title.text = want;
	}

	WinFadePlate(result, WinFirst(result, 'WinPanel__Result__white'), visible);

	WinApplyFunfact(root, result, visible);
	if (root.BHasClass('win-visible') !== visible) {
		root.SetHasClass('win-visible', visible);
	}
};

var WinGeneration = (contextPanel.SfWinGeneration || 0) + 1;
contextPanel.SfWinGeneration = WinGeneration;

var WinTick = function (generation) {
	if (generation !== WinGeneration || generation !== contextPanel.SfWinGeneration)
		return;
	try {
		WinApply();
	} catch (error) {
	}
	var root = contextPanel.FindChildTraverse('HudWinPanel');
	var delay = root && WinHasClass(root, 'winpanel-basic-round-result-visible') ? 0.03 : 0.1;
	$.Schedule(delay, function () {
		WinTick(generation);
	});
};

WinTick(WinGeneration);
