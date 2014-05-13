var Demo = {};

Demo.init = function(){
	$('<div id="demo-log">').css({
		border: '1px solid #eee',
		padding: 8,
		'border-radius': 2,
		'margin-top': '5em',
		'font-family': 'Courier, monospace',
		height: '15em',
		'overflow-y': 'scroll',
		'white-space': 'pre'
	}).appendTo('body').html('<div></div>');
	Demo.log('{green|Demo initialized}.');
}

Demo.logf = function(){
	var txt = [].slice.apply(arguments).join(' ');
	txt = txt.replace(/\{([^|]+)\|([^|}]+)\}/g, function(a, c, t){
		return '<span style="color:'+c+'">'+t+'</span>';
	}).replace(/\{([^|]+)\|([^|]+)\|([^|}]+)\}/g, function(a, c, b, t){
		return '<span style="color:'+c+'; background-color:'+b+'">'+t+'</span>';
	});
	$('#demo-log div').html($('#demo-log div').html() + txt);
	$('#demo-log').scrollTop($('#demo-log').children().height());
};
Demo.log = function(){
	var args = [].slice.apply(arguments);
	args.push('\n');
	Demo.logf.apply(this, args);
};

$(function(){
	Demo.init();
	Demo.log('User agent: ' + window.navigator.userAgent);
	$('#tileset').load(function(){
		var time, otime;
		otime = time = (new Date()).getTime();
		font = Tileset.Font('#tileset');
		var font_bg = 'rgba(' + font.characters[0].pixels[0][0].toString() + ')';
		Demo.log('Font loaded in ' + ((new Date()).getTime() - time) + ' ms.\nFont:',
				 font.characters.length, 'characters, background:',
				 '{white|' + font_bg + '|' + font_bg + '}');
		var canvas = $('<canvas>').prependTo('body').attr({
			width: font.char_width * 80,
			height: font.char_height * 25
			});
		Demo.canvas = canvas = Tileset.Canvas(canvas, font);
		Demo.canvas.$canvas.css('box-shadow', '0px 0px 2px 2px #afa');
		Demo.canvas.fill_char(0, [0,0,24,79]);
		Demo.log('Testing caching (multiple colors, 5x)')
		ch = Math.floor(Math.random() * 256);
		Demo.log('Using character', ch);
		for (var i = 1; i <= 5; i++) {
			time = (new Date()).getTime();
			Demo.logf('#' + i + ': ');
			for (var r = 0; r < 256; r += 5) {
				for (var g = 0; g < 256; g += 15) {
					canvas.draw_at(ch, [255, 255, 255], [r,g,0], g/15 + 7, r/5 + 28);
				}
			}
			Demo.log('{green|Done} ('+ ((new Date()).getTime() - time), 'ms)');
		}
		var text = 'Type text here (click to focus first):';
		Demo.canvas.draw_string(text + ' __________', 0, 0);
		var r = 0, c = text.length + 1;
		Demo.canvas.events.on('keypress', function(_, e) {
			Demo.canvas.draw_string(String.fromCharCode(e.which), r, c, Math.randInt(200, 255, 3));
			c++;
			if (c>=80) {c=0; r++}
		});

		Demo.log('Total time:', (new Date()).getTime() - otime, 'ms');
	});
});
