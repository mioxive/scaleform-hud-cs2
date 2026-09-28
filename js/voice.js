var VoiceGeneration = (typeof VoiceGeneration === 'undefined' ? 0 : VoiceGeneration) + 1;

var VoiceDress = function (notice) {
	var texts = notice.FindChildrenWithClassTraverse('VoiceText');
	for (var at = 0; at < texts.length; ++at) {
		try {
			texts[at].style.color = '#7099DA';
			texts[at].style.fontSize = '22px';
			texts[at].style.fontWeight = 'medium';
			texts[at].style.letterSpacing = '0px';
			texts[at].style.textShadow = '1px 1px 0px #000000';
		} catch (error) {
						return;
		}
	}
};

var VoiceTick = function (generation) {
	if (generation !== VoiceGeneration)
		return;
	try {
		var host = contextPanel.FindChildTraverse('VoicePanel');
		if (host) {
			var notices = host.FindChildrenWithClassTraverse('VoiceNotice');
			for (var at = 0; at < notices.length; ++at) {
				if (!notices[at].BHasClass('dressed')) {
					notices[at].AddClass('dressed');
					VoiceDress(notices[at]);
				}
			}
		}
	} catch (error) {
			}
	$.Schedule(0.25, function () {
		VoiceTick(generation);
	});
};

$.Schedule(0.25, (function (generation) {
	return function () {
		VoiceTick(generation);
	};
})(VoiceGeneration));
