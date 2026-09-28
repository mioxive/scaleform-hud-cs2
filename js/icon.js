var IconUtil = (function () {

	var FallbackPng = function (elIconPanel, basePath) {
		var tried = false;
		try {
			$.RegisterEventHandler('ImageFailedLoad', elIconPanel, function () {
				if (tried)
					return;
				tried = true;
				elIconPanel.SetImage(basePath + '.png');
			});
		} catch (error) {
		}
	};

	return {
		FallbackPng: FallbackPng,
	};
})();
