function RSInit($){
	$.get('https://raw.github.com/lethosor/dfwiki-rater/master/cv.txt', function(d){
		if(!window.RSV) window.RSV=0;
		RSV = Math.min(1,Math.max(0,RSV));
		window.RSB = d.split('\n')[RSV];
		$.getScript('https://raw.github.com/lethosor/dfwiki-rater/'+RSB+'/rater.js')
	});
}
jQuery(RSInit);

