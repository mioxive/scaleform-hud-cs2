var Kc = {
	cardWidth: 24,
	cardHeight: 24,
	cardGap: 1,
	slots: 5,
	rowX: 6,
	rowY: 3,
	rowWidth: 126,
	rowHeight: 28,
	moreWidth: 64,
	moreHeight: 24,
	moreIcon: 24,
	moreTimesX: 28,
	moreCountX: 39,
	countSize: '20px',
	countColor: '#f0eee4',
	fxPark: -3000,
	popMs: 330,
};

var KcHiddenIds = ['hud-HA__kills', 'hud-HA__kills--fx', 'hud-HA__Specialkills--fx'];

var KcSet = function (panel, property, value) {
	if (!panel)
		return;
	try {
		panel.style[property] = value;
	} catch (error) {
	}
};

var KcHideStock = function () {
	var cards = null;
	for (var at = 0; at < KcHiddenIds.length; ++at) {
		var panel = contextPanel.FindChildTraverse(KcHiddenIds[at]);
		if (!panel)
			continue;
		KcSet(panel, 'visibility', 'collapse');
		if (at === 0)
			cards = panel;
	}
	return cards;
};

var KcParkFx = function () {
	for (var at = 1; at < KcHiddenIds.length; ++at) {
		var fx = contextPanel.FindChildTraverse(KcHiddenIds[at]);
		if (fx && !fx.BHasClass('fx-parked')) {
			fx.AddClass('fx-parked');
			KcSet(fx, 'y', Kc.fxPark + 'px');
		}
	}
};

var KcListeners = ['HUD--on-kill--listener', 'HUD--health--on-damage--listener',
	'HUD--has-armor--on-pickup--listener', 'HUD--on-reload--listener',
	'HUD--weapon--on-change--listener', 'HUD--weapon--on-fired--listener'];

var KcNoGlow = function (cards) {
	var owner = cards.GetParent();
	if (!owner)
		return;
	for (var at = 0; at < KcListeners.length; ++at) {
		var listener = KcListeners[at];
		var trigger = listener.substring(0, listener.length - '--listener'.length);
		for (var hit of owner.FindChildrenWithClassTraverse(listener))
			hit.RemoveClass(listener);
		for (var lit of owner.FindChildrenWithClassTraverse(trigger))
			lit.RemoveClass(trigger);
	}
};

var KcHasClassUp = function (panel, name) {
	for (var at = panel; at; at = at.GetParent()) {
		if (at.BHasClass(name))
			return true;
	}
	return false;
};

var KcCount = function (cards) {
	if (KcHasClassUp(cards, 'HUD--NumKills--extra'))
		return Kc.slots + 1;
	for (var n = Kc.slots; n >= 1; --n)
		if (KcHasClassUp(cards, 'HUD--NumKills--' + n))
			return n;
	return 0;
};

var KcHeadshot = function (cards, index) {
	return KcHasClassUp(cards, 'HUD--Kill' + index + '--headshot');
};

var KcOldRow = contextPanel.FindChildTraverse('Kills');
if (KcOldRow)
	KcOldRow.DeleteAsync(0);

var KcParent = function () {
	return contextPanel.FindChildTraverse('Ammo') || contextPanel;
};

var KcRow = null;
var KcLastCount = -1;

var KcBuild = function (parent) {
	var row = $.CreatePanel('Panel', parent, 'Kills');
	row.hittest = false;
	row.style.width = Kc.rowWidth + 'px';
	row.style.height = Kc.rowHeight + 'px';
	row.style.x = Kc.rowX + 'px';
	row.style.y = Kc.rowY + 'px';
	row.style.horizontalAlign = 'left';
	row.style.verticalAlign = 'top';
	row.style.flowChildren = 'right';
	row.style.overflow = 'noclip';
	row.style.zIndex = '5';
	row.style.visibility = 'collapse';
	var more = $.CreatePanel('Panel', row, 'KillMore');
	more.hittest = false;
	more.style.width = Kc.moreWidth + 'px';
	more.style.height = Kc.moreHeight + 'px';
	more.style.visibility = 'collapse';
	PaintArt(more, 'killicon', {size: Kc.cardWidth + 'px ' + Kc.cardHeight + 'px'});
	var moreIcon = $.CreatePanel('Panel', more, 'KillMoreIcon');
	moreIcon.hittest = false;
	moreIcon.style.width = Kc.moreIcon + 'px';
	moreIcon.style.height = Kc.moreIcon + 'px';
	moreIcon.style.x = '0px';
	moreIcon.style.y = '0px';
	PaintArt(moreIcon, 'killoutline', {size: Kc.moreIcon + 'px ' + Kc.moreIcon + 'px'});
	var moreTimes = $.CreatePanel('Label', more, 'KillMoreTimes');
	moreTimes.hittest = false;
	moreTimes.style.x = Kc.moreTimesX + 'px';
	moreTimes.style.y = '0px';
	moreTimes.style.verticalAlign = 'center';
	moreTimes.style.fontFamily = 'Stratum2';
	moreTimes.style.fontSize = Kc.countSize;
	moreTimes.style.fontWeight = 'bold';
	moreTimes.style.color = Kc.countColor;
	moreTimes.style.textShadow = '1px 1px 0px #000000';
	moreTimes.text = 'x';
	var moreCount = $.CreatePanel('Label', more, 'KillMoreCount');
	moreCount.hittest = false;
	moreCount.style.x = Kc.moreCountX + 'px';
	moreCount.style.y = '0px';
	moreCount.style.verticalAlign = 'center';
	moreCount.style.fontFamily = 'Stratum2';
	moreCount.style.fontSize = Kc.countSize;
	moreCount.style.fontWeight = 'bold';
	moreCount.style.color = Kc.countColor;
	moreCount.style.textShadow = '1px 1px 0px #000000';

	for (var at = 0; at < Kc.slots; ++at) {
		var card = $.CreatePanel('Panel', row, 'Kill' + (at + 1));
		card.hittest = false;
		card.style.width = Kc.cardWidth + 'px';
		card.style.height = Kc.cardHeight + 'px';
		card.style.marginRight = Kc.cardGap + 'px';
		card.style.overflow = 'noclip';
		card.style.visibility = 'collapse';
		card._kcHeadshot = false;
		PaintArt(card, 'killicon', {size: '100% 100%'});
	}
	return row;
};

