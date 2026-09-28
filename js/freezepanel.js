var fpFailures = {};

var fpSet = function (panel, property, value) {
	if (!panel)
		return;
	try {
		panel.style[property] = value;
	} catch (error) {
		if (!fpFailures[property]) {
			fpFailures[property] = true;
					}
	}
};

var fpAdd = function (panel, className) {
	if (panel && !panel.BHasClass(className))
		panel.AddClass(className);
};

var fpEach = function (root, className, dress) {
	if (!root)
		return;
	var found = root.FindChildrenWithClassTraverse(className);
	for (var at = 0; at < found.length; ++at)
		dress(found[at]);
};

var fpBox = {
	contentWidth: '510px',
	bg: 'gradient( linear, 0% 0%, 100% 0%, from( #00000000 ), to( #000000cc ) )',
	fillBg: 'gradient( linear, 0% 0%, 100% 0%, from( #000000cc ), color-stop( 0.70, #000000cc ),'
		+ ' to( #00000000 ) )',
	avatarMount: '86px',
	avatar: '80px',
	barWidth: '80px',
	barBorder: '1px solid #c2c5ba80',
	nameColor: '#cccccc',
	nameSize: '30px',
	nameHeight: '40px',
	descColor: '#c93121',
	descSize: '20px',
	damageBg: 'gradient( linear, 0% 0%, 100% 0%, from( #00000088 ), color-stop( 0.60, #00000088 ),'
		+ ' to( #00000000 ) )',
	damageSize: '20px',
	itemBorder: '5px solid #000000',
	itemBg: '#000000cc',
	navColor: '#cccccc',
	navSize: '20px',
	navShadow: '2px 2px 0px #000000',
	ssContentWidth: '650px',
	ssBg: 'gradient( linear, 0% 0%, 100% 0%, from( #00000000 ), color-stop( 0.30, #000000cc ),'
		+ ' to( #000000cc ) )',
	ssAvatarMount: '46px',
	ssAvatar: '40px',
	ssNameColor: '#ffffff',
	ssNameSize: '40px',
	ssDescColor: '#c93121',
	ssDescSize: '25px',
	ssItemWidth: '120px',
};

