var OldRoot = contextPanel.FindChildTraverse('MoneyRoot');
if (OldRoot)
	OldRoot.DeleteAsync(0);

var Root = $.CreatePanel('Panel', contextPanel, 'MoneyRoot');
Root.style.width = '100%';
Root.style.height = '100%';
Root.style.zIndex = '20';
Root.hittest = false;

var MoneyBase = {
	left: 0,
	top: 385,
	width: 250,
	height: 39,
	fontSize: 31,
	rowLeft: 9,
	iconSize: 28,
	iconGap: 26,
};

var PlateAlpha = 'f6';
var PlateGradient = 'gradient( linear, 100% 0%, 0% 0%, from( #00000000 ), color-stop( 0.25, #000000' + PlateAlpha + ' ), to( #000000' + PlateAlpha + ' ) )';
var MoneyPlate = $.CreatePanel('Panel', Root, 'Money');

MoneyPlate.style.horizontalAlign = 'left';
MoneyPlate.style.verticalAlign = 'top';
MoneyPlate.style.marginLeft = MoneyBase.left + 'px';
MoneyPlate.style.marginTop = MoneyBase.top + 'px';
MoneyPlate.style.width = MoneyBase.width + 'px';
MoneyPlate.style.height = MoneyBase.height + 'px';
MoneyPlate.style.backgroundColor = PlateGradient;
MoneyPlate.style.visibility = 'collapse';

var MoneyApplyAlpha = function (alpha) {
	if (typeof alpha !== 'number' || !isFinite(alpha) || !MoneyPlate)
		return false;
	alpha = Math.max(0, Math.min(1, alpha));
	var scaled = Math.round(parseInt(PlateAlpha, 16) * alpha);
	var hex = ('0' + scaled.toString(16)).slice(-2);
	var gradient = 'gradient( linear, 100% 0%, 0% 0%, from( #00000000 ), color-stop( 0.25, #000000'
		+ hex + ' ), to( #000000' + hex + ' ) )';
	if (MoneyPlate.Gradient === gradient)
		return true;
	MoneyPlate.Gradient = gradient;
	MoneyPlate.style.backgroundColor = gradient;
	return true;
};

var MoneyRow = $.CreatePanel('Panel', MoneyPlate, 'MoneyRow');
MoneyRow.style.flowChildren = 'right';
MoneyRow.style.width = 'fit-children';
MoneyRow.style.height = '100%';
MoneyRow.style.horizontalAlign = 'left';
MoneyRow.style.marginLeft = MoneyBase.rowLeft + 'px';

var MoneyBuyIcon = $.CreatePanel('Image', MoneyRow, 'MoneyBuyIcon');
MoneyBuyIcon.SetImage('s2r://panorama/images/icons/ui/buyzone.vsvg');
MoneyBuyIcon.AddClass('additive');
MoneyBuyIcon.style.width = MoneyBase.iconSize + 'px';
MoneyBuyIcon.style.height = MoneyBase.iconSize + 'px';
MoneyBuyIcon.style.marginRight = MoneyBase.iconGap + 'px';
MoneyBuyIcon.style.verticalAlign = 'center';
MoneyBuyIcon.style.washColor = '#7CC213';
MoneyBuyIcon.style.opacity = '0.0';

var MoneyText = $.CreatePanel('Label', MoneyRow, 'MoneyText');
MoneyText.style.verticalAlign = 'center';
MoneyText.style.fontFamily = 'Stratum2 Bold Monodigit';
MoneyText.style.fontSize = MoneyBase.fontSize + 'px';
MoneyText.style.color = '#ffffffff';
MoneyText.style.textShadow = '2px 1px 2px 1.0 #000000cc';

var Cs2Money = contextPanel.FindChildTraverse('HudMoney');
if (!Cs2Money) {
} else {
	var ReadMoney = function () {
		try {
			return $.Localize('#buymenu_money', Cs2Money);
		} catch (error) {
			return null;
		}
	};

	var ShowMoney = function (amount) {
		if (typeof amount === 'number') {
			MoneyText.text = '$' + amount;
			return;
		}
		var formatted = ReadMoney();
		if (formatted && formatted.length > 1)
			MoneyText.text = formatted;
	};

	ShowMoney(null);

	if (typeof MoneyHandler !== 'undefined' && MoneyHandler !== null)
		$.UnregisterEventHandler('UpdateHudMoney', Cs2Money, MoneyHandler);

	var MoneyHandler = $.RegisterEventHandler('UpdateHudMoney', Cs2Money, function (amount) {
		ShowMoney(amount);
	});

	for (var drawn of Cs2Money.FindChildrenWithClassTraverse('money-text'))
		drawn.style.visibility = 'collapse';
}

var HideBuyMenuMoney = function () {
	for (var id of ['BuyMenuMoney', 'buymenu-info-money']) {
		var panel = contextPanel.FindChildTraverse(id);
		if (!panel || panel.BHasClass('money-hidden'))
			continue;
		var parts = panel.FindChildrenWithClassTraverse('money-text');
		if (!parts.length)
			continue;
		for (var at = 0; at < parts.length; ++at)
			parts[at].style.visibility = 'collapse';
		panel.AddClass('money-hidden');
	}
};
var MoneyDrawn = function () {
	var panel = contextPanel.FindChildTraverse('HudMoney');
	if (!panel)
		return false;
	for (var at = panel; at && at !== contextPanel; at = at.GetParent()) {
		if (!at.visible || at.BIsTransparent())
			return false;
	}
	return true;
};

var MarkState = function (panel, marker, on) {
	if (panel.BHasClass(marker) === on)
		return false;
	if (on)
		panel.AddClass(marker);
	else
		panel.RemoveClass(marker);
	return true;
};

var HudTick = function () {
	try {
		HideBuyMenuMoney();

		var plate = contextPanel.FindChildTraverse('Money');
		var icon = contextPanel.FindChildTraverse('MoneyBuyIcon');
		var owner = contextPanel.FindChildTraverse('HudMoney');
		if (plate && icon && owner) {
			var drawn = MoneyDrawn();
			if (MarkState(plate, 'money-drawn', drawn)) {
				plate.style.visibility = drawn ? 'visible' : 'collapse';
			}
			var inBuyZone = owner.BHasClass('money__in-buy-zone');
			if (MarkState(icon, 'buy-shown', inBuyZone)) {
				icon.style.opacity = inBuyZone ? '0.8' : '0.0';
			}
		}
	} catch (error) {
			}
	$.Schedule(0.25, function () {
		HudTick();
	});
};

if (typeof HudStarted === 'undefined') {
	var HudStarted = true;
	$.Schedule(0.25, function () {
		HudTick();
	});
}
