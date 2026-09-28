var TcRoot = function (counter) {
	return counter || contextPanel.FindChildTraverse('HudTeamCounter');
};

var SetFailures = {};

var Set = function (panel, property, value) {
	try {
		panel.style[property] = value;
	} catch (error) {
		if (!SetFailures[property]) {
			SetFailures[property] = true;
					}
	}
};

var Tc = {
	plate: '#000000d4',
	timerSize: '23px',
	scoreSize: '22px',
	scoreCt: '#6f9ec4',
	scoreT: '#b99636',
	scoreGap: '1px',
	aliveWidth: '54px',
	aliveHeight: '54px',
	aliveGap: '3px',
	countSize: '40px',
	aliveTextSize: '13px',
	aliveTextColor: '#999999',
	timerHeight: '27px',
	scoreRowHeight: '27px',
	scoreBgHeight: '27px',
	scoreBgTop: '1px',
	columnWidth: 75,
	bombY: '-19px',
	bombHeight: '84px',
};

var ChromeClasses = ['equipinfo__bg-container', 'equipinfo__container', 'healthbar-container',
	'healthbar__bg', 'healthbar__health-number', 'equipinfo__row--health', 'AvatarL__HealthBar',
	'AvatarL_BG', 'AvatarL__name', 'prdr__root'];

var ChromeIds = ['PlayerCount'];

var HideChrome = function (counter) {
	var root = TcRoot(counter);
	if (!root)
		return;
	for (var group of ChromeClasses) {
		var panels = root.FindChildrenWithClassTraverse(group);
		for (var at = 0; at < panels.length; ++at) {
			Set(panels[at], 'visibility', 'collapse');
			panels[at].RemoveClass(group);
		}
	}
	for (var id of ChromeIds) {
		var panel = root.FindChildTraverse(id);
		if (panel)
			Set(panel, 'visibility', 'collapse');
	}
};

var StyleScore = function (counter) {
	var root = TcRoot(counter);
	if (!root)
		return;
	var timer = root.FindChildTraverse('TimerText');
	if (timer) {
		Set(timer, 'fontFamily', 'Stratum2 Bold Monodigit');
		Set(timer, 'fontSize', Tc.timerSize);
		Set(timer, 'color', '#ffffff');
	}
	var timerBox = root.FindChildTraverse('Timer');
	if (timerBox)
		Set(timerBox, 'backgroundColor', Tc.plate);
	var gameTime = root.FindChildTraverse('GameTime');
	if (gameTime)
		Set(gameTime, 'height', Tc.timerHeight);

	var gap = parseInt(Tc.scoreGap, 10) || 0;

	var scoreBgRight = Math.floor((Tc.columnWidth - gap) / 2);
	var scoreBgLeft = Tc.columnWidth - gap - scoreBgRight;
	var column = root.FindChildTraverse('ScoreAndTimeAndBomb');
	if (column)
		Set(column, 'width', Tc.columnWidth + 'px');
	if (timer)
		Set(timer, 'width', (Tc.columnWidth - 2) + 'px');

	for (var side of [['ScoreCT', Tc.scoreCt], ['ScoreT', Tc.scoreT]]) {
		var score = root.FindChildTraverse(side[0]);
		if (!score)
			continue;
		Set(score, 'fontFamily', 'Stratum2 Bold Monodigit');
		Set(score, 'fontSize', Tc.scoreSize);
		Set(score, 'color', side[1]);
		score.RemoveClass('additive');
	}

	for (var bgSide of [['GameScore__BGL', 'marginRight', scoreBgLeft], ['GameScore__BGR', 'marginLeft', scoreBgRight]])
		for (var bg of root.FindChildrenWithClassTraverse(bgSide[0])) {
			Set(bg, 'backgroundColor', Tc.plate);
			Set(bg, bgSide[1], Tc.scoreGap);
			Set(bg, 'height', Tc.scoreBgHeight);
			Set(bg, 'marginTop', Tc.scoreBgTop);
			Set(bg, 'width', bgSide[2] + 'px');
		}
	var scoreRow = root.FindChildTraverse('GameScore');
	if (scoreRow) {
		Set(scoreRow, 'marginTop', Tc.scoreGap);
		Set(scoreRow, 'height', Tc.scoreRowHeight);
	}

	var bombStatus = root.FindChildTraverse('BombStatus');
	if (bombStatus) {
		Set(bombStatus, 'y', Tc.bombY);
		Set(bombStatus, 'height', Tc.bombHeight);
	}
};

var CountSide = function (box, counter) {
	for (var at = box; at && at !== counter; at = at.GetParent()) {
		if (at.BHasClass('team__large_container--left'))
			return 'left';
		if (at.BHasClass('team__large_container--right'))
			return 'right';
	}
	return null;
};

