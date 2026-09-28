var RisCfg = {
	width: 750,
	canvasW: 750,
	canvasH: 75,
	marginX: 50,
	rowY: 292,
	reveal: 5,
	line: 4,
	bg: '#333333d0',
	stripBg: 'rgba(40,40,40,0.9)',
	graphBg: 'rgba(40,40,40,0.8)',
	guide: '1px solid rgba(200,200,200,0.1)',
	ct: '#B5D4EE',
	t: '#EAD18A',
	dot: 32,
	fade: 0.2,
};

var RisState = {
	root: null, plot: null, beams: null, segs: null, damage: null,
	plaque: null, plaqueText: null, plaqueLogo: null, headLogo: null, guides: null,
	living: null, map: {},
	xRange: 1, slice: 1, prev: 50, perspective: 2, localTeam: 0, local: '',
	winner: '', gen: 0, listening: false,
};

var RisValues = function (data) {
	if (!data)
		return [];
	if (data.length === Number(data.length))
		return data;
	var out = [];
	for (var key in data)
		if (data.hasOwnProperty(key))
			out.push(data[key]);
	return out;
};

var RisLoc = function (token, fallback) {
	var text = null;
	try {
		text = $.Localize(token, RisState.root || contextPanel);
	} catch (error) {
		text = null;
	}
	return (text && text.length > 1 && text.charAt(0) !== '#') ? text : fallback;
};

var RisSfx = function (name) {
	try {
		if (typeof UiToolkitAPI !== 'undefined' && UiToolkitAPI.PlaySoundEvent)
			UiToolkitAPI.PlaySoundEvent(name);
	} catch (error) {
	}
};

var RisSetting = function (name) {
	try {
		return GameInterfaceAPI.GetSettingString(name);
	} catch (error) {
		return '';
	}
};

var RisTeamClan = function (isCT) {
	try {
		return GameStateAPI.GetTeamClanName(isCT ? 'CT' : 'TERRORIST') || (isCT ? 'CT' : 'T');
	} catch (error) {
		return isCT ? 'CT' : 'T';
	}
};

var RisXuid = function () {
	try {
		var team = GameStateAPI.GetAssociatedTeamNumber(RisState.local);
		if (GameStateAPI.IsDemoOrHltv() || (team !== 2 && team !== 3))
			return GameStateAPI.GetHudPlayerXuid();
		return GameStateAPI.GetLocalPlayerXuid();
	} catch (error) {
		try {
			return GameStateAPI.GetLocalPlayerXuid();
		} catch (inner) {
			return RisState.local;
		}
	}
};

var RisTeamOf = function (xuid) {
	try {
		var team = GameStateAPI.GetAssociatedTeamNumber(xuid);
		if (team === 2 || team === 3)
			return team;
	} catch (error) {
	}
	return 2;
};

var RisPalette = ['199,187,139', '168,122,224', '116,172,87', '103,167,244', '234,124,68'];

var RisVictimColor = function (index) {
	try {
		if (typeof TeamColor !== 'undefined' && TeamColor.GetTeamColorCss)
			return TeamColor.GetTeamColorCss(index);
	} catch (error) {
	}
	return 'rgb(' + (RisPalette[Number(index) % 5] || '160,160,160') + ')';
};

var RisOdds = function (terroristOdds) {
	return RisState.perspective === 2 ? terroristOdds : 100 - terroristOdds;
};

var RisPlot = function (point) {
	return [
		RisCfg.canvasW / RisState.xRange * point[0],
		RisCfg.canvasH - (RisCfg.canvasH / 100 * point[1]),
	];
};

var RisPanel = function (parent, id) {
	var panel = $.CreatePanel('Panel', parent, id);
	panel.hittest = false;
	return panel;
};

var RisDress = function (panel, prop, value) {
	try {
		panel.style[prop] = value;
	} catch (error) {
			}
};