var fpDress = function () {
	var fpMain = contextPanel.FindChildTraverse('DeathPanel');
	if (fpMain) {
		if (fpMain.BHasClass('DeathPanel__BG-Blur'))
			fpMain.RemoveClass('DeathPanel__BG-Blur');

		fpEach(fpMain, 'death-panel-bg', function (panel) {
			fpSet(panel, 'backgroundImage', 'none');
			fpSet(panel, 'backgroundImgOpacity', '0');
		});

		fpEach(fpMain, 'DeathPanel__Content', function (panel) {
			fpSet(panel, 'width', fpBox.contentWidth);
		});
		fpEach(fpMain, 'DeathPanel__BG', function (panel) {
			fpSet(panel, 'backgroundColor', fpBox.bg);
		});

		var fpAvatar = fpMain.FindChildTraverse('Avatar');
		var fpAvatarRow = fpAvatar && fpAvatar.GetParent() ? fpAvatar.GetParent().GetParent()
			: null;
		if (fpAvatarRow)
			fpSet(fpAvatarRow, 'backgroundColor', fpBox.fillBg);
		fpEach(fpMain, 'DeathPanel_AvatarBG', function (panel) {
			fpSet(panel, 'width', fpBox.avatarMount);
			fpSet(panel, 'height', fpBox.avatarMount);
			fpSet(panel, 'backgroundColor', 'gradient( linear, 0% 0%, 0% 100%, from( #7e7e7e ),'
				+ ' to( #2a2a2a ) )');
		});
		fpEach(fpMain, 'DeathPanel__Avatar', function (panel) {
			fpSet(panel, 'width', fpBox.avatar);
			fpSet(panel, 'height', fpBox.avatar);
		});
		fpEach(fpMain, 'DeathPanel__AvatarHealthBar', function (panel) {
			fpSet(panel, 'width', fpBox.barWidth);
			fpSet(panel, 'height', '5px');
			fpSet(panel, 'border', fpBox.barBorder);
			fpSet(panel, 'margin', '3px');

		});
		fpEach(fpMain, 'DeathPanel__Name', function (panel) {
			fpSet(panel, 'color', fpBox.nameColor);
			fpSet(panel, 'fontSize', fpBox.nameSize);
			fpSet(panel, 'height', fpBox.nameHeight);
			fpSet(panel, 'letterSpacing', '0px');
			fpAdd(panel, 'additive');
		});
		fpEach(fpMain, 'DeathPanel__Desc', function (panel) {
			fpSet(panel, 'color', fpBox.descColor);
			fpSet(panel, 'fontSize', fpBox.descSize);
			fpSet(panel, 'paddingLeft', '20px');
			fpAdd(panel, 'additive');
		});
		fpEach(fpMain, 'DeathPanel__Damage', function (panel) {
			fpSet(panel, 'backgroundColor', fpBox.damageBg);
			fpSet(panel, 'borderTop', '0px solid #00000000');
			var kids = panel.Children();
			for (var kid = 0; kid < kids.length; ++kid)
				if (kids[kid].paneltype === 'Label') {
					fpSet(kids[kid], 'fontSize', fpBox.damageSize);
					fpSet(kids[kid], 'paddingLeft', '10px');
				}
		});
		fpEach(fpMain, 'DeathPanel__ItemContainer', function (panel) {
			fpSet(panel, 'width', '150px');
			fpSet(panel, 'borderLeft', fpBox.itemBorder);
			fpSet(panel, 'backgroundColor', fpBox.itemBg);
		});
		fpEach(fpMain, 'DeathPanel__Navigation', function (panel) {
			fpSet(panel, 'color', fpBox.navColor);
			fpSet(panel, 'fontSize', fpBox.navSize);
			fpSet(panel, 'fontWeight', 'bold');
			fpSet(panel, 'textShadow', fpBox.navShadow);
			fpSet(panel, 'paddingLeft', '10px');
		});
	}

	var fpSS = contextPanel.FindChildTraverse('DeathPanelSS');
	if (fpSS) {
		fpEach(fpSS, 'DeathPanelSS__Content', function (panel) {
			fpSet(panel, 'width', fpBox.ssContentWidth);
		});
		fpEach(fpSS, 'DeathPanelSS__BG', function (panel) {
			fpSet(panel, 'backgroundColor', fpBox.ssBg);
		});
		fpEach(fpSS, 'DeathPanelSS__Logo', function (panel) {
			fpSet(panel, 'width', '650px');
			fpSet(panel, 'padding', '10px');
			fpSet(panel, 'marginLeft', '30px');
			fpSet(panel, 'marginBottom', '30px');
			fpSet(panel, 'backgroundColor', 'gradient( linear, 0% 0%, 100% 0%, from( #00000000 ),'
				+ ' color-stop( 0.30, #00000080 ), to( #00000080 ) )');
		});
		fpEach(fpSS, 'DeathPanelSS__LogoImage', function (panel) {
			fpSet(panel, 'washColor', '#cccccc');
		});
		fpEach(fpSS, 'DeathPanel_AvatarBG', function (panel) {
			fpSet(panel, 'width', fpBox.ssAvatarMount);
			fpSet(panel, 'height', fpBox.ssAvatarMount);
		});
		fpEach(fpSS, 'DeathPanel__Avatar', function (panel) {
			fpSet(panel, 'width', fpBox.ssAvatar);
			fpSet(panel, 'height', fpBox.ssAvatar);
		});
		fpEach(fpSS, 'DeathPanel__AvatarHealthBar', function (panel) {
			fpSet(panel, 'width', fpBox.ssAvatar);
		});
		fpEach(fpSS, 'DeathPanelSS__Name', function (panel) {
			fpSet(panel, 'color', fpBox.ssNameColor);
			fpSet(panel, 'fontSize', fpBox.ssNameSize);
			fpSet(panel, 'fontWeight', 'bold');
			fpSet(panel, 'marginRight', '10px');
		});
		fpEach(fpSS, 'DeathPanelSS__Desc', function (panel) {
			fpSet(panel, 'color', fpBox.ssDescColor);
			fpSet(panel, 'fontSize', fpBox.ssDescSize);
			fpSet(panel, 'fontWeight', 'bold');
		});
		fpEach(fpSS, 'DeathPanel__ItemContainer', function (panel) {
			fpSet(panel, 'width', fpBox.ssItemWidth);
		});
	}

	var fpCancel = contextPanel.FindChildTraverse('DeathCancel');
	if (fpCancel) {
		fpSet(fpCancel, 'color', fpBox.navColor);
		fpSet(fpCancel, 'fontSize', fpBox.navSize);
		fpSet(fpCancel, 'fontWeight', 'bold');
		fpSet(fpCancel, 'textShadow', fpBox.navShadow);
	}
};

var fpGeneration = (typeof fpGeneration === 'undefined' ? 0 : fpGeneration) + 1;
var fpWasHidden = true;

var fpTick = function (generation) {
	if (generation !== fpGeneration)
		return;
	try {
		var root = contextPanel.FindChildTraverse('HudDeathPanel');
		var hidden = true;
		try {
			hidden = root ? !(root.visible === true) : true;
		} catch (visibleError) {
			hidden = root ? root.BHasClass('DeathPanelRoot--Hidden') : true;
		}
	if (fpWasHidden && !hidden) {
		fpDress();
	}
	fpWasHidden = hidden;
	} catch (error) {
			}
	$.Schedule(0.1, function () {
		fpTick(generation);
	});
};

$.Schedule(0.1, (function (generation) {
	return function () {
		fpTick(generation);
	};
})(fpGeneration));
