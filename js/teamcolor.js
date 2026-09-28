var TeamColor = (function () {

	var Fallback = ['100,100,100', '199,187,139', '168,122,224', '116,172,87', '103,167,244', '234,124,68'];

	var Convar = function (name) {
		try {
			return GameInterfaceAPI.GetSettingString(name);
		} catch (error) {
			return '';
		}
	};

	var AsRGB = function (raw, fallback) {
		if (raw && String(raw).indexOf(' ') >= 0)
			return String(raw).split(' ').join(',');
		return fallback;
	};

	var colorRGB = [
		Fallback[0],
		AsRGB(Convar('cl_teammate_color_1'), Fallback[1]),
		AsRGB(Convar('cl_teammate_color_2'), Fallback[2]),
		AsRGB(Convar('cl_teammate_color_3'), Fallback[3]),
		AsRGB(Convar('cl_teammate_color_4'), Fallback[4]),
		AsRGB(Convar('cl_teammate_color_5'), Fallback[5]),
	];

	var GetTeamColor = function (index) {
		var at = Number(index);
		if (at >= 0 && at <= 4)
			return colorRGB[at + 1];
		return colorRGB[0];
	};

	var GetTeamColorCss = function (index) {
		return 'rgb(' + GetTeamColor(index) + ')';
	};

	return {
		GetTeamColor: GetTeamColor,
		GetTeamColorCss: GetTeamColorCss,
	};
})();