var KcSetCardArt = function (card, headshot) {
	if (card._kcHeadshot === headshot)
		return;
	card._kcHeadshot = headshot;
	if (headshot) {
		PaintArt(card, 'killiconhs', {size: '22px 22px', position: 'center center'});
	} else {
		PaintArt(card, 'killicon', {size: '100% 100%', position: 'center center'});
	}
};

var KcPop = function (card) {
	card.style.transitionProperty = 'pre-transform-scale2d, opacity';
	card.style.transitionDuration = '0.12s';
	card.style.transitionTimingFunction = 'ease-out';
	card.style.transitionDelay = '0s';
	card.style.preTransformScale2d = '0.4';
	card.style.opacity = '0.0';
	$.Schedule(0.0, function () {
		card.style.preTransformScale2d = '1.25';
		card.style.opacity = '1.0';
	});
	$.Schedule(0.12, function () {
		card.style.preTransformScale2d = '1.0';
	});
};

var KcApply = function () {
	var cards = KcHideStock();
	if (!cards)
		return false;
	KcNoGlow(cards);

	var parent = KcParent();
	if (KcRow && KcRow.IsValid() && KcRow.GetParent() !== parent)
		KcRow.SetParent(parent);
	if (!KcRow || !KcRow.IsValid())
		return false;

	var kills = KcCount(cards);
	var extra = KcHasClassUp(cards, 'HUD--NumKills--extra');
	var shown = extra ? 0 : Math.min(kills, Kc.slots);

	if (KcRow.BHasClass('kc-active') !== (kills > 0)) {
		KcRow.SetHasClass('kc-active', kills > 0);
		KcRow.style.visibility = kills > 0 ? 'visible' : 'collapse';
	}

	for (var at = 1; at <= Kc.slots; ++at) {
		var card = KcRow.FindChildTraverse('Kill' + at);
		if (!card)
			continue;
		var visible = at <= shown;
		var wasVisible = card.BHasClass('kc-visible');
		card.SetHasClass('kc-visible', visible);
		card.style.visibility = visible ? 'visible' : 'collapse';
		if (visible)
			KcSetCardArt(card, KcHeadshot(cards, at));
		if (visible && !wasVisible && kills > KcLastCount)
			KcPop(card);
	}

	var more = KcRow.FindChildTraverse('KillMore');
	if (more) {
		more.style.visibility = extra ? 'visible' : 'collapse';
		if (extra) {
			var countLabel = KcRow.FindChildTraverse('KillMoreCount');
			if (countLabel) {
				var total = cards.FindChildTraverse('hud-HA-kill-count');
				var n = total ? parseInt(total.text, 10) : 0;
				countLabel.text = String(isFinite(n) && n > 0 ? n : kills);
			}
		}
	}

	KcLastCount = kills;
	return true;
};

KcParkFx();
var KcGeneration = (typeof KcGeneration === 'undefined' ? 0 : KcGeneration) + 1;

var KcTick = function (generation) {
	if (generation !== KcGeneration)
		return;
	try {
		var parent = KcParent();
		if ((!KcRow || !KcRow.IsValid()) && parent)
			KcRow = KcBuild(parent);
		KcApply();
	} catch (error) {
	}
	$.Schedule(0.1, function () {
		KcTick(generation);
	});
};

$.Schedule(0.0, (function (generation) {
	return function () {
		KcTick(generation);
	};
})(KcGeneration));