var RisBuild = function () {
	var host = contextPanel.FindChildTraverse('HudWinPanel') || contextPanel;
	var root = RisPanel(host, 'RisRoot');
	RisDress(root, 'width', RisCfg.width + 'px');
	RisDress(root, 'y', RisCfg.rowY + 'px');
	RisDress(root, 'horizontalAlign', 'center');
	RisDress(root, 'flowChildren', 'down');
	RisDress(root, 'visibility', 'collapse');
	RisState.root = root;

	var plaque = RisPanel(root, 'RisWinnerPlaque');
	RisDress(plaque, 'width', RisCfg.width + 'px');
	RisDress(plaque, 'height', '40px');
	RisDress(plaque, 'opacity', '0.0');
	RisDress(plaque, 'transitionProperty', 'opacity');
	RisDress(plaque, 'transitionDuration', RisCfg.fade + 's');
	RisDress(plaque, 'backgroundColor', 'gradient( linear, 0% 0%, 100% 0%,'
		+ ' from( #00000000 ), color-stop( 0.2, #333333f0 ),'
		+ ' color-stop( 0.8, #333333f0 ), to( #00000000 ) )');
	var plaqueLogo = RisPanel(plaque, 'RisWinnerLogo');
	RisDress(plaqueLogo, 'width', '100px');
	RisDress(plaqueLogo, 'height', '100px');
	RisDress(plaqueLogo, 'horizontalAlign', 'center');
	RisDress(plaqueLogo, 'y', '14px');
	RisDress(plaqueLogo, 'opacity', '0.1');
	var plaqueText = $.CreatePanel('Label', plaque, 'RisWinnerText');
	plaqueText.hittest = false;
	RisDress(plaqueText, 'width', '100%');
	RisDress(plaqueText, 'height', '40px');
	RisDress(plaqueText, 'horizontalAlign', 'center');
	RisDress(plaqueText, 'verticalAlign', 'center');
	RisDress(plaqueText, 'textAlign', 'center');
	RisDress(plaqueText, 'fontFamily', 'Stratum2');
	RisDress(plaqueText, 'fontWeight', 'bold');
	RisDress(plaqueText, 'fontSize', '22px');
	RisDress(plaqueText, 'letterSpacing', '1px');
	RisDress(plaqueText, 'textTransform', 'uppercase');
	RisDress(plaqueText, 'color', '#ffffff');
	RisState.plaque = plaque;
	RisState.plaqueText = plaqueText;
	RisState.plaqueLogo = plaqueLogo;

	var main = RisPanel(root, 'RisMain');
	RisDress(main, 'width', RisCfg.width + 'px');
	RisDress(main, 'marginTop', '5px');
	RisDress(main, 'backgroundColor', RisCfg.bg);

	var head = RisPanel(main, 'RisHeader');
	RisDress(head, 'width', '100%');
	RisDress(head, 'height', '40px');
	RisDress(head, 'backgroundColor', RisCfg.stripBg);
	RisDress(head, 'flowChildren', 'right');
	RisDress(head, 'paddingLeft', '8px');
	var headLogo = RisPanel(head, 'RisHeadLogo');
	RisDress(headLogo, 'width', '20px');
	RisDress(headLogo, 'height', '20px');
	RisDress(headLogo, 'verticalAlign', 'center');
	RisState.headLogo = headLogo;
	var headTitle = $.CreatePanel('Label', head, 'RisHeadTitle');
	headTitle.hittest = false;
	RisDress(headTitle, 'height', '40px');
	RisDress(headTitle, 'verticalAlign', 'center');
	RisDress(headTitle, 'marginLeft', '5px');
	RisDress(headTitle, 'fontFamily', 'Stratum2');
	RisDress(headTitle, 'fontSize', '16px');
	RisDress(headTitle, 'letterSpacing', '1px');
	RisDress(headTitle, 'color', '#ffffff');
	RisState.headTitle = headTitle;

	var center = RisPanel(main, 'RisCenter');
	RisDress(center, 'width', '100%');
	RisDress(center, 'height', RisCfg.canvasH + 'px');
	RisDress(center, 'zIndex', '1');
	var guidesBg = RisPanel(center, 'RisGraphBg');
	RisDress(guidesBg, 'width', '100%');
	RisDress(guidesBg, 'height', '100%');
	RisDress(guidesBg, 'backgroundColor', RisCfg.graphBg);
	var margin = RisPanel(guidesBg, 'RisMargin');
	RisDress(margin, 'width', RisCfg.marginX + 'px');
	RisDress(margin, 'height', '100%');
	RisDress(margin, 'backgroundColor', 'gradient( linear, 100% 0%, 0% 0%,'
		+ ' from( #00000030 ), color-stop( 0.2, #00000000 ), to( #00000000 ) )');
	var guides = RisPanel(guidesBg, 'RisGuides');
	RisDress(guides, 'x', RisCfg.marginX + 'px');
	RisDress(guides, 'width', '700px');
	RisDress(guides, 'height', '100%');
	RisDress(guides, 'flowChildren', 'down');
	for (var half = 0; half < 2; ++half) {
		var interval = RisPanel(guides, 'RisInterval' + half);
		RisDress(interval, 'width', '100%');
		RisDress(interval, 'height', '50%');
		RisDress(interval, 'borderTop', RisCfg.guide);
		RisDress(interval, 'borderBottom', RisCfg.guide);
	}
	var living = RisPanel(guidesBg, 'RisLivingBg');
	RisDress(living, 'height', '100%');
	RisDress(living, 'horizontalAlign', 'right');
	RisDress(living, 'backgroundColor', 'gradient( linear, 0% 0%, 100% 0%,'
		+ ' from( #00000030 ), color-stop( 0.05, #00000000 ), to( #00000000 ) )');
	RisState.guides = guides;
	RisState.living = living;

	var graph = RisPanel(center, 'RisGraph');
	RisDress(graph, 'x', RisCfg.marginX + 'px');
	RisDress(graph, 'width', RisCfg.canvasW + 'px');
	RisDress(graph, 'height', RisCfg.canvasH + 'px');
	RisDress(graph, 'overflow', 'noclip');
	var beams = RisPanel(graph, 'RisBeams');
	RisDress(beams, 'width', RisCfg.canvasW + 'px');
	RisDress(beams, 'height', '100%');
	RisDress(beams, 'zIndex', '-1');
	var segs = RisPanel(graph, 'RisSegments');
	RisDress(segs, 'width', RisCfg.canvasW + 'px');
	RisDress(segs, 'height', '100%');
	var plot = RisPanel(graph, 'RisPlot');
	RisDress(plot, 'width', RisCfg.canvasW + 'px');
	RisDress(plot, 'height', '100%');
	RisState.beams = beams;
	RisState.segs = segs;
	RisState.plot = plot;

	var bottom = RisPanel(main, 'RisBottom');
	RisDress(bottom, 'width', '100%');
	RisDress(bottom, 'height', '67px');
	RisDress(bottom, 'backgroundColor', RisCfg.stripBg);
	var damage = RisPanel(bottom, 'RisDamageRow');
	RisDress(damage, 'width', RisCfg.canvasW + 'px');
	RisDress(damage, 'height', '35px');
	RisDress(damage, 'horizontalAlign', 'center');
	RisDress(damage, 'verticalAlign', 'bottom');
	RisDress(damage, 'transform', 'translateX( ' + RisCfg.marginX + 'px )');
	RisDress(damage, 'overflow', 'noclip');
	RisState.damage = damage;
};

