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
	gotvct: 'gotv_ct.png', gotvt: 'gotv_t.png',
	killicon: 'kill_icon.png', killiconhs: 'kill_icon_headshot.png',
	killoutline: 'kill_icon_outline.png', winstar: 'wp18_star.png'
};

var WpnIconFiles = {
	ak47: 'wpn_ak47', awp: 'wpn_awp', ssg08: 'wpn_ssg08',
	m4a4: 'wpn_m4a1', m4a1: 'wpn_m4a1',
	m4a1_silencer: 'wpn_m4a1_silencer', m4a1_silencer_off: 'wpn_m4a1_silencer_off',
	deagle: 'wpn_deagle', revolver: 'wpn_deagle',
	usp_silencer: 'wpn_hkp2000', usp_silencer_off: 'wpn_hkp2000',
	hkp2000: 'wpn_hkp2000', p2000: 'wpn_p2000', p250: 'wpn_p2000',
	cz75a: 'wpn_p2000', fiveseven: 'wpn_p2000', tec9: 'wpn_p2000',
	glock: 'wpn_p2000', elite: 'wpn_elite',
	mag7: 'wpn_mag7', sawedoff: 'wpn_mag7', nova: 'wpn_mag7', xm1014: 'wpn_mag7',
	knife: 'wpn_knife', knife_t: 'wpn_knife_t', bayonet: 'wpn_bayonet',
	knife_flip: 'wpn_knife_flip', knife_gut: 'wpn_knife_gut',
	knife_karambit: 'wpn_knife_karambit', knife_m9_bayonet: 'wpn_knife_m9_bayonet',
	knife_tactical: 'wpn_knife_tactical', knife_butterfly: 'wpn_knife_butterfly',
	knife_push: 'wpn_knife_push', knife_survival_bowie: 'wpn_knife_survival_bowie',
	knife_bowie: 'wpn_knife_bowie',
	c4: 'wpn_c4_', planted_c4: 'wpn_c4_',
	flashbang: 'wpn_flashbang2', hegrenade: 'wpn_hegrenade2',
	frag_grenade: 'wpn_frag_grenade2', smokegrenade: 'wpn_smokegrenade2',
	decoy: 'wpn_decoy2', molotov: 'wpn_molotov2', incgrenade: 'wpn_incgrenade2',
	firebomb: 'wpn_firebomb2', tagrenade: 'wpn_flashbang2',
	diversion: 'wpn_decoy2', breachcharge: 'wpn_c4_'
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


var WpnIconFile = function (weaponName) {
	if (!weaponName)
		return null;
	var key = String(weaponName).toLowerCase()
		.replace(/^weapon_/, '').replace(/^item_/, '');
	var token = WpnIconFiles[key];
	if (!token)
		return null;
	return token + '.png';
};

var PaintWeapon = function (panel, weaponName, extra) {
	var token = WpnIconFile(weaponName);
	if (!token)
		return false;
	return PaintArt(panel, token, extra);
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
