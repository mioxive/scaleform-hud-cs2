var RadBox = {
	inner: '#000000',
	square: '280px',
	squareInner: '270px',
	round: '260px',
	roundInner: '250px',
	vignette: '274px',
	vignettePaint: 'gradient( radial, 50% 50%, 0px 0px, 125px 125px, from( #00000000 ),'
		+ ' to( #00000044 ) )',
	onMap: '10px',
	offMap: '16px',
	death: '17px',
};

var RadFailures = {};

var RadSet = function (panel, property, value) {
	if (!panel)
		return;
	try {
		panel.style[property] = value;
	} catch (error) {
		if (!RadFailures[property]) {
			RadFailures[property] = true;
					}
	}
};

var RadDressFrame = function (radar) {
	radar.AddClass('radar-dressed');

	var square = radar.FindChildTraverse('Radar__Square');
	if (square) {
		RadSet(square, 'width', RadBox.square);
		RadSet(square, 'height', RadBox.square);
		RadSet(square, 'backgroundColor', RadBox.inner);

		var inner = square.FindChildTraverse('Radar__Square--Inner');
		if (inner) {
			RadSet(inner, 'width', RadBox.squareInner);
			RadSet(inner, 'height', RadBox.squareInner);
			RadSet(inner, 'backgroundColor', RadBox.inner);
			RadSet(inner, 'worldBlur', 'none');
		}
		var map = square.FindChildTraverse('Radar__Square--InnerTransform');
		if (map && map.BHasClass('additive'))
			map.RemoveClass('additive');

		var border = square.FindChildTraverse('Radar__Square--Border');
		if (border) {
			RadSet(border, 'width', RadBox.square);
			RadSet(border, 'height', RadBox.square);
			if (!square.FindChildTraverse('RadarVignette')) {
				var vignette = $.CreatePanel('Panel', square, 'RadarVignette');
				RadSet(vignette, 'width', RadBox.vignette);
				RadSet(vignette, 'height', RadBox.vignette);
				RadSet(vignette, 'horizontalAlign', 'center');
				RadSet(vignette, 'verticalAlign', 'center');
				RadSet(vignette, 'backgroundColor', RadBox.vignettePaint);
				square.MoveChildBefore(vignette, border);
			}
		}
	}

	var round = radar.FindChildTraverse('Radar__Round');
	if (round) {
		RadSet(round, 'width', RadBox.round);
		RadSet(round, 'height', RadBox.round);
		var roundInner = round.FindChildTraverse('Radar__Round--Inner');
		if (roundInner) {
			RadSet(roundInner, 'width', RadBox.roundInner);
			RadSet(roundInner, 'height', RadBox.roundInner);
			RadSet(roundInner, 'backgroundColor', RadBox.inner);
			RadSet(roundInner, 'worldBlur', 'none');
		}
		var roundMap = round.FindChildTraverse('Radar__Round--InnerTransform');
		if (roundMap && roundMap.BHasClass('additive'))
			roundMap.RemoveClass('additive');
		var roundBorder = round.FindChildTraverse('Radar__Round--Border');
		if (roundBorder) {
			RadSet(roundBorder, 'width', RadBox.round);
			RadSet(roundBorder, 'height', RadBox.round);
		}
	}
};

var RadDressIcons = function (icons) {
	icons.AddClass('radar-dressed');
	var each = function (id, dress) {
		var found = icons.FindChildTraverse(id);
		if (found)
			dress(found);
	};
	each('CTOnMap', function (panel) {
		RadSet(panel, 'width', RadBox.onMap);
		RadSet(panel, 'height', RadBox.onMap);
	});
	each('TOnMap', function (panel) {
		RadSet(panel, 'width', RadBox.onMap);
		RadSet(panel, 'height', RadBox.onMap);
	});
	each('CTOffMap', function (panel) {
		RadSet(panel, 'width', RadBox.offMap);
		RadSet(panel, 'height', RadBox.offMap);
	});
	each('TOffMap', function (panel) {
		RadSet(panel, 'width', RadBox.offMap);
		RadSet(panel, 'height', RadBox.offMap);
	});
	each('EnemyOffMap', function (panel) {
		RadSet(panel, 'width', RadBox.offMap);
		RadSet(panel, 'height', RadBox.offMap);
	});
	each('EnemyOnMap', function (panel) {
		RadSet(panel, 'imgShadow', 'none');
	});
	each('CTDeath', function (panel) {
		RadSet(panel, 'width', RadBox.death);
		RadSet(panel, 'height', RadBox.death);
	});
	each('TDeath', function (panel) {
		RadSet(panel, 'width', RadBox.death);
		RadSet(panel, 'height', RadBox.death);
	});
	each('EnemyDeath', function (panel) {
		RadSet(panel, 'width', RadBox.death);
		RadSet(panel, 'height', RadBox.death);
	});
};

var RadGeneration = (typeof RadGeneration === 'undefined' ? 0 : RadGeneration) + 1;

var RadTick = function (generation) {
	if (generation !== RadGeneration)
		return;
	try {
		var radar = contextPanel.FindChildTraverse('Radar');
		if (radar && !radar.BHasClass('radar-dressed'))
			RadDressFrame(radar);
		if (radar) {
			var rows = radar.FindChildrenWithClassTraverse('PlayerIcons');
			for (var at = 0; at < rows.length; ++at)
				if (!rows[at].BHasClass('radar-dressed'))
					RadDressIcons(rows[at]);
		}
	} catch (error) {
			}
	$.Schedule(0.5, function () {
		RadTick(generation);
	});
};

$.Schedule(0.5, (function (generation) {
	return function () {
		RadTick(generation);
	};
})(RadGeneration));