var RisWipe = function (panel) {
	if (!panel)
		return;
	try {
		panel.RemoveAndDeleteChildren();
	} catch (error) {
	}
};

var RisBeam = function (key, teamNumber, plotPoint) {
	var color = teamNumber === 3 ? RisCfg.ct : RisCfg.t;
	var beam = RisPanel(RisState.beams, 'RisBeam-' + key);
	RisDress(beam, 'width', '28px');
	RisDress(beam, 'x', (plotPoint[0] - 14) + 'px');
	RisDress(beam, 'y', plotPoint[1] + 'px');
	RisDress(beam, 'height', (RisCfg.canvasH - plotPoint[1] + 69) + 'px');
	RisDress(beam, 'backgroundColor', 'gradient( linear, 0% 100%, 0% 0%,'
		+ ' from( ' + color + '00 ), color-stop( 0.6, ' + color + '10 ),'
		+ ' to( ' + color + '40 ) )');
};

var RisSegment = function (from, to, color) {
	var dx = to[0] - from[0];
	var dy = to[1] - from[1];
	var len = Math.sqrt(dx * dx + dy * dy);
	if (len < 0.5)
		return;
	var deg = Math.atan2(dy, dx) * 180 / Math.PI;
	var seg = RisPanel(RisState.segs, 'RisSeg' + RisState.segs.GetChildCount());
	RisDress(seg, 'x', from[0] + 'px');
	RisDress(seg, 'y', (from[1] - RisCfg.line / 2) + 'px');
	RisDress(seg, 'width', len + 'px');
	RisDress(seg, 'height', RisCfg.line + 'px');
	RisDress(seg, 'transformOrigin', '0% 50%');
	RisDress(seg, 'transform', 'rotateZ( ' + deg + 'deg )');
	RisDress(seg, 'backgroundColor', color);
	RisDress(seg, 'visibility', 'collapse');
	RisDress(seg, 'opacity', '0.0');
	seg.RisReveal = function () {
		RisDress(seg, 'visibility', 'visible');
		RisDress(seg, 'opacity', '1.0');
	};
};

