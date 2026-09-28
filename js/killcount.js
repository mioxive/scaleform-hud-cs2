var Kc = {

	badgeWidth: 23,
	badgeHeight: 23,
	pitch: 26,
	slots: 5,
	firstX: 1619,
	anchorRight: 1694,
	fxPark: -3000,
	bottom: 1080 - 1050,
	skullBox: 17,
	skullSrc: '',
	skullY: -1,
	skullX: 0,
	countSize: '17px',
	countColor: '#e8e4d2',
};

var KcRowRight = 1920 - Kc.anchorRight - (Kc.pitch - Kc.badgeWidth);
var KcHiddenIds = ['hud-HA__kills', 'hud-HA__kills--fx', 'hud-HA__Specialkills--fx'];

var KcHideStock = function () {
	var cards = null;
	for (var at = 0; at < KcHiddenIds.length; ++at) {
		var panel = contextPanel.FindChildTraverse(KcHiddenIds[at]);
		if (!panel)
			continue;
		panel.style.visibility = 'collapse';
		if (at === 0)
			cards = panel;
	}
	return cards;
};

var KcParkFx = function () {
	var parked = 0;
	for (var at = 1; at < KcHiddenIds.length; ++at) {
		var fx = contextPanel.FindChildTraverse(KcHiddenIds[at]);
		if (fx && !fx.BHasClass('fx-parked')) {
			fx.AddClass('fx-parked');
			fx.style.y = Kc.fxPark + 'px';
			++parked;
		}
	}
	return parked;
};

var KcListeners = ['HUD--on-kill--listener', 'HUD--health--on-damage--listener',
	'HUD--has-armor--on-pickup--listener', 'HUD--on-reload--listener',
	'HUD--weapon--on-change--listener', 'HUD--weapon--on-fired--listener'];

var KcGlowNoted = false;

var KcNoGlow = function (cards) {
	var owner = cards.GetParent();
	if (!owner)
		return;

	var stripped = 0;
	for (var at = 0; at < KcListeners.length; ++at) {
		var listener = KcListeners[at];
		var trigger = listener.substring(0, listener.length - '--listener'.length);
		var hits = owner.FindChildrenWithClassTraverse(listener);
		for (var one = 0; one < hits.length; ++one) {
			hits[one].RemoveClass(listener);
			++stripped;
		}
		var lit = owner.FindChildrenWithClassTraverse(trigger);
		for (var two = 0; two < lit.length; ++two) {
			lit[two].RemoveClass(trigger);
			++stripped;
		}
	}

	if (stripped && !KcGlowNoted) {
		KcGlowNoted = true;
	}
};

var KcCount = function (cards) {
	for (var at = cards; at; at = at.GetParent()) {
		if (at.BHasClass('HUD--NumKills--extra'))
			return Kc.slots + 1;
		for (var n = Kc.slots; n >= 1; --n)
			if (at.BHasClass('HUD--NumKills--' + n))
				return n;
	}
	return 0;
};

var KcOldRow = contextPanel.FindChildTraverse('Kills');
if (KcOldRow) {
	KcOldRow.DeleteAsync(0);
}

var KcBuild = function () {
	var row = $.CreatePanel('Panel', contextPanel, 'Kills');
	row.hittest = false;
	row.style.horizontalAlign = 'right';
	row.style.verticalAlign = 'bottom';
	row.style.marginRight = KcRowRight + 'px';
	row.style.marginBottom = Kc.bottom + 'px';
	row.style.width = 'fit-children';
	row.style.height = Kc.badgeHeight + 'px';
	row.style.flowChildren = 'right';
	row.style.zIndex = '21';
	var more = $.CreatePanel('Label', row, 'KillMore');
	more.hittest = false;
	more.style.fontFamily = 'Stratum2';
	more.style.fontWeight = 'bold';
	more.style.fontSize = Kc.countSize;
	more.style.color = Kc.countColor;
	more.style.verticalAlign = 'center';
	more.style.textShadow = '1px 1px 0px #000000';
	more.style.marginRight = '2px';
	more.style.visibility = 'collapse';
	more.text = '+';

	for (var at = 0; at < Kc.slots; ++at) {
		var badge = $.CreatePanel('Panel', row, 'Kill' + at);
		badge.hittest = false;
		badge.style.width = Kc.badgeWidth + 'px';
		badge.style.height = Kc.badgeHeight + 'px';
		badge.style.marginRight = (Kc.pitch - Kc.badgeWidth) + 'px';
		badge.style.visibility = 'collapse';
		PaintArt(badge, 'killbadge');
		var skull = $.CreatePanel('Panel', badge, 'KillSkull' + at);
		skull.hittest = false;
		skull.style.width = Kc.skullBox + 'px';
		skull.style.height = Kc.skullBox + 'px';
		skull.style.horizontalAlign = 'center';
		skull.style.verticalAlign = 'center';
		skull.style.x = Kc.skullX + 'px';
		skull.style.y = Kc.skullY + 'px';
		if (Kc.skullSrc) {
			skull.style.backgroundImage = 'url("' + Kc.skullSrc + '")';
			skull.style.backgroundSize = 'contain';
			skull.style.backgroundRepeat = 'no-repeat';
			skull.style.backgroundPosition = 'center center';
			skull.style.washColor = '#ffffff';
		} else {
			PaintArt(skull, 'aliveskull', {size: 'contain'});
		}
	}

	return row;
};

var KcApply = function () {
	var cards = KcHideStock();
	if (!cards)
		return false;
	KcNoGlow(cards);

	var row = contextPanel.FindChildTraverse('Kills');
	if (!row)
		return false;
	var kills = KcCount(cards);
	var marker = 'kills-' + kills;
	if (row.BHasClass(marker))
		return true;

	for (var stale = 0; stale <= Kc.slots + 1; ++stale)
		row.RemoveClass('kills-' + stale);
	row.AddClass(marker);

	var shown = Math.min(kills, Kc.slots);
	for (var at = 0; at < Kc.slots; ++at) {
		var badge = row.FindChildTraverse('Kill' + at);
		if (badge)
			badge.style.visibility = at < shown ? 'visible' : 'collapse';
	}
	var more = row.FindChildTraverse('KillMore');
	if (more)
		more.style.visibility = kills > Kc.slots ? 'visible' : 'collapse';

	return true;
};

KcBuild();

KcParkFx();
KcApply();
var KcGeneration = (typeof KcGeneration === 'undefined' ? 0 : KcGeneration) + 1;

var KcTick = function (generation) {
	if (generation !== KcGeneration)
		return;
	try {
		KcApply();
	} catch (error) {
			}
	$.Schedule(0.25, function () {
		KcTick(generation);
	});
};

$.Schedule(0.25, (function (generation) {
	return function () {
		KcTick(generation);
	};
})(KcGeneration));
