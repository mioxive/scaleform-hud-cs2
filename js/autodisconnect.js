var AdGeneration = (typeof AdGeneration === 'undefined' ? 0 : AdGeneration) + 1;

var AdOnce = function (panel, marker) {
	if (!panel || panel.BHasClass(marker))
		return false;
	panel.AddClass(marker);
	return true;
};

var AdSet = function (panel, prop, value) {
	if (!panel)
		return;
	try {
		panel.style[prop] = value;
	} catch (error) {
			}
};

var AdApply = function () {
	var root = contextPanel.FindChildTraverse('HudAutoDisconnect');
	if (!root)
		return;
	var container = root.FindChildrenWithClassTraverse('auto-disconnect-container')[0];
	if (container && AdOnce(container, 'ad-container')) {
		AdSet(container, 'padding', '16px');
		AdSet(container, 'backgroundColor', '#000000CC');
		AdSet(container, 'borderRadius', '0px');
	}
	AdSet(root, 'horizontalAlign', 'right');
	AdSet(root, 'marginRight', '10px');

	var top = root.FindChildTraverse('TopLabel');
	if (top && AdOnce(top, 'ad-top')) {
		AdSet(top, 'fontFamily', 'Stratum2');
		AdSet(top, 'fontWeight', 'medium');
		AdSet(top, 'fontSize', '32px');
		AdSet(top, 'textAlign', 'center');
		AdSet(top, 'padding', '4px');
		AdSet(top, 'color', '#ff3d3d');
		AdSet(top, 'textShadow', '1px 1px 2px #000000AA');
	}

	var bottom = root.FindChildTraverse('BottomLabel');
	if (bottom && AdOnce(bottom, 'ad-bottom')) {
		AdSet(bottom, 'fontFamily', 'Stratum2');
		AdSet(bottom, 'fontWeight', 'medium');
		AdSet(bottom, 'fontSize', '28px');
		AdSet(bottom, 'textAlign', 'center');
		AdSet(bottom, 'padding', '4px');
		AdSet(bottom, 'color', '#ff3d3d');
		AdSet(bottom, 'textShadow', '1px 1px 2px #000000AA');
	}

	var icon = root.FindChildTraverse('TimerIcon');
	if (icon && AdOnce(icon, 'ad-icon'))
		AdSet(icon, 'washColor', '#ff3d3d');
};

var AdTick = function (generation) {
	if (generation !== AdGeneration)
		return;
	try {
		AdApply();
	} catch (error) {
			}
	$.Schedule(0.5, function () {
		AdTick(generation);
	});
};

AdTick(AdGeneration);
