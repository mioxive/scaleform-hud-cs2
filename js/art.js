var ArtFiles = {
	noticebar: 'notice_bar.png', topleft: 'topleft.png',
	alivect: 'alive_ct.png', alivet: 'alive_t.png', aliveskull: 'alive_skull.png',
	teamct: 'team_ct.png', teamt: 'team_t.png',
	weaponplate: 'weapon_plate.png', ammoplate: 'ammo_plate.png',
	hpplate: 'hp_plate.png', hpredplate: 'hp_red.png', armorplate: 'armor_plate.png',
	hpicon: 'hp_icon.png', armoricon: 'armor_icon.png', helmeticon: 'helmet_icon.png',
	killbadge: 'kill_badge.png', winpanelct: 'win_ct.png', winpanelt: 'win_t.png',
	alerticon: 'alert_icon.png', yesvote: 'yesvote.png', novote: 'novote.png',
	defuseicon: 'defuse_icon.png', joinplate: 'fade.png',
	gotvct: 'gotv_ct.png', gotvt: 'gotv_t.png'
};

var ArtNonce = (typeof ArtNonce === 'undefined' ? 1 : ArtNonce);
var ArtPainted = (typeof ArtPainted === 'undefined' ? [] : ArtPainted);

var ArtUrl = function (token) {
	return 'file://{hud}/' + (ArtFiles[token] || token);
};

var ArtCss = function (token) {
	return 'url("' + ArtUrl(token) + '")';
};

var ArtStamp = function (token, extra) {
	return token + '|' + ArtNonce
		+ '|' + ((extra && extra.size) || '')
		+ '|' + ((extra && extra.position) || '')
		+ '|' + ((extra && extra.opacity) || '');
};

var PaintArt = function (panel, token, extra) {
	if (!panel)
		return false;

	var stamp = ArtStamp(token, extra);
	if (panel.ArtStamp === stamp)
		return true;
	panel.ArtStamp = stamp;

	panel.style.backgroundColor = '#00000000';
	panel.style.backgroundImage = ArtCss(token);
	panel.style.backgroundSize = (extra && extra.size) || '100% 100%';
	panel.style.backgroundRepeat = 'no-repeat';
	panel.style.backgroundImgOpacity = (extra && extra.opacity) || '1.0';
	if (extra && extra.position)
		panel.style.backgroundPosition = extra.position;

	var slot = panel.ArtSlot;
	if (typeof slot === 'number' && ArtPainted[slot] && ArtPainted[slot].panel === panel) {
		ArtPainted[slot] = {panel: panel, id: panel.id, token: token, extra: extra};
		return true;
	}
	panel.ArtSlot = ArtPainted.length;
	ArtPainted.push({panel: panel, id: panel.id, token: token, extra: extra});
	return true;
};

var RearmArt = function (why) {
	CompactArt();
	ArtNonce = ArtNonce + 1;
	var kept = [];
	for (var at = 0; at < ArtPainted.length; ++at) {
		var entry = ArtPainted[at];
		try {
			entry.panel.style.backgroundImage = ArtCss(entry.token);
			entry.panel.style.backgroundImgOpacity = (entry.extra && entry.extra.opacity) || '1.0';
			entry.panel.ArtStamp = ArtStamp(entry.token, entry.extra);
			kept.push(entry);
		} catch (error) {
		}
	}
	ArtPainted = kept;
};

var CompactArt = function () {
	var kept = [];
	for (var at = ArtPainted.length - 1; at >= 0; --at) {
		var entry = ArtPainted[at];
		if (!entry || !entry.panel || entry.panel.ArtSeen)
			continue;
		entry.panel.ArtSeen = true;
		kept.push(entry);
	}
	kept.reverse();
	for (var slot = 0; slot < kept.length; ++slot) {
		kept[slot].panel.ArtSeen = false;
		kept[slot].panel.ArtSlot = slot;
	}
	ArtPainted = kept;
};

CompactArt();

if (typeof ArtEvents === 'undefined') {
	var ArtEvents = true;
	$.RegisterForUnhandledEvent('OnRoundStart', function () {
		RearmArt('round start');
	});
} else {
	RearmArt('reload');
}