var RisRevealBox = function (panel) {
	RisDress(panel, 'transitionProperty', 'opacity');
	RisDress(panel, 'transitionDuration', RisCfg.fade + 's');
	RisDress(panel, 'transitionTimingFunction', 'ease-out');
	RisDress(panel, 'opacity', '0.0');
	panel.RisReveal = function () {
		RisDress(panel, 'opacity', '1.0');
	};
};

var RisDotLabel = function (outer, text, color) {
	var label = $.CreatePanel('Label', outer, 'RisChance');
	label.hittest = false;
	RisDress(label, 'width', '100%');
	RisDress(label, 'y', '6px');
	RisDress(label, 'horizontalAlign', 'center');
	RisDress(label, 'textAlign', 'center');
	RisDress(label, 'fontFamily', 'Stratum2 bold');
	RisDress(label, 'fontSize', '12px');
	RisDress(label, 'textTransform', 'uppercase');
	RisDress(label, 'textShadow', '1px 1px black');
	label.text = text;
	RisDress(label, 'color', color || '#8a8a8a');
	return label;
};

var RisChanceColor = function (delta) {
	var frac = Math.min(1, Math.max(0, (delta + 20) / 40));
	return 'rgb(' + Math.round((1 - frac) * 255) + ',' + Math.round(frac * 255) + ',0)';
};

var RisObjectiveSrc = function (type) {
	var at = Number(type);
	return [dictObjectiveImage[at] || dictObjectiveImage[3], at >= 2];
};