var StyleCompact = function (counter, compact) {
	var root = TcRoot(counter);
	if (!root)
		return;

	for (var rowId of ['TeamLargeCT', 'TeamLargeT']) {
		var row = root.FindChildTraverse(rowId);
		if (row)
			Set(row, 'visibility', compact ? 'collapse' : 'visible');
	}

	var boxes = root.FindChildrenWithClassTraverse('TeamLarge__PlayerCount');
	for (var fresh = 0; fresh < boxes.length; ++fresh) {
		var side = CountSide(boxes[fresh], root);
		if (!side)
			continue;
		boxes[fresh].AddClass(side === 'left' ? 'alive-ct' : 'alive-t');
		boxes[fresh].RemoveClass('TeamLarge__PlayerCount');
	}

	var sides = [['alive-ct', 'alivect', 'right'], ['alive-t', 'alivet', 'left']];
	for (var pair of sides) {
		var found = root.FindChildrenWithClassTraverse(pair[0]);
		for (var at = 0; at < found.length; ++at) {
			var box = found[at];
			var parent = box.GetParent();
			var direct = parent && (parent.BHasClass('horizontal-align-right')
				|| parent.BHasClass('team__large_container--left')
				|| parent.BHasClass('team__large_container--right')
				|| (parent.GetParent() && (parent.GetParent().BHasClass('team__large_container--left')
					|| parent.GetParent().BHasClass('team__large_container--right'))));
			if (!direct) {
				Set(box, 'visibility', 'collapse');
				continue;
			}
			Set(box, 'visibility', 'visible');
			Set(box, 'width', Tc.aliveWidth);
			Set(box, 'height', Tc.aliveHeight);
			Set(box, 'horizontalAlign', pair[2]);
			Set(box, 'verticalAlign', 'top');
			Set(box, 'marginLeft', Tc.aliveGap);
			Set(box, 'marginRight', Tc.aliveGap);
			Set(box, 'opacity', compact ? '1.0' : '0.0');
			PaintArt(box, pair[1]);
			Set(box, 'fontFamily', 'Stratum2 Bold Monodigit');
			Set(box, 'fontSize', Tc.countSize);
			Set(box, 'color', '#ffffff');
			Set(box, 'textShadow', '0px 0px 2px 4.0 #000000');
			Set(box, 'textAlign', 'center');
			Set(box, 'paddingTop', '2px');

			for (var alive of box.Children()) {
				Set(alive, 'fontFamily', 'Stratum2');
				Set(alive, 'fontWeight', 'light');
				Set(alive, 'fontSize', Tc.aliveTextSize);
				Set(alive, 'color', Tc.aliveTextColor);
				Set(alive, 'opacity', '0.57');
				Set(alive, 'textShadow', '1px 1px 1px 2.0 #000000');
				Set(alive, 'textAlign', 'center');
				Set(alive, 'horizontalAlign', 'center');
				Set(alive, 'verticalAlign', 'top');
				Set(alive, 'marginTop', '37px');
				Set(alive, 'marginLeft', '0px');
				Set(alive, 'marginRight', '0px');
				Set(alive, 'height', '14px');
				Set(alive, 'width', '100%');
			}
		}
	}
};

var TileTeam = function (tile, counter) {
	for (var at = tile; at && at !== counter; at = at.GetParent()) {
		if (at.id === 'TeamLargeCT')
			return 'ct';
		if (at.id === 'TeamLargeT')
			return 't';
	}
	return null;
};

var StyleAvatars = function (counter) {
	var root = TcRoot(counter);
	if (!root)
		return;
	var tiles = root.FindChildrenWithClassTraverse('AvatarLargeSnippet');
	for (var at = 0; at < tiles.length; ++at) {
		var tile = tiles[at];
		var team = TileTeam(tile, root);
		var imageBg = tile.FindChildTraverse('AvatarL__ImageBG');
		if (imageBg && team) {
			Set(imageBg, 'border', '0px solid #00000000');
			PaintArt(imageBg, team === 'ct' ? 'teamct' : 'teamt',
				{size: '92% 86%', position: '50% 25%'});
		}
		var skull = tile.FindChildTraverse('Skull');
		if (skull)
			PaintArt(skull, 'aliveskull');
	}
};

var CounterApply = function () {
	var counter = contextPanel.FindChildTraverse('HudTeamCounter');
	if (!counter)
		return;
	var compact = counter.BHasClass('PlayerCountInsteadOfAvatars');
	if (counter.BHasClass('counter-compact') !== compact) {
		if (compact)
			counter.AddClass('counter-compact');
		else
			counter.RemoveClass('counter-compact');
	}
	StyleScore(counter);
	StyleCompact(counter, compact);
	StyleAvatars(counter);
	HideChrome(counter);
};

CounterApply();

var CounterGeneration = (typeof CounterGeneration === 'undefined' ? 0 : CounterGeneration) + 1;

var CounterTick = function (generation) {
	if (generation !== CounterGeneration)
		return;
	try {
		CounterApply();
	} catch (error) {
			}
	$.Schedule(0.25, function () {
		CounterTick(generation);
	});
};

$.Schedule(0.25, (function (generation) {
	return function () {
		CounterTick(generation);
	};
})(CounterGeneration));
if (typeof CounterEvents === 'undefined') {
	var CounterEvents = true;
	var CounterOnEvent = function (what) {
		try {
			CounterApply();
		} catch (error) {
					}
		$.Schedule(0.0, function () {
			try {
				CounterApply();
			} catch (error) {
							}
		});
	};
	for (var eventName of ['OnRoundStart', 'OnRoundFreezeTimeEnd', 'Player_Death']) {
		$.RegisterForUnhandledEvent(eventName, (function (name) {
			return function () {
				CounterOnEvent(name);
			};
		})(eventName));
	}
}
