var ReticleGeneration = (typeof ReticleGeneration === 'undefined' ? 0 : ReticleGeneration) + 1;

var ReticleDress = function (content) {
	if (!content.BHasClass('additive'))
		content.AddClass('additive');

	var names = content.FindChildrenWithClassTraverse('playerid__name');
	for (var at = 0; at < names.length; ++at) {
		try {
			names[at].style.fontSize = '26px';
			names[at].style.padding = '0px 2px 0px 2px';
			names[at].style.letterSpacing = '0px';
		} catch (error) {
						return;
		}
	}
};

var ReticleTick = function (generation) {
	if (generation !== ReticleGeneration)
		return;
	try {
		var host = contextPanel.FindChildTraverse('VisiblePlayerIDs');
		if (host) {
			var cards = host.FindChildrenWithClassTraverse('playerid__content');
			for (var at = 0; at < cards.length; ++at) {
				if (!cards[at].BHasClass('dressed')) {
					cards[at].AddClass('dressed');
					ReticleDress(cards[at]);
				}
			}
		}
	} catch (error) {
			}
	$.Schedule(0.25, function () {
		ReticleTick(generation);
	});
};

$.Schedule(0.25, (function (generation) {
	return function () {
		ReticleTick(generation);
	};
})(ReticleGeneration));