var RisDot = function (event, plotPoint, chance) {
	var victim = event.victim_data;
	var objective = event.objective_data;
	var outer = RisPanel(RisState.plot,
		'RisEvent-' + (victim ? 'x' + victim.xuid : 'obj' + objective.type));
	RisDress(outer, 'width', '50px');
	RisDress(outer, 'height', '100px');
	RisDress(outer, 'x', (plotPoint[0] - 25) + 'px');
	RisDress(outer, 'y', (plotPoint[1] - 50) + 'px');
	RisDress(outer, 'overflow', 'noclip');

	var box = RisPanel(outer, 'RisBox');
	RisDress(box, 'width', RisCfg.dot + 'px');
	RisDress(box, 'height', RisCfg.dot + 'px');
	RisDress(box, 'horizontalAlign', 'center');
	RisDress(box, 'verticalAlign', 'center');
	RisDress(box, 'border', '1px solid black');
	RisDress(box, 'borderRadius', '5px');
	RisDress(box, 'backgroundColor', '#777777');
	RisRevealBox(box);

	var reveals = [box];
	var bCT = false;
	if (victim) {
		bCT = victim.team_number === 3;
		if (!victim.is_bot) {
			var avatar = $.CreatePanel('CSGOAvatarImage', box, 'RisAvatar');
			avatar.hittest = false;
			RisDress(avatar, 'width', RisCfg.dot + 'px');
			RisDress(avatar, 'height', RisCfg.dot + 'px');
			RisDress(avatar, 'borderRadius', '3px');
			RisDress(avatar, 'overflow', 'noclip');
			RisDress(avatar, 'horizontalAlign', 'center');
			RisDress(avatar, 'verticalAlign', 'center');
			try {
				avatar.PopulateFromPlayerSlot(GameStateAPI.GetPlayerSlot(String(victim.xuid)));
			} catch (error) {
							}
			var strip = RisPanel(box, 'RisTeamStrip');
			RisDress(strip, 'width', '50%');
			RisDress(strip, 'height', '6px');
			RisDress(strip, 'horizontalAlign', 'center');
			RisDress(strip, 'verticalAlign', 'bottom');
			RisDress(strip, 'backgroundColor', RisVictimColor(victim.color));
		} else {
			RisDress(box, 'backgroundColor', bCT ? '#5d79a8' : '#a8935d');
		}
		RisBeam('x' + victim.xuid, victim.team_number, plotPoint);
	} else {
		var src = RisObjectiveSrc(objective.type);
		bCT = src[1];
		var icon = $.CreatePanel('Image', box, 'RisObjectiveIcon');
		icon.hittest = false;
		RisDress(icon, 'width', '26px');
		RisDress(icon, 'height', '26px');
		RisDress(icon, 'horizontalAlign', 'center');
		RisDress(icon, 'verticalAlign', 'center');
		try {
			icon.SetImage(src[0]);
			IconUtil.FallbackPng(icon, src[0].slice(0, -4));
		} catch (error) {
					}
	}

	if (!victim || victim.is_dead) {
		var delta = chance - RisState.prev;
		var symbol = delta < 0 ? '▼' : delta > 0 ? '▲' : '';
		var text = chance === 100 ? RisLoc('#ris_win', 'WIN')
			: chance === 0 ? RisLoc('#ris_loss', 'LOSS')
			: symbol + chance + '%';
		var color = chance === 100 ? '#00ff00'
			: chance === 0 ? '#ff0000'
			: RisChanceColor(delta);
		RisDotLabel(outer, text, color);
	}

	if (victim && victim.is_dead) {
		var skull = $.CreatePanel('Image', outer, 'RisDeath');
		skull.hittest = false;
		RisDress(skull, 'width', '12px');
		RisDress(skull, 'height', '12px');
		RisDress(skull, 'x', '27px');
		RisDress(skull, 'y', '52px');
		RisDress(skull, 'imgShadow', '1px 1px 1px 3px black');
		PaintArt(skull, 'aliveskull', {size: '100% 100%'});
		RisRevealBox(skull);
		reveals.push(skull);
	}

	outer.RisRevealAll = function () {
		for (var at = 0; at < reveals.length; ++at)
			if (reveals[at] && reveals[at].IsValid() && reveals[at].RisReveal)
				reveals[at].RisReveal();
	};

	RisState.prev = chance;
	return outer;
};

