var HiddenIcons = ['NoScopeIcon', 'ThroughSmokeIcon', 'AttackerBlindIcon', 'Domination', 'AttackerInAir', 'Revenge'];
var WeaponIconScale = '75%';
var ExtraIconHeight = '26px';
var NoticeFontSize = '20px';
var NoticeLetterSpacing = '0.2px';
var NoticeTextShadow = '1px 1px 0px #000000';
var NoticeGap = '4px';
var VignetteOpacity = '0.76';
var VignetteHeight = '95%';
var KillerBar = '#000000e6';
var VictimBar = '#a81313ff';
var NoticeRoot = null;

var NoticeWeaponName = function (icon) {
	var src = '';
	try {
		src = String(icon.src || '');
	} catch (error) {
		return '';
	}
	if (!src)
		return '';
	var tail = src.substring(src.lastIndexOf('/') + 1);
	tail = tail.replace(/\.(vsvg|vtex|svg|png|vsvg_c|vtex_c)$/i, '');
	return tail;
};

var StyleOneNotice = function (notice, force) {
	var isKiller = notice.BHasClass('DeathNotice_Killer');
	var isVictim = notice.BHasClass('DeathNotice_Victim');
	var marker = isKiller ? 'killer' : (isVictim ? 'victim' : 'neutral');
	if (!force && notice.BHasClass(marker))
		return;
	for (var stale of ['killer', 'victim', 'neutral'])
		notice.RemoveClass(stale);
	notice.AddClass(marker);

	for (var iconId of HiddenIcons) {
		var extraIcon = notice.FindChildTraverse(iconId);
		if (extraIcon)
			extraIcon.style.visibility = 'collapse';
	}

	for (var icon of notice.FindChildrenWithClassTraverse('DeathNoticeIcon')) {
		icon.style.verticalAlign = 'top';
		if (icon.id === 'Weapon') {
			icon.style.transform = 'translateY(5px)';
			icon.style.uiScale = WeaponIconScale;
			var wpn = NoticeWeaponName(icon);
			var file = (typeof WpnIconFile === 'function') ? WpnIconFile(wpn) : null;
			if (file && icon.WpnSrc !== file) {
				icon.WpnSrc = file;
				icon.SetImage(ArtUrl(file));
				icon.style.washColor = '#ffffff';
			}
		} else {
			icon.style.height = ExtraIconHeight;
			icon.style.transform = 'translateY(0px)';
			icon.style.uiScale = '100%';
		}
	}

	for (var label of notice.FindChildrenWithClassTraverse('stratum-bold')) {
		label.style.fontSize = NoticeFontSize;
		label.style.fontWeight = 'bold';
		label.style.letterSpacing = NoticeLetterSpacing;
		label.style.textShadow = NoticeTextShadow;
	}

	for (var t of notice.FindChildrenWithClassTraverse('DeathNoticeTColor'))
		t.style.color = '#e8c56f';
	for (var ct of notice.FindChildrenWithClassTraverse('DeathNoticeCTColor'))
		ct.style.color = '#83a5de';

	for (var blurred of notice.FindChildrenWithClassTraverse('DeathNoticeBG'))
		blurred.style.visibility = 'collapse';

	for (var vignette of notice.FindChildrenWithClassTraverse('DeathNoticeBGGradient')) {
		vignette.style.visibility = isKiller ? 'collapse' : 'visible';
		vignette.style.opacity = VignetteOpacity;
		vignette.style.height = VignetteHeight;
		vignette.style.verticalAlign = 'center';
	}

	notice.style.marginTop = NoticeGap;

	for (var border of notice.FindChildrenWithClassTraverse('DeathNoticeBGBorder')) {
		border.style.boxShadow = 'inset #00000000 0px 0px 0px 0px;';
		border.style.backgroundImage = 'none';
		border.style.borderRadius = '5px';
		border.style.border = isKiller ? '1.5px solid #b3070d' : '1.5px solid #00000000';
		if (isKiller) {
			border.style.backgroundColor = KillerBar;
		} else if (isVictim) {
			border.style.backgroundColor = VictimBar;
		} else {
			border.style.backgroundColor = '#00000000';
		}
	}
};

var StyleDeathNotices = function (force) {
	if (!NoticeRoot)
		NoticeRoot = contextPanel.FindChildTraverse('HudDeathNotice');
	if (!NoticeRoot)
		return;

	for (var notice of NoticeRoot.FindChildrenWithClassTraverse('DeathNotice'))
		StyleOneNotice(notice, force);
};

StyleDeathNotices(true);

if (typeof DeathNoticeLoop === 'undefined') {
	var DeathNoticeLoop = function () {
		try {
			StyleDeathNotices(false);
		} catch (error) {
						NoticeRoot = null;
		}
		$.Schedule(0.2, DeathNoticeLoop);
	};
	$.Schedule(0.2, DeathNoticeLoop);
}
