jQuery(function($){
	Tileset.Font.loadFromURL(wgScriptPath + '/extensions/QualityRatings/DFWikiFunctions/extensions/DFDiagram/resources/8x12.png').on('ready', function(evt, font){
		$('.dfdiagram').each(function(i, e){
			var frameList = $();
			$(e).find('.dfdiagram-frame').each(function(i, e) {
				if (i == 0) {
					$(e).data('first-frame', true);
				}
				else {
					$(e).hide().data('first-frame', false);
				}
				$(e).find('table').hide();
				var rows = $(e).find('tr').length,
					cols = $(e).find('tr:nth(0) td').length,
					canvas = $('<canvas>').attr({
						width: cols * font.char_width,
						height: rows * font.char_height
					});
				$(e).append(canvas).find('table').hide();
				// Assign to property of original ($) canvas and new variable
				canvas = canvas.canvas = Tileset.Canvas(canvas, font);
				var rgb_arr = function(rgb_string) {
					return rgb_string.split('(')[1].split(')')[0].replace(/\s/g, '').split(',')
				};
				$(e).find('tr').each(function(row, tr){
					$(tr).find('td').each(function(col, td){
						var fg = $(td).find('span').css('color'),
							bg = $(td).find('span').css('background-color');
						canvas.draw_char($(td).text(), row, col, rgb_arr(fg), rgb_arr(bg));
					});
				});
				e.canvas = canvas;
				frameList = frameList.add(e);
			});
			$(e).data({frameList: frameList});
			interactiveSetup($(e));
		});
	});
	function interactiveSetup(diagram) {
		var frameList = diagram.data('frameList');
		var activeFrame = 0;
		function displayFrame(id) {
			frameList.hide();
			$(frameList[id]).show();
			activeFrame = id;
			// Make focus_mask the right size so it can be focused
			frameList[activeFrame].canvas.update_size();
			frameList[activeFrame].canvas.focus_mask.show().focus();
		}
		if (frameList.length <= 1) return;
		frameList.find('canvas').css('box-shadow', '0px 0px 2px 2px #7f7').attr('title', 'Interactive diagram');
		/*
		 * Levels
		 */
		var levels = [], originalLevel, currentLevel;
		var changeLevel = function(_, event) {
			if (event.which == 60 || event.which == 62) {
				var newLevel = currentLevel - (event.which - 61);
				if (newLevel in levels) {
					currentLevel = newLevel;
					displayFrame(levels[newLevel]);
				}
			}
		}
		frameList.each(function(i, e) {
			if ($(e).data('type') == 'level') {
				levels[Number($(e).data('level'))] = i;
				if (i == 0) {
					currentLevel = originalLevel = Number($(e).data('level'));
				}
			}
			e.canvas.events.bind('keypress', changeLevel);
		});
	}
	return {
		interactiveSetup: interactiveSetup,
	};
});