var RisDamageRow = function (key, plotPoint) {
	var outer = RisPanel(RisState.damage, 'RisDamage-' + key);
	RisDress(outer, 'width', '60px');
	RisDress(outer, 'height', '35px');
	RisDress(outer, 'x', (plotPoint[0] - 30) + 'px');
	RisDress(outer, 'verticalAlign', 'bottom');
	RisRevealBox(outer);

	var make = function (id, bottom, tint) {
		var half = RisPanel(outer, id);
		RisDress(half, 'width', '100%');
		RisDress(half, 'height', '16px');
		RisDress(half, 'horizontalAlign', 'center');
		RisDress(half, 'verticalAlign', bottom ? 'bottom' : 'top');
		RisDress(half, 'backgroundColor', tint);
		var text = $.CreatePanel('Label', half, id + 'Text');
		text.hittest = false;
		RisDress(text, 'width', '100%');
		RisDress(text, 'height', '100%');
		RisDress(text, 'horizontalAlign', 'center');
		RisDress(text, 'verticalAlign', 'center');
		RisDress(text, 'textAlign', 'center');
		RisDress(text, 'fontFamily', 'Stratum2 Bold Monodigit');
		RisDress(text, 'fontSize', '12px');
		RisDress(text, 'color', bottom ? '#d87b7b' : '#7bd87b');
		RisDress(text, 'textShadow', '1px 1px black');
		text.text = '';
		return text;
	};

	var row = {
		box: outer,
		given: make('RisGiven', false, 'rgba(0,255,0,0.05)'),
		taken: make('RisTaken', true, 'rgba(255,0,0,0.05)'),
		hp: 0, hits: 0, back: 0, backHits: 0,
	};
	row.write = function () {
		row.given.text = row.hp > 0 ? ('▲' + row.hp + (row.hits > 1 ? ' ·' + row.hits : '')) : '';
		row.taken.text = row.back > 0 ? ('▼' + row.back + (row.backHits > 1 ? ' ·' + row.backHits : '')) : '';
	};
	return row;
};

var RisFindDamage = function (event, xuid) {
	var records = RisValues(event.all_damage_data);
	for (var at = 0; at < records.length; ++at)
		if (String(records[at].other_xuid) === String(xuid))
			return records[at];
	return null;
};

var RisAddDamage = function (event, plotPoint) {
	if (event.objective_data || !event.victim_data)
		return;
	var key = 'x' + event.victim_data.xuid;
	var row = RisState.map[key];
	if (!row) {
		row = RisDamageRow(key, plotPoint);
		RisState.map[key] = row;
	}
	var record = RisFindDamage(event, RisState.local);
	if (record) {
		row.hp = Math.min(100, row.hp + (Number(record.health_removed) || 0));
		row.hits += Number(record.num_hits) || 0;
		row.back = Math.min(100, row.back + (Number(record.return_health_removed) || 0));
		row.backHits += Number(record.return_num_hits) || 0;
		row.write();
	}
};

var RisUpdateDamage = function (xuid, given, taken) {
	var row = RisState.map['x' + xuid];
	if (!row)
		return;
	if (given) {
		row.hp = Math.min(100, row.hp + given);
		row.hits += 1;
	}
	if (taken) {
		row.back = Math.min(100, row.back + taken);
		row.backHits += 1;
	}
	row.write();
	RisDress(row.box, 'opacity', '1.0');
};

var RisSchedule = function (delay, fn) {
	var gen = RisState.gen;
	$.Schedule(delay, function () {
		if (gen === RisState.gen)
			fn();
	});
};

var RisShowWinner = function () {
	if (!RisState.winner)
		return;
	var isCT = RisState.winner === 3;
	RisState.root.SetDialogVariable('ris_team', RisTeamClan(isCT));
	RisState.plaqueText.text = RisLoc('#ris_wins', RisTeamClan(isCT) + ' WINS THE ROUND');
	PaintArt(RisState.plaqueLogo, isCT ? 'teamct' : 'teamt', {size: 'contain'});
	RisDress(RisState.plaque, 'opacity', '1.0');
	RisSfx(RisState.localTeam === RisState.winner
		? 'UIPanorama.round_report_round_won' : 'UIPanorama.round_report_round_lost');
};

