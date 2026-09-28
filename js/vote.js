var VoteBox = {
	width: '330px',
	baseBg: '#171717',
	headerBg: 'gradient( linear, 0% 0%, 100% 0%, from( #313131 ), color-stop( 0.4, #313131 ),'
		+ ' to( #171717 ) )',
	headerBorder: '2px solid #171717',
	headerPadding: '6px 0px 7px 8px',
	headerIconWidth: '29px',
	headerIconHeight: '28px',
	headerLabelSize: '21px',
	bodyBg: '#171717',
	bodyLabelColor: '#cfcdaa',
	bodyLabelSize: '20px',
	bodyLabelLine: '22px',
	boxesHeight: '94px',
	boxHeight: '43px',
	boxBg: 'gradient( linear, 0% 0%, 100% 0%, from( #383838 ), color-stop( 0.5, #363636 ),'
		+ ' to( #272727 ) )',
	countSize: '34px',
	yesColor: 'green',
	noColor: 'red',
	footerBg: '#000000FD',
	footerSize: '25px',
};

var VoteSet = function (panel, property, value) {
	if (!panel)
		return;
	try {
		panel.style[property] = value;
	} catch (error) {
			}
};

var VoteKillDots = function (panel, depth) {
	if (!panel || depth > 12)
		return;
	VoteSet(panel, 'backgroundImage', 'none');
	VoteSet(panel, 'backgroundImgOpacity', '0');
	var kids = panel.Children();
	for (var kid = 0; kid < kids.length; ++kid)
		VoteKillDots(kids[kid], depth + 1);
};

var VoteDress = function (root) {
	VoteSet(root, 'backgroundColor', VoteBox.baseBg);
	VoteSet(root, 'worldBlur', 'none');
	VoteSet(root, 'boxShadow', '0px 0px 1px 0px #ffffff30');
	VoteKillDots(root, 0);

	var VoteHeaders = root.FindChildrenWithClassTraverse('hud-vote-header');
	for (var VoteHeaderAt = 0; VoteHeaderAt < VoteHeaders.length; ++VoteHeaderAt) {
		var VoteHeader = VoteHeaders[VoteHeaderAt];
		VoteSet(VoteHeader, 'backgroundColor', VoteBox.headerBg);
		VoteSet(VoteHeader, 'borderTop', VoteBox.headerBorder);
		VoteSet(VoteHeader, 'borderLeft', VoteBox.headerBorder);
		VoteSet(VoteHeader, 'borderRight', VoteBox.headerBorder);
		VoteSet(VoteHeader, 'padding', VoteBox.headerPadding);

		var VoteIcon = VoteHeader.FindChildTraverse('VoteHeaderIcon');
		if (VoteIcon) {
			VoteSet(VoteIcon, 'width', VoteBox.headerIconWidth);
			VoteSet(VoteIcon, 'height', VoteBox.headerIconHeight);
			VoteSet(VoteIcon, 'brightness', '1.3');
			if (VoteHeader.BHasClass('vote-header-passed'))
				VoteIcon.SetImage(ArtUrl('yesvote'));
			else if (VoteHeader.BHasClass('vote-header-failed'))
				VoteIcon.SetImage(ArtUrl('novote'));
		}

		var VoteHeaderLabels = VoteHeader.FindChildrenWithClassTraverse('hud-vote-header__label');
		for (var VoteLabelAt = 0; VoteLabelAt < VoteHeaderLabels.length; ++VoteLabelAt) {
			VoteSet(VoteHeaderLabels[VoteLabelAt], 'fontSize', VoteBox.headerLabelSize);
			VoteSet(VoteHeaderLabels[VoteLabelAt], 'letterSpacing', '0px');
			VoteSet(VoteHeaderLabels[VoteLabelAt], 'fontWeight', 'normal');
		}
	}

	var VoteBodies = root.FindChildrenWithClassTraverse('hud-vote-body');
	for (var VoteBodyAt = 0; VoteBodyAt < VoteBodies.length; ++VoteBodyAt) {
		var VoteBody = VoteBodies[VoteBodyAt];
		VoteSet(VoteBody, 'backgroundColor', VoteBox.bodyBg);
		if (VoteBody.BHasClass('additive'))
			VoteBody.RemoveClass('additive');
		var VoteDescs = VoteBody.FindChildrenWithClassTraverse('hud-vote-body__label');
		for (var VoteDescAt = 0; VoteDescAt < VoteDescs.length; ++VoteDescAt) {
			VoteSet(VoteDescs[VoteDescAt], 'color', VoteBox.bodyLabelColor);
			VoteSet(VoteDescs[VoteDescAt], 'fontSize', VoteBox.bodyLabelSize);
			VoteSet(VoteDescs[VoteDescAt], 'lineHeight', VoteBox.bodyLabelLine);
			VoteSet(VoteDescs[VoteDescAt], 'letterSpacing', '0px');
			VoteSet(VoteDescs[VoteDescAt], 'fontWeight', 'normal');
		}

		VoteDressBox(VoteBody.FindChildrenWithClassTraverse('hud-vote-yesbox')[0], VoteBox.yesColor,
			'yesvote');
		VoteDressBox(VoteBody.FindChildrenWithClassTraverse('hud-vote-nobox')[0], VoteBox.noColor,
			'novote');

		var VoteColumn = VoteBody.FindChildrenWithClassTraverse('hud-vote-boxes')[0];
		if (VoteColumn) {
			VoteSet(VoteColumn, 'horizontalAlign', 'right');
			VoteSet(VoteColumn, 'height', VoteBox.boxesHeight);
			VoteSet(VoteColumn, 'flowChildren', 'down');
		}
	}

	var VoteFooters = root.FindChildrenWithClassTraverse('hud-vote-footer');
	for (var VoteFooterAt = 0; VoteFooterAt < VoteFooters.length; ++VoteFooterAt) {
		VoteSet(VoteFooters[VoteFooterAt], 'backgroundColor', VoteBox.footerBg);
		if (VoteFooters[VoteFooterAt].BHasClass('additive'))
			VoteFooters[VoteFooterAt].RemoveClass('additive');
		var VoteFooterLabels = VoteFooters[VoteFooterAt].FindChildrenWithClassTraverse(
			'footer__vote-binding-label');
		for (var VoteBindAt = 0; VoteBindAt < VoteFooterLabels.length; ++VoteBindAt) {
			VoteSet(VoteFooterLabels[VoteBindAt], 'fontSize', VoteBox.footerSize);
			VoteSet(VoteFooterLabels[VoteBindAt], 'fontWeight', 'medium');
			VoteSet(VoteFooterLabels[VoteBindAt], 'letterSpacing', '0px');
		}
	}
};

