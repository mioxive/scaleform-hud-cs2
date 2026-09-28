var Child = function (root, id) {
	return root ? root.FindChildTraverse(id) : null;
};

var Paint = function (panel, token, size) {
	return PaintArt(panel, token, {size: size, opacity: PlateImgOpacity});
};

var PlateImgOpacity = '1.0';
var PlateHeight = 46;
var PlateWidth = 410;
var PixelGap = 1;

var Dashboard = Child(contextPanel, 'DashboardLabel');
if (Paint(Dashboard, 'topleft')) {
	Dashboard.RemoveClass('additive');
	Dashboard.style.horizontalAlign = 'left';
	Dashboard.style.verticalAlign = 'top';
	Dashboard.style.marginLeft = PixelGap + 'px';
	Dashboard.style.marginTop = PixelGap + 'px';
	Dashboard.style.width = PlateWidth + 'px';
	Dashboard.style.height = PlateHeight + 'px';
	Dashboard.style.paddingTop = '10px';
	Dashboard.style.paddingLeft = '14px';
	Dashboard.style.textAlign = 'left';
	Dashboard.style.fontFamily = 'Stratum2';
	Dashboard.style.fontWeight = 'bold';
	Dashboard.style.fontSize = '26px';
	Dashboard.style.letterSpacing = '0px';
	Dashboard.style.opacity = '1.0';

	var RadarRoot = Dashboard.GetParent();
	var RadarPanel = Child(contextPanel, 'Radar');

	while (RadarRoot && RadarPanel && RadarRoot.GetParent() !== RadarPanel.GetParent())
		RadarRoot = RadarRoot.GetParent();
	if (RadarRoot && RadarPanel && RadarRoot.GetParent() === RadarPanel.GetParent()) {
		RadarRoot.GetParent().MoveChildBefore(RadarRoot, RadarPanel);
		RadarPanel.style.y = (40 + PlateHeight + PixelGap) + 'px';
	}
}

for (var alert of contextPanel.FindChildrenWithClassTraverse('AlertText')) {
	alert.style.backgroundColor =
		'gradient( linear, 100% 0%, 0% 0%, from( #00000000 ), color-stop( 0.7, #00000077 ), to( #00000077 ) )';
	alert.style.textShadow = '1px 1px 2px #00000055';
	alert.style.fontFamily = 'Stratum2';
	alert.style.fontWeight = 'normal';
	alert.style.fontSize = '21.5px';
	alert.style.letterSpacing = '.43px';
	alert.style.paddingLeft = '28px';
	alert.style.paddingBottom = '0px';
}