var RisShow = function (msg) {
	if (!msg)
		return;
	if (!RisState.root || !RisState.root.IsValid())
		RisBuild();
	if (!RisState.root)
		return;
	RisState.gen += 1;

	RisState.local = RisXuid();
	RisState.localTeam = RisTeamOf(RisState.local);
	RisState.perspective = (RisState.localTeam === 2 || RisState.localTeam === 3)
		? RisState.localTeam : 2;
	RisState.listening = true;
	RisState.map = {};
	RisState.prev = 50;
	RisWipe(RisState.plot);
	RisWipe(RisState.beams);
	RisWipe(RisState.segs);
	RisWipe(RisState.damage);

	var isCT = RisState.perspective === 3;
	var drawColor = isCT ? RisCfg.ct + 'aa' : RisCfg.t + 'aa';
	PaintArt(RisState.headLogo, isCT ? 'teamct' : 'teamt', {size: 'contain'});
	RisState.root.SetDialogVariable('team', RisTeamClan(isCT));
	RisState.headTitle.text = RisLoc('#ris_team-title', 'ROUND REPORT');
	RisDress(RisState.plaque, 'opacity', '0.0');
	RisDress(RisState.root, 'visibility', 'visible');

	var startRaw = Number(msg.init_conditions && msg.init_conditions.terrorist_odds);
	var start = isNaN(startRaw) ? 50 : startRaw;

	var timeline = [];
	var enemies = [];
	var records = RisValues(msg.all_rer_event_data);
	for (var at = 0; at < records.length; ++at) {
		var victim = records[at].victim_data;
		if (!victim || victim.is_dead) {
			timeline.push(records[at]);
			continue;
		}
		var isEnemy = victim.team_number !== RisState.localTeam
			&& (RisState.localTeam === 2 || RisState.localTeam === 3);
		if (isEnemy)
			enemies.push(records[at]);

	}

	RisState.winner = timeline.length
		? (Number(timeline[timeline.length - 1].terrorist_odds) === 100 ? 2
			: Number(timeline[timeline.length - 1].terrorist_odds) === 0 ? 3 : '')
		: '';

	RisState.xRange = timeline.length + enemies.length + 1.5;
	RisState.slice = RisCfg.reveal / RisState.xRange;

	var plots = [RisPlot([0, RisOdds(start)])];
	RisSchedule(0, function () {
		RisStartingDot(plots[0], RisOdds(start));
	});

	for (var step = 0; step < timeline.length; ++step) {
		var chance = RisOdds(Number(timeline[step].terrorist_odds));
		plots.push(RisPlot([step + 1, chance]));
		RisSchedule(step * RisState.slice, function (event, plotPoint, chance) {
			var delta = chance - RisState.prev;
			RisAddDamage(event, plotPoint);
			RisDot(event, plotPoint, chance);
			RisSfx(delta > 0 ? 'UIPanorama.round_report_odds_up'
				: delta < 0 ? 'UIPanorama.round_report_odds_dn'
				: 'UIPanorama.round_report_odds_none');
		}.bind(this, timeline[step], plots[step + 1], chance));
	}

	var tailX = timeline.length;
	for (var extra = 0; extra < enemies.length; ++extra) {
		plots.push(RisPlot([tailX + extra + 1, 50]));
		RisSchedule((tailX + extra) * RisState.slice, function (event, plotPoint) {
			RisAddDamage(event, plotPoint);
			RisDot(event, plotPoint, RisOdds(Number(event.terrorist_odds) || 50));
		}.bind(this, enemies[extra], plots[plots.length - 1]));
	}

	for (var seg = 0; seg + 1 < plots.length; ++seg)
		RisSegment(plots[seg], plots[seg + 1], drawColor);
	for (var order = 0; order < RisState.segs.GetChildCount(); ++order) {
		var child = RisState.segs.GetChild(order);
		RisSchedule(order * RisState.slice, function (panel) {
			if (panel && panel.IsValid() && panel.RisReveal)
				panel.RisReveal();
		}.bind(this, child));
	}

	var graphWidth = timeline.length / RisState.xRange * 100;
	RisDress(RisState.guides, 'width', graphWidth + '%');
	RisDress(RisState.living, 'width', (100 - graphWidth) + '%');

	RisSchedule(RisCfg.reveal, function () {
		RisShowWinner();
	});

	var freezetime = Number(RisSetting('mp_freezetime')) || 5;
	var restart = Number(RisSetting('mp_round_restart_delay')) || 5;
	RisSchedule(restart + freezetime - 1, function () {
		RisState.listening = false;
	});
};