var VoteDressBox = function (box, colour, art) {
	if (!box)
		return;
	VoteSet(box, 'height', VoteBox.boxHeight);
	VoteSet(box, 'backgroundColor', VoteBox.boxBg);
	var kids = box.Children();
	for (var kid = 0; kid < kids.length; ++kid) {
		if (kids[kid].paneltype === 'Image')
			kids[kid].SetImage(ArtUrl(art));
		else if (kids[kid].paneltype === 'Label') {
			VoteSet(kids[kid], 'fontSize', VoteBox.countSize);
			VoteSet(kids[kid], 'fontWeight', 'bold');
			VoteSet(kids[kid], 'textAlign', 'center');
			VoteSet(kids[kid], 'color', colour);
		}
	}
};

var VoteGeneration = (typeof VoteGeneration === 'undefined' ? 0 : VoteGeneration) + 1;

var VoteTick = function (generation) {
	if (generation !== VoteGeneration)
		return;
	try {
		var root = contextPanel.FindChildrenWithClassTraverse('hud-vote')[0];
		if (root) {
			if (!root.BHasClass('vote-dressed')) {
				root.AddClass('vote-dressed');
				VoteDress(root);
			}
			var wanted = root.BHasClass('hud-vote-type--auto-instant-surrender')
				? '480px' : VoteBox.width;
			if (root.LastWidth !== wanted) {
				root.LastWidth = wanted;
				VoteSet(root, 'width', wanted);
			}
		}
	} catch (error) {
			}
	$.Schedule(0.25, function () {
		VoteTick(generation);
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		VoteTick(generation);
	};
})(VoteGeneration));
