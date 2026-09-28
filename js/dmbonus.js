var DbGeneration = (typeof DbGeneration === 'undefined' ? 0 : DbGeneration) + 1;

var DbOnce = function (panel, marker) {
	if (!panel || panel.BHasClass(marker))
		return false;
	panel.AddClass(marker);
	return true;
};

var DbSet = function (panel, prop, value) {
	if (!panel)
		return;
	try {
		panel.style[prop] = value;
	} catch (error) {
			}
};

var DbShadow = '1px 1px 1px 1.0 #000000';

var DbApply = function () {
	var root = contextPanel.FindChildTraverse('HudDMBonusPanel');
	if (!root)
		return;

	var bg = root.FindChildrenWithClassTraverse('bonuspanel-bg')[0];
	if (bg && DbOnce(bg, 'dm-bg')) {
		DbSet(bg, 'width', '400px');
		DbSet(bg, 'height', '100%');
		DbSet(bg, 'backgroundColor', 'gradient( linear, 0% 0%, 100% 0%,'
			+ ' from( #000000ED ), color-stop( 0.8, #00000020 ), to( #00000000 ) )');
	}

	for (var edge of root.FindChildrenWithClassTraverse('bonuspanel-bkg-TOP'))
		if (DbOnce(edge, 'dm-edge')) {
			DbSet(edge, 'width', '400px');
			DbSet(edge, 'height', '2px');
			DbSet(edge, 'backgroundColor', 'gradient( linear, 100% 0%, 0% 0%,'
				+ ' from( #00000000 ), to( #000000BB ) )');
		}
	for (var edge2 of root.FindChildrenWithClassTraverse('bonuspanel-bkg-BOT'))
		if (DbOnce(edge2, 'dm-edge2')) {
			DbSet(edge2, 'width', '400px');
			DbSet(edge2, 'height', '2px');
			DbSet(edge2, 'verticalAlign', 'bottom');
			DbSet(edge2, 'backgroundColor', 'gradient( linear, 100% 0%, 0% 0%,'
				+ ' from( #00000000 ), to( #000000BB ) )');
		}

	for (var title of root.FindChildrenWithClassTraverse('bonuspanel-title-text'))
		if (DbOnce(title, 'dm-title')) {
			DbSet(title, 'fontFamily', 'Stratum2');
			DbSet(title, 'fontSize', '16px');
			DbSet(title, 'color', '#dddddd');
			DbSet(title, 'textShadow', DbShadow);
		}

	for (var weapon of root.FindChildrenWithClassTraverse('bonuspanel-title-weapon'))
		if (DbOnce(weapon, 'dm-weapon')) {
			DbSet(weapon, 'fontFamily', 'Stratum2');
			DbSet(weapon, 'fontWeight', 'medium');
			DbSet(weapon, 'fontSize', '22px');
			DbSet(weapon, 'color', '#ffffff');
			DbSet(weapon, 'textShadow', DbShadow);
			DbSet(weapon, 'paddingLeft', '4px');
		}

	for (var points of root.FindChildrenWithClassTraverse('bonuspanel-points'))
		if (DbOnce(points, 'dm-points')) {
			DbSet(points, 'fontFamily', 'Stratum2');
			DbSet(points, 'fontWeight', 'medium');
			DbSet(points, 'fontSize', '26px');
			DbSet(points, 'color', '#ffffff');
			DbSet(points, 'textShadow', DbShadow);
			DbSet(points, 'verticalAlign', 'bottom');
			DbSet(points, 'textAlign', 'center');
		}

	for (var timer of root.FindChildrenWithClassTraverse('bonuspanel-timer-text'))
		if (DbOnce(timer, 'dm-timer')) {
			DbSet(timer, 'fontFamily', 'Stratum2 Bold Monodigit');
			DbSet(timer, 'fontWeight', 'bold');
			DbSet(timer, 'fontSize', '50px');
			DbSet(timer, 'color', '#ffffff');
			DbSet(timer, 'horizontalAlign', 'center');
			DbSet(timer, 'verticalAlign', 'middle');
		}

	for (var icon of root.FindChildrenWithClassTraverse('bonuspanel-icon'))
		if (DbOnce(icon, 'dm-icon')) {
			DbSet(icon, 'height', '64px');
			DbSet(icon, 'color', 'white');
			DbSet(icon, 'verticalAlign', 'center');
		}

	for (var killPoints of root.FindChildrenWithClassTraverse('bonuspanel-bonuspoints-points'))
		if (DbOnce(killPoints, 'dm-killpoints')) {
			DbSet(killPoints, 'fontFamily', 'Stratum2');
			DbSet(killPoints, 'fontWeight', 'bold');
			DbSet(killPoints, 'fontSize', '32px');
			DbSet(killPoints, 'color', '#ffffff');
			DbSet(killPoints, 'textShadow', DbShadow);
		}
};

var DbTick = function (generation) {
	if (generation !== DbGeneration)
		return;
	try {
		DbApply();
	} catch (error) {
			}
	$.Schedule(0.5, function () {
		DbTick(generation);
	});
};

DbTick(DbGeneration);