var RisStartingDot = function (plotPoint, chance) {
	var outer = RisPanel(RisState.plot, 'RisStart');
	RisDress(outer, 'width', '50px');
	RisDress(outer, 'height', '100px');
	RisDress(outer, 'x', (plotPoint[0] - 25) + 'px');
	RisDress(outer, 'y', (plotPoint[1] - 50) + 'px');
	RisDress(outer, 'overflow', 'noclip');
	var dot = RisPanel(outer, 'RisStartDot');
	RisDress(dot, 'width', '24px');
	RisDress(dot, 'height', '24px');
	RisDress(dot, 'horizontalAlign', 'center');
	RisDress(dot, 'verticalAlign', 'center');
	RisDress(dot, 'borderRadius', '30px');
	RisDress(dot, 'backgroundColor', 'gray');
	var mark = $.CreatePanel('Label', dot, 'RisStartMark');
	mark.hittest = false;
	RisDress(mark, 'width', '100%');
	RisDress(mark, 'height', '100%');
	RisDress(mark, 'horizontalAlign', 'center');
	RisDress(mark, 'verticalAlign', 'center');
	RisDress(mark, 'textAlign', 'center');
	RisDress(mark, 'fontFamily', 'Stratum2');
	RisDress(mark, 'fontSize', '14px');
	RisDress(mark, 'color', 'white');
	RisDress(mark, 'textShadow', '0px 0px 2px black');
	mark.text = '$';
	RisDotLabel(outer, chance + '%', '#cccccc');
};

var RisHide = function () {
	RisState.gen += 1;
	RisState.listening = false;
	if (RisState.root && RisState.root.IsValid())
		RisDress(RisState.root, 'visibility', 'collapse');
};

if (typeof RisEvents === 'undefined') {
	var RisEvents = true;

	$.RegisterForUnhandledEvent('HudWinPanel_ShowRoundEndReport', function (msg) {
		try {
			RisShow(msg);
		} catch (error) {
					}
	});

	$.RegisterForUnhandledEvent('HudWinPanel_HideRoundEndReport', function () {
		try {
			RisHide();
		} catch (error) {
					}
	});

	$.RegisterForUnhandledEvent('Player_Hurt', function (attacker, victim, damage) {
		if (!RisState.listening)
			return;
		try {
			if (String(attacker) === String(RisState.local))
				RisUpdateDamage(victim, Number(damage) || 0, 0);
			else if (String(victim) === String(RisState.local))
				RisUpdateDamage(attacker, 0, Number(damage) || 0);
		} catch (error) {
					}
	});

	$.RegisterForUnhandledEvent('Player_Death', function (xuid) {
		if (!RisState.listening)
			return;
		try {
			var outer = contextPanel.FindChildTraverse('RisEvent-x' + xuid);
			var death = outer && outer.FindChildTraverse('RisDeath');
			if (death)
				RisDress(death, 'opacity', '1.0');
		} catch (error) {
		}
	});
}
