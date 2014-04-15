Math.randInt = function(a, b, count) {
	if (!count) count = 1;
	count = Math.max(1, count);
	if (count == 1) return Math.floor(Math.random() * (Math.abs(a - b) + 1)) + Math.min(a, b);
	else {
		var list = [];
		for (var i = 0; i < count; i++) {
			list[i] = Math.randInt(a, b);
		}
		return list;
	}
};

window.Tileset = (function($){
	"use strict";
	var Tileset = {};

	Tileset.Character = function(bg, data) {
		var self = {
			bg: [].slice.apply(bg),
			img_data: data,
			raw_data: [].slice.apply(data.data)
		};

		self.pixels = [];
		self.map = [];
		for (var r = 0; r < data.height; r++) {
			self.pixels[r] = [];
			self.map[r] = [];
			for (var c = 0; c < data.width; c++) {
				var offset = (data.width*r + c) * 4
				self.pixels[r][c] = self.raw_data.slice(offset, offset + 4);
				if (self.pixels[r][c].toString() == self.bg.toString()) {
					// This is the background color, so transparency = 0
					self.map[r][c] = 0;
				}
				else {
					self.map[r][c] = 1;
				}
			}
		}
		
		self.blank_canvas = $('<canvas>').width(data.width).height(data.height).hide().appendTo('body');
		self.image_data_cache = {};

		self.image_data = function(fg, bg){
			/*
			 * Returns an ImageData object with this character drawn on it,
			 * with foreground 'fg' and background 'bg'.
			 * fg/bg: [r, g, b (, a)]
			 */
			var key = fg.toString() + ',' + bg.toString();
			if (key in self.image_data_cache) {
				return self.image_data_cache[key];
			}
			else {
				var w = self.img_data.width, h = self.img_data.height,
					cx = self.blank_canvas[0].getContext('2d'),
					pixels = cx.createImageData(w, h);
				for (var r = 0; r < self.img_data.height; r++) {
					for (var c = 0; c < self.img_data.width; c++) {
						var color = self.map[r][c] ? fg : bg;
						for (var i = 0; i <= 3; i++) {
							pixels.data[(r * w + c) * 4 + i] = i in color ? color[i] : 255;
						}
					}
				}

				cx.putImageData(pixels, 0, 0);

				self.image_data_cache[key] = pixels;
				return self.image_data_cache[key];
			}
		};

		if (this instanceof Tileset.Character) $.extend(this, self);
		return self;
	};

	Tileset.Font = function(image) {
		var self = {};

		self.image = $(image).first().hide().attr({height: 'auto', width: 'auto'});
		self.image_width = self.image.width();
		self.image_height = self.image.height();
		self.image_canvas = $('<canvas>').hide().appendTo('body').attr({
			height: self.image_height,
			width: self.image_width
		});
		var ctx = self.image_context = self.image_canvas[0].getContext('2d');
		// Draw image onto image_canvas
		ctx.drawImage(self.image[0], 0, 0, self.image_width, self.image_height);

		self.characters = [];

		var background = ctx.getImageData(0, 0, 1, 1).data;
		var w = self.char_width = self.image_width / 16,
			h = self.char_height = self.image_height / 16;
		for (var row = 0; row < 16; row++) {
			for (var col = 0; col < 16; col++) {
				var data = ctx.getImageData(w * col, h * row, w, h);
				self.characters[row * 16 + col] = Tileset.Character(background, data);
			}
		}

		if (this instanceof Tileset.Font) $.extend(this, self);
		return self;
	};
	Tileset.Font.loadFromURL = function(url) {
		var event = $({});
		$('<img>').attr({src: url}).hide().appendTo('body').attr({
			height: 'auto',
			width: 'auto'
		}).load(function(d){
			var font = Tileset.Font($('img').filter(function(){return $(this).attr('src') == url}));
			event.trigger('ready', font);
		}).error(function(d){
			event.trigger('error', d)
		});
		return event;
	};

	Tileset.Canvas = function(canvas, font, opts) {
		var self = {
			canvas: $(canvas)[0],
			$canvas: $(canvas),
			font: font,
		};
		canvas = self.canvas;
		var cx = self.cx = self.canvas.getContext('2d');
		self.opts = opts = $.extend({
			focus_enabled: true
		}, opts);
		self.wrapper = $('<div class="canvas-wrapper">').css({position:'relative'});
		self.$canvas.wrap(self.wrapper);

		self.draw_at = function(ch_id, fg, bg, r, c) {
			var d = font.characters[ch_id];
			// Make sure the character exists
			if (d) d = d.image_data(fg, bg);
			else return false;
			self.cx.putImageData(d, c * self.font.char_width, r * self.font.char_height);
			return true;
		};

		self.draw_list_at = function(chars, fg, bg, r, c) {
			for (var i = 0; i < chars.length; i++) {
				self.draw_at(chars[i], fg, bg, r, c + i);
			}
		};

		self.draw_string = function(string, r, c, fg, bg) {
			fg = self.get_fg(fg); bg = self.get_bg(bg);
			string = self.parse_string(string);
			var chars = [];
			for (var i = 0; i < string.length; i++) {
				chars.push(Tileset.CP437_R[string[i]]);
			}
			self.draw_list_at(chars, fg, bg, r, c);
		};

		self.draw_char = function(ch, r, c, fg, bg) {
			self.draw_string(self.parse_string(ch)[0], r, c, fg, bg);
		};

		self.fill_char = function(ch, coords, fg, bg) {
			fg = self.get_fg(fg); bg = self.get_bg(bg);
			if (typeof ch == 'string') {
				ch = Tileset.CP437_R[self.parse_string(ch)[0]];
			}
			// Collapse coordinates and make sure we have 4 numbers
			coords = coords.toString().split(',').slice(0, 4).map(Number).map(function(x){
				return isNaN(x) ? 'NaN' : x;
			});
			if (coords.length != 4 || coords.indexOf('NaN') >= 0) {
				throw TypeError('Invalid coordinates');
			}
			for (var r = coords[0]; r <= coords[2]; r++) {
				for (var c = coords[1]; c <= coords[3]; c++) {
					self.draw_at(ch, fg, bg, r, c);
				}
			}
		};

		self.parse_string = function(s) {
			return s.replace(/#\{([\d,|/]+)\}/g, function(match, nums){
				nums = nums.split(/,|\||\//);
				var s = '';
				for (var i = 0; i < nums.length; i++) {
					s += Tileset.CP437[nums[i]];
				}
				return s;
			});
		};

		self.get_fg = function(c) {
			return $.extend([255, 255, 255], c);
		};

		self.get_bg = function(c) {
			return $.extend([0, 0, 0], c);
		};

		self.events = $({}); // event handler
		var _focused = false;
		self.focus_mask = $('<textarea>').insertAfter(self.$canvas).css({
			color: 'transparent',
			'background-color': 'transparent',
			resize: 'none',
			outline: 'none',
			border: 'none',
			position: 'absolute',
			top: 0,
			left: 0,
			padding: 0,
			margin: 0,
		});
		self.focus_mask.focus(function(){
			self.$canvas.data('box-shadow', self.$canvas.css('box-shadow'))
				.css('box-shadow', '0px 0px 5px 2px #90f0f0');
		}).blur(function(){
			self.$canvas.css('box-shadow', self.$canvas.data('box-shadow'));
		});

		var focus_event_handler = function(e) {
			self.events.trigger(e.type, e);
			setTimeout(function(){self.focus_mask.val('');},0);
		};
		// A list of events to intercept
		focus_event_handler.events = 'mouseup mousedown click dblclick' +
			'mousemove mousein mouseout mouseenter mouseleave' +
			'keyup keydown keypress scroll resize';
		self.focus_mask.on(focus_event_handler.events, focus_event_handler);

		self.update_size = function() {
			// Update size of wrapper and focus mask when canvas size changes
			self.wrapper.add(self.focus_mask).css({
				width: self.$canvas.width(),
				height: self.$canvas.height(),
			});
		};
		self.update_size();  // Initialize size

		if (this instanceof Tileset.Canvas) $.extend(this, self);
		return self;
	};

	Tileset.CP437 = {
		"0":"\u0000",
		"1":"\u263A",
		"2":"\u263B",
		"3":"\u2665",
		"4":"\u2666",
		"5":"\u2663",
		"6":"\u2660",
		"7":"\u2022",
		"8":"\u25D8",
		"9":"\u25CB",
		"10":"\u25D9",
		"11":"\u2642",
		"12":"\u2640",
		"13":"\u266A",
		"14":"\u266B",
		"15":"\u263C",
		"16":"\u25BA",
		"17":"\u25C4",
		"18":"\u2195",
		"19":"\u203C",
		"20":"\u00B6",
		"21":"\u00A7",
		"22":"\u25AC",
		"23":"\u21A8",
		"24":"\u2191",
		"25":"\u2193",
		"26":"\u2192",
		"27":"\u2190",
		"28":"\u221F",
		"29":"\u2194",
		"30":"\u25B2",
		"31":"\u25BC",
		"32":"\u0020",
		"33":"\u0021",
		"34":"\u0022",
		"35":"\u0023",
		"36":"\u0024",
		"37":"\u0025",
		"38":"\u0026",
		"39":"\u0027",
		"40":"\u0028",
		"41":"\u0029",
		"42":"\u002A",
		"43":"\u002B",
		"44":"\u002C",
		"45":"\u002D",
		"46":"\u002E",
		"47":"\u002F",
		"48":"\u0030",
		"49":"\u0031",
		"50":"\u0032",
		"51":"\u0033",
		"52":"\u0034",
		"53":"\u0035",
		"54":"\u0036",
		"55":"\u0037",
		"56":"\u0038",
		"57":"\u0039",
		"58":"\u003A",
		"59":"\u003B",
		"60":"\u003C",
		"61":"\u003D",
		"62":"\u003E",
		"63":"\u003F",
		"64":"\u0040",
		"65":"\u0041",
		"66":"\u0042",
		"67":"\u0043",
		"68":"\u0044",
		"69":"\u0045",
		"70":"\u0046",
		"71":"\u0047",
		"72":"\u0048",
		"73":"\u0049",
		"74":"\u004A",
		"75":"\u004B",
		"76":"\u004C",
		"77":"\u004D",
		"78":"\u004E",
		"79":"\u004F",
		"80":"\u0050",
		"81":"\u0051",
		"82":"\u0052",
		"83":"\u0053",
		"84":"\u0054",
		"85":"\u0055",
		"86":"\u0056",
		"87":"\u0057",
		"88":"\u0058",
		"89":"\u0059",
		"90":"\u005A",
		"91":"\u005B",
		"92":"\u005C",
		"93":"\u005D",
		"94":"\u005E",
		"95":"\u005F",
		"96":"\u0060",
		"97":"\u0061",
		"98":"\u0062",
		"99":"\u0063",
		"100":"\u0064",
		"101":"\u0065",
		"102":"\u0066",
		"103":"\u0067",
		"104":"\u0068",
		"105":"\u0069",
		"106":"\u006A",
		"107":"\u006B",
		"108":"\u006C",
		"109":"\u006D",
		"110":"\u006E",
		"111":"\u006F",
		"112":"\u0070",
		"113":"\u0071",
		"114":"\u0072",
		"115":"\u0073",
		"116":"\u0074",
		"117":"\u0075",
		"118":"\u0076",
		"119":"\u0077",
		"120":"\u0078",
		"121":"\u0079",
		"122":"\u007A",
		"123":"\u007B",
		"124":"\u007C",
		"125":"\u007D",
		"126":"\u007E",
		"127":"\u2302",
		"128":"\u00C7",
		"129":"\u00FC",
		"130":"\u00E9",
		"131":"\u00E2",
		"132":"\u00E4",
		"133":"\u00E0",
		"134":"\u00E5",
		"135":"\u00E7",
		"136":"\u00EA",
		"137":"\u00EB",
		"138":"\u00E8",
		"139":"\u00EF",
		"140":"\u00EE",
		"141":"\u00EC",
		"142":"\u00C4",
		"143":"\u00C5",
		"144":"\u00C9",
		"145":"\u00E6",
		"146":"\u00C6",
		"147":"\u00F4",
		"148":"\u00F6",
		"149":"\u00F2",
		"150":"\u00FB",
		"151":"\u00F9",
		"152":"\u00FF",
		"153":"\u00D6",
		"154":"\u00DC",
		"155":"\u00A2",
		"156":"\u00A3",
		"157":"\u00A5",
		"158":"\u20A7",
		"159":"\u0192",
		"160":"\u00E1",
		"161":"\u00ED",
		"162":"\u00F3",
		"163":"\u00FA",
		"164":"\u00F1",
		"165":"\u00D1",
		"166":"\u00AA",
		"167":"\u00BA",
		"168":"\u00BF",
		"169":"\u2310",
		"170":"\u00AC",
		"171":"\u00BD",
		"172":"\u00BC",
		"173":"\u00A1",
		"174":"\u00AB",
		"175":"\u00BB",
		"176":"\u2591",
		"177":"\u2592",
		"178":"\u2593",
		"179":"\u2502",
		"180":"\u2524",
		"181":"\u2561",
		"182":"\u2562",
		"183":"\u2556",
		"184":"\u2555",
		"185":"\u2563",
		"186":"\u2551",
		"187":"\u2557",
		"188":"\u255D",
		"189":"\u255C",
		"190":"\u255B",
		"191":"\u2510",
		"192":"\u2514",
		"193":"\u2534",
		"194":"\u252C",
		"195":"\u251C",
		"196":"\u2500",
		"197":"\u253C",
		"198":"\u255E",
		"199":"\u255F",
		"200":"\u255A",
		"201":"\u2554",
		"202":"\u2569",
		"203":"\u2566",
		"204":"\u2560",
		"205":"\u2550",
		"206":"\u256C",
		"207":"\u2567",
		"208":"\u2568",
		"209":"\u2564",
		"210":"\u2565",
		"211":"\u2559",
		"212":"\u2558",
		"213":"\u2552",
		"214":"\u2553",
		"215":"\u256B",
		"216":"\u256A",
		"217":"\u2518",
		"218":"\u250C",
		"219":"\u2588",
		"220":"\u2584",
		"221":"\u258C",
		"222":"\u2590",
		"223":"\u2580",
		"224":"\u03B1",
		"225":"\u00DF",
		"226":"\u0393",
		"227":"\u03C0",
		"228":"\u03A3",
		"229":"\u03C3",
		"230":"\u00B5",
		"231":"\u03C4",
		"232":"\u03A6",
		"233":"\u0398",
		"234":"\u03A9",
		"235":"\u03B4",
		"236":"\u221E",
		"237":"\u03C6",
		"238":"\u03B5",
		"239":"\u2229",
		"240":"\u2261",
		"241":"\u00B1",
		"242":"\u2265",
		"243":"\u2264",
		"244":"\u2320",
		"245":"\u2321",
		"246":"\u00F7",
		"247":"\u2248",
		"248":"\u00B0",
		"249":"\u2219",
		"250":"\u00B7",
		"251":"\u221A",
		"252":"\u207F",
		"253":"\u00B2",
		"254":"\u25A0",
		"255":"\u00A0",
	};
	// Reverse-lookup
	Tileset.CP437_R = {};
	for (var i in Tileset.CP437) {
		if (!(i in Tileset.CP437_R)) {
			Tileset.CP437_R[Tileset.CP437[i]] = i;
		}
	}

	return Tileset;
})(jQuery);
