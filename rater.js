/* <nowiki> // Prevents tilde expansion
Rating Script (DF Wiki) (GitHub version)
Changes from old version: jQuery, extra automatic tests
*/

//Like python: 'a{0}b'.format('c') == 'acb'
String.prototype.format=function(){s=this;for(i=0;i<arguments.length;i++){s=s.replace(RegExp('\\{'+i+'\\}','g'), arguments[i])};return s};
String.prototype.capitalize=function(){return this.slice(0,1).toUpperCase()+this.slice(1)};
addOnloadHook(function(){jQuery(function($){
	var rater = {version:'1.0-beta'};
	
	// Check for required definitions
	if(!mw||!('wgScript' in window)) throw ReferenceError('`mw` or `wgScript` not found. This script must be run on a working wiki!')
	
	rater.event=$({}); //for event bindings
	//Import a custom script that might display a message
	//(importScript doesn't seem to work here)
	$.getScript(wgScript+'?title=User:Lethosor/raterwarn.js&action=raw');
	
	function PD(e){ //preventDefault
		if(e && e.preventDefault && e.preventDefault.call)
			e.preventDefault()
	}
	function is_func(x){return !!(x&&x.call)}
	// Page-specific data
	rater.page = {
		name: wgPageName.replace(/_/g,' '),
		ns:wgCanonicalNamespace||'Main',
		url: wgScript+'?title='+wgPageName,
		exists:!$('#left-navigation').find('li[class*=selected]').find('a[href*=redlink]').length,
		load_time:$('body').html().match(/<!--.*-->/g).slice(-1)[0].match(/\d+\.\d+/)[0]
	}
	
	rater.is_valid_page = function(page){
		if(!rater.page.exists) return false;
		if(!page) page=wgPageName;
		if($('#norate').length) return false
		if('Masterwork DF2012 v0.31 40d 23a'.split(' ').indexOf(rater.page.ns)+1) return true
		return false
	};
	
	rater.error_invalid_page=function(){
		if('Special File Image Unused'.indexOf(rater.page.ns)+1||
			rater.page.ns.toLowerCase().indexOf('talk')+1){
			rater.box.clear().append('<span class="error">I\'m afraid I can\'t let you do that,'+
			' Urist.</span><p>This page isn\'t an article, and doesn\'t have some of the necessary'+
			' properties to be rated. <a href="#rater-cancel">Close this window</a></p>')
			rater.cancel_link.focus();
		}
		else if(!rater.page.exists){
			rater.box.clear().append('<p class="error">This page doesn\'t exist!</p><a href="#rater-cancel">Close this window</a>');
			rater.cancel_link.focus();
		}
		else if($('#norate').length){
			rater.box.clear().append('<span class="error">Invalid page</span>')
			.append("<p>This page has been specified as unratable. You can "+
				"<a href='#rater-force'>view this page's rating anyway</a> or "+
				"<a href='#rater-cancel'>close this window</a>.</p>");
		}
		else{
			rater.box.clear().append('<span class="error">Invalid page</span>')
			.append("<p>This page is in an invalid namespace. You can "+
				"<a href='#rater-force'>view this page's rating anyway</a> or "+
				"<a href='#rater-cancel'>close this window</a>.</p>")
		}
	};
	
	rater.confirm = function(opts){
		opts=$.extend({
			title:'undefined',
			text:'undefined',
			ok: function(){},
			cancel: function(){},
			ok_text:'Ok',
			cancel_text:'Cancel'
		},opts);
		var d = rater.Dialog();
		d.show();
		d.view.html('<p style="font-weight:bold">{0}</p><p>{1}</p>'.format(opts.title, opts.text));
		d.bottom.append($('<div id="buttons">').css({textAlign:'right'}));
		d.buttons = d.bottom.find('#buttons')
		var cancel_link = $('<a>').text(opts.cancel_text).data('ok',0).appendTo(d.buttons);
		var ok_link = $('<a>').text(opts.ok_text).data('ok',1).appendTo(d.buttons.append(' '));
		d.select=function(e){PD(e);
			d.hide();
			if($(this).data('ok')) opts.ok();
			else opts.cancel();
		}
		ok_link.add(cancel_link).attr({href:'#'}).on('click',d.select);
		return d;
	};
	
	rater.confirm.close = function(){
		rater.popup.hide()
	};
	
	//Hide the old rating script
	$('li#ca-rater').hide()
	// Set up UI
	rater.overlay = $('<div>').css({width:'100%', height:'100%', top:0, left:0,
		position:'fixed', 'background-color':'rgba(128,128,128,0.5)', 'z-index':9999})
		.hide().appendTo('body');
	
	
	//See http://jsfiddle.net/AN9qR/4/
	var win_height=$(window).height()/2;
	var win_width = $('#bodyContent').width()*0.8;
	rater.win = $('<div>').css({width:win_width+8, height:win_height+8, 'font-size':'1.25em', top:'1.5em', right:0, position:'absolute', 'background-color':'#fbfbf9', 'z-index':10000, 'border-radius':4, border:'1px solid #ccb', 'box-shadow':'0 0 6px rgba(128,128,128,.6)', overflow:'visible',padding:4})
		.hide().appendTo('#bodyContent');
	
	rater.win.filler = $('<div>').css({width:win_width+8, height:win_height+8, 'font-size':'1.25em', top:0, left:0, position:'absolute', 'background-color':'#fbfbf9', 'z-index':10002, overflow:'hidden', 'border-radius':4})
		.appendTo(rater.win);
	
	rater.win.inner = $("<div>").css({display:'block',position:'relative', top:0,left:0, 'border-radius':4, 'z-index':10003, 'background-color':'#fbfbf9', width:win_width-12, height:win_height, 'overflow-y':'auto', 'overflow-x':'hidden', margin:6})
		.appendTo(rater.win);
	rater.win.arrow = $("<span>").css({display:'block', position:'absolute', 'background-color':'#fbfbf9', height:'1.5em', width:'1.5em', top:'-.75em', right:'1.5em', 'z-index':10001, '-webkit-transform':'rotate(45deg)', transform:'rotate(45deg)', 'box-shadow':'0 0 6px rgba(128,128,128,0.6)', border:'1px solid #ccb'})
		.prependTo(rater.win);
	rater.rating_exists=true;
	if(!$('.topicon').length){ // No current/visible quality rating
		rater.rating_exists=false;
		rater.win.arrow.hide();
		//create a blank one
		$('<div>').addClass('topicon').css({right:10}).appendTo('#bodyContent');
		$('.topicon').append($("<span>"));
	}
	
	rater.about_link = $('<a>').text('About').attr('href','#rater-about').css({'float':'right',
		paddingRight:'0.5em'}).appendTo(rater.win);
	rater.hide_link = $('<a>').text('Hide').attr('href','#rater-hide').css({color:'#f60', 
		'float':'right', paddingRight:'0.5em'}).appendTo(rater.win);
	rater.cancel_link = $('<a>').text('Cancel').attr('href','#rater-cancel').css({color:'red', 
		'float':'right'}).appendTo(rater.win);
	
	rater.popup={};
	rater.popup.overlay = $('<div>').css({width:'100%', height:'100%', top:0, left:0,
		position:'fixed', 'background-color':'rgba(128,128,128,0.5)', 'z-index':10001})
		.hide().appendTo('body');
	rater.popup.box = $('<div>').css({width:'40%', height:'60%', top:'20%', left:'30%',
		position:'fixed', 'background-color':'white', 'z-index':10002, padding:'1em',
		overflow:'auto','border-radius':4})
		.hide().appendTo('body');
	rater.popup.close_link = $('<a>').text('Close').attr('href','#rater-popup-hide').css({color:'red', 
		'float':'right'}).appendTo(rater.popup.box);

	rater.popup.show = rater.popup_show = function(e){
		PD(e);
		rater.popup.box.stop(1,1).fadeIn(300);
		rater.popup.overlay.stop(1,1).fadeIn(300);
		$('body').on('keydown', rater.popup.esc_key);
	};
	rater.popup.hide = rater.popup_hide = function(e){
		PD(e);
		rater.popup.overlay.stop(1,1).fadeOut(300);
		rater.popup.box.stop(1,1).fadeOut(300);
		$('body').off('keydown', rater.popup.esc_key);
	};
	rater.popup.esc_key = function(e){
		if (e.keyCode == 27) { //esc
			PD(e);
			rater.popup.hide();
		}
	};
	rater.popup.esc_click = function(e){ // exit for click events
		PD(e); rater.popup.hide();
	};
	rater.popup.overlay.click(rater.popup.esc_click);
	
	rater.Dialog = function(opts){
		var t={}; //'this'
		t.opts = $.extend({show_close_link:0}, opts);
		t.overlay = $('<div>').css({width:'100%', height:'100%', top:0, left:0,
			position:'fixed', 'background-color':'rgba(128,128,128,0.5)', 'z-index':11001})
			.hide().appendTo('body');
		t.box = $('<div>').css({width:'40%', height:'20%', top:'30%', left:'30%',
			position:'fixed', 'background-color':'white', 'z-index':11002, padding:'1em',
			overflow:'auto','border-radius':4})
			.hide().appendTo('body');
		t.view = $('<div>').appendTo(t.box)
		t.bottom = $('<div>').css({position:'absolute', bottom:'1em', right:'1em'}).appendTo(t.box)
		t.close_link = $('<a>').text('Close').attr('href','#rater-popup-hide').css({color:'red', 
			'float':'right'}).appendTo(t.box);
		if(!t.opts.show_close_link) t.close_link.hide();
		t.show = function(e){
			PD(e);
			t.box.stop(1,1).fadeIn(300);
			t.overlay.stop(1,1).fadeIn(300);
			return t;
		};
		t.hide = function(e){
			PD(e);
			t.overlay.stop(1,1).fadeOut(300);
			t.box.stop(1,1).fadeOut(300);
			return t;
		}; 
		//if(t!=window&&t!=SCOPE) for(i in t) this[i]=t[i];
		return t;
	};
	
	$('body').on('click','a[href=#rater-popup-hide]',rater.popup_hide);
	
	rater.popup.clear=function(){
		rater.popup.box.html('').append(rater.popup.close_link);
	};
	rater.popup.clear();

	rater.frame={list:{}};
	rater.frame.current_frame=function(){return rater.frame.list[rater.frame.current]}
	rater.frame.change=function(name){
		if(rater.frame.current) $('.rater-frame').hide().css({margin:'1em'});
		if(!(name in rater.frame.list)){
			rater.frame.list[name]=$('<div>').addClass('rater-frame').css({margin:'1em',position:'relative'});
		}
		rater.frame.list[name].appendTo(rater.win.inner).show();
		rater.frame.current=name;
	};
	
	rater.frame.change('main')
	rater.box=rater.frame.list['main'];
	
	rater.box.clear = function(){
		rater.box.html('')
		rater.box.append(rater.cancel_link).append(rater.hide_link).append(rater.about_link)
			.append($('<h2>').text('Rating '+rater.page.name));
		rater.event.trigger('box-clear');
		return rater.box;
	};
	rater.box.clear()
	
	rater.cancel = function(e){
		PD(e);rater.show_link.removeClass('selected');
		rater.overlay.stop(1,1).fadeOut(300);
		rater.win.stop(1,1).fadeOut(300);
		if(rater.is_valid_page() || rater.rating_exists) rater.show_link_topicon.show(500);
		rater.active=false;
	};
	// True when in the middle of a rating
	// Note the difference between this and rater.active, true when the rater is opened (maybe visible)
	rater.in_progress = false;
	rater.hide = function(e){PD(e);
		rater.win.fadeOut(300);
		rater.resume_link = $('<a>').attr({href:'#rater-resume'}).text('Continue rating').appendTo('.topicon').css({padding:'0 0.5em'});
		rater.in_progress = true;
	};
	rater.resume = function(e){PD(e);
		if(!rater.in_progress) return;
		rater.resume_link.hide();
		rater.win.fadeIn(300);
	};
	$('body').on('click','a[href=#rater-cancel]',rater.cancel);
	$('body').on('click','a[href=#rater-hide]',rater.hide);
	$('body').on('click','a[href=#rater-resume]',rater.resume);
		
	// Set up links
	rater.show_link = $("<li>").append($('<span>').append(
		$("<a href='#rater-invoke'>").text('Rate')
	));
	$("#left-navigation #p-namespaces ul:nth(0)").append('<li><span><a></a></span></li>')
	$("#left-navigation #p-namespaces ul:nth(0)").append(rater.show_link)
	
	rater.show_link_topicon = $('<a>').attr({href:'#rater-invoke',title:"Change this page's rating"}).text('Change').appendTo('.topicon').css({'padding-left':6});
	if(!rater.rating_exists) rater.show_link_topicon.hide()
	
	// True when the rater box has been opened but not closed (may be hidden)
	rater.active=false;
	rater.invoke = function(e, force){PD(e);
		if(rater.active) return;
		rater.win.stop(1,1).fadeIn(300);
		rater.frame.change('main');
		rater.box.clear();
		if(!rater.is_valid_page(wgPageName) && !force){
			rater.error_invalid_page();
			return;
		}
		rater.show_link_topicon.hide(500);
		rater.show_link.addClass('selected');
		rater.box.append('<p>Performing automatic tests, please wait...</p>');
		rater.loader_progress = $('<div>').appendTo(rater.box);
		rater.begin_tests();
		rater.active=true;
	};
	$('body').on('click', 'a[href=#rater-invoke]', rater.invoke);
	$('body').on('click', 'a[href=#rater-force]', function(e){rater.invoke(e,1)});
	
	rater.about = function(e){PD(e);
		var prevf=rater.frame.current;
		rater.frame.change('about');
		var f=rater.frame.current_frame();
		f.html(
			'<h2>Rating script</h2><p>v{0}</p>'.format(rater.version)+
			'<p><a href="https://github.com/lethosor/dfwiki-rater">GitHub repo</a></p>'
		);
		$('<a>').attr({href:'#'}).text('Go back').click(function(e){PD(e);
			rater.frame.change(prevf);
		}).appendTo(f);
	};
	$('body').on('click','a[href=#rater-about]',rater.about);
	
	/*
	nonstd = Non-standard
	Extra/advanced options - deleting template, mark as "Unrated", etc.
	*/
	rater.nonstd={};
	
	rater.nonstd.metadata={
		'rm-quality':{
			desc: 'Remove the quality rating',
			process: function(data){
				return data.replace(/{{quality[^}]*?}}\n*/gi,'');
			},
			summary:'Removed quality rating (was "{0}")'
		},
		'mark-unrated':{
			desc: 'Mark as unrated',
			process: function(data){
				return data.replace(/{{quality[^}]*?}}\n*/gi,'')+'{{quality|Unrated|~~~~~}}\n';
			},
			summary:'Changed quality rating from "{0}" to "Unrated"',
			needs_valid: true
		}
	};
	
	// Set up UI
	rater.frame.change('nonstd')
	rater.nonstd.view=rater.frame.list.nonstd
	rater.frame.change('main')
	
	rater.nonstd.init=function(e){PD(e);
		rater.frame.change('nonstd');
		var v=rater.nonstd.view;
		v.html('').append('<h2>Advanced options</h2><p id="p">No options available for this page.</p>');
		v.append(rater.nonstd.cancel_link);
		var md=rater.nonstd.metadata, ul=$('<ul>').appendTo(v);
		for(var i in md){if(i in {}) continue;
			if(!rater.is_valid_page() && md[i].needs_valid) continue;
			v.find('p#p').hide()
			var a=$('<a>').text(md[i].desc).attr('href','#rater-nonstd-select').data('opt',i)
			ul.append($("<li>").append(a));
		}
	};
	rater.nonstd.select=function(e){PD(e);
		var opt=rater.nonstd.opt=$(this).data('opt');
		rater.confirm({title:'Confirm', text:'Are you sure you want to perform this action?',
			ok_text:'Continue', ok:rater.nonstd.process})
	};
	rater.nonstd.process = function(){
		var opt=rater.nonstd.opt,md=rater.nonstd.metadata;
		var new_text = md[opt].process(rater.loader.results.raw);
		rater.confirm({title:'Saving...', text:'Please wait', ok_text:'', cancel_text:''})
		rater.edit_page({text:new_text, minor:1, summary:md[opt].summary.format(rater.tests.current_rating) + ' using the rating script'}).on('done', function(){
			window.location.reload();
		});
	};
	
	rater.nonstd.cancel=function(e){PD(e);
		rater.frame.change('main');
	};
	rater.nonstd.init_link=$('<a>').text('Advanced options').attr({href:'#rater-nonstd-init'});
	rater.nonstd.cancel_link=$('<a>').text('Back').attr({href:'#rater-nonstd-cancel'}).css({color:'red', position:'absolute', right:0, top:'1em'});
	$('body')
		.on('click','a[href=#rater-nonstd-init]', rater.nonstd.init)
		.on('click','a[href=#rater-nonstd-cancel]', rater.nonstd.cancel)
		.on('click','a[href=#rater-nonstd-select]', rater.nonstd.select)
	rater.event.bind('results-displayed', function(){rater.nonstd.init_link.appendTo(rater.box)})
	
	/*
	Decriptions of URLs, tests, etc.
	*/
	rater.metadata={};
	rater.metadata.urls = {
		// API queries (not actual URLs)
		// Objects are converted to a querystring by jQuery
		'raw': {
			action: 'query',
			prop: 'revisions',
			titles: rater.page.name,
			rvprop: 'content',
			rvlimit: 1,
			indexpageids: 1,
		},
		'render': {
			action: 'parse',
			page: rater.page.name,
			prop: 'text|categories|links|templates|externallinks',
		},
		'backlinks': {
			action: 'query',
			list: 'backlinks',
			bltitle: rater.page.name, 
			bllimit: 50,
			blfilterredir: 'nonredirects',
		},
		'history': {
			action: 'query',
			prop: 'revisions',
			titles: rater.page.name,
			rvprop: 'user',
			rvlimit: 100,
			indexpageids: 1,
		},
	};
	
	// Data filters - apply to object returned from API request
	// Essentially prevents having to write obj.query.pages[1] too often
	rater.metadata.data_filters = {
		'raw': function(obj){
			return obj.pages[obj.pageids[0]].revisions[0]['*'];
		},
		'render': function(obj){
			return obj.parse;
		},
		'backlinks': function(obj){
			return obj.backlinks;
		},
		'history': function(obj){
			return obj.pages[obj.pageids[0]].revisions;
		},
	}
		
	/*
	Tests to be performed
	Structure: {
		name: 'Human-readable name',
		init: function(data){... return Object},
		[str: function(obj){... return String}]
		[int: function(obj){... return Number}]
		score: function(obj){... return Number}
		[info: function(obj,view){...}]
	}
	Functions in [brackets] are optional
	
	Parameters:
	- data: The raw data returned from the URLs in rater.metadata.urls (e.g. rater.raw is raw page text)
	- obj: An object returned from the object's init()
	- view: A HTML element (usually <div>) that will be displayed to the user
	
	*/
	rater.metadata.tests = {
		redlinks:{
			name:'Redlinks',
			init:function(data){
				all_links = data.render.text['*'].match(/<a .*<\/a>/g);
				if(!all_links) return 0; //no links
				var total_redlinks=0;
				$.each(all_links, function(i,link){
					if(link.match(/href=.*redlink=1/)) total_redlinks++;
				});
				return total_redlinks
			},
			score:function(o){
				return o*-5 + 10;
			}
		},
		links:{
			name:'Outbound links',
			init:function(data){
				return data.render.links.length;
			},
			score:function(o){
				if(o==0) return -20; //no links
				return o; //1 point per link
			}
		},
		extlinks:{
			name:'External links',
			init:function(data){
				return data.render.externallinks.length;
			},
			score:function(o){
				return o*0.5;
			}
		},
		linkshere:{
			name:'Incoming links',
			init:function(data){
				var a={length:data.backlinks.length, list:[]};
				$.each(data.backlinks,function(i,p){
					a.list.push(p.title);
				});
				return a;
			},
			str: function(o){return o.length},
			int: function(o){return Number(o.length)},
			info: function(o,view){
				$('<h2>').text('Incoming links').appendTo(view);
				var ul=$("<ul>").appendTo(view);
				for(i in o.list){if(i in []) continue;
					ul.append('<li><a href="{1}/{0}" target="_blank">{0}</a></li>'.format(o.list[i], wgScript));
				}
				view.append('<h4>Total: {0}</h4>'.format(o.length))
			},
			score:function(o){
				var x=o.length;
				if(x==0) return -35; //orphaned
				return x*2.5; //links here are good
			}
		},
		editors:{
			name:'Editor count',
			init:function(data){
				var list = data.history;
				var editors={total_edits: list.length, total:0};
				for(i=0; i<list.length; i++){
					ed = list[i].user;
					if(!(ed in editors)){
						editors[ed]=0;
						editors.total++;
					}
					editors[ed]++ 
				}
				return editors;
			},
			str:function(o){return o.total}, int:function(o){return o.total;},
			info:function(o,view){
				var tbl=$("<table>").css({width:'100%'}).append('<tr><th colspan="2">User</th><th>Edits</th></tr>').addClass('wikitable sortable').appendTo(view)
				for(i in o){
					if(i in {}||!i.indexOf('total')) continue;
					tbl.append('<tr><td colspan="2"><a href="{2}/User:{0}" target="_blank">{0}</a>:</td><td>{1}</td></tr>'.format(i,o[i],wgScript))
				}
				tbl.append('<tr style="font-weight:bold"><td>Total:</td><td>{0}</td><td>{1}</td></tr>'.format(o.total,o.total_edits))
			},
			score:function(o){
				var n=Math.max(1,Math.floor(o.total))
				if(n==1) return 0;
				if(n==2) return 6;
				if(n==3) return 14;
				return 20*n;
			}
		},
		length:{
			name:'Article length',
			init:function(data){
				var a={
					'full':data.raw.length,
					'nospace':data.raw.replace(/\s/g,'').length,
					'notemplate':data.raw.replace(/{{[^}]*?}}/g,'').length,
					'plain':data.raw.replace(/\s/g,'').replace(/{{[^}]*?}}/g,'').length,
					'html':data.render.text['*'].length,
					'text':$(data.render.text['*']).text().length
				};
				a.average=Math.round(.1*a.full + .2*a.notemplate + .2*a.plain + .1*a.html + .1*a.nospace + .3*a.text);
				return a;
			},
			int:function(o){return o.average},
			str:function(o){return o.average + ' (weighted)'},
			info:function(o,view){
				var tbl=$("<table>").css({width:'100%'}).append('<tr><th colspan="2">Article Length</th></tr>').addClass('wikitable').appendTo(view);
				var descs={html:'Generated HTML', text:'Displayed text', full:'Wikitext', nospace:'Wikitext without spaces', notemplate:'Wikitext without templates', plain:'Wikitext without spaces and templates'}
				for(i in o){if(!(i in descs))continue;
					tbl.append('<tr><td>{0}</td><td>{1}</td></tr>'.format(descs[i],o[i]));
				}
				tbl.append('<tr style="font-weight:bold;"><td>Weighted</td><td>{0}</td></tr>'.format(o.average))
			}
		},
		verify:{
			name:'{{Verify}} tags',
			init:function(data){
				var m=data.raw.match(/{{verify/gi);return +(m&&m.length);
			},
			score:function(o){if(o<1) return 0; if(o==1) return -10; return o*-20}
		},
		categories:{
			name:'Categories',
			init:function(data){
				var cats=data.render.categories, o={total:cats.length,list:[]};
				$.each(cats,function(i,c){o.list.push(c['*'].replace(/_/g,' '));});
				return o;
			},
			int: function(o){return o.total},
			info: function(o, view){
				$('<h2>').text('Categories').appendTo(view);
				var ul=$("<ul>").appendTo(view);
				for(i in o.list){if(i in []) continue;
					ul.append('<li><a href="{1}/Category:{0}" target="_blank">{0}</a></li>'.format(o.list[i], wgScript));
				}
				view.append('<h4>Total: {0}</h4>'.format(o.total))
			}
		},
		current_rating:{
			name:'Current rating',
			init:function(data){
				m=data.raw.match(/{{quality[^}]*?}}/i);
				return (m&&m.length&&m[0].slice(2,-2).split('|')[1])||'';
			},
			score:function(o){return [0,-15,0,10,20,40][rater.rating_arr.indexOf(o)+1]}
		}
	};
	
	rater.metadata.questions = {
		enough_info:{
			q:'Does the page contain a decent amount of information?',
			type:'bool',
			score:function(v){return v?40:-50;}
		},
		inaccurate:{
			q:'Does the page contain any inaccurate information?',
			type:'bool',
			score:function(v){return v?-50:20;}
		},
		understandable:{
			q:'Is the page relatively easy to understand?',
			type:'bool',
			score:function(v){return v?40:-35}
		},
		cats_ok:{
			q:'Are the categories appropriate?',
			type:'bool',
			score:function(v){return v?25:-15}
		},
		appearance:{
			q:'Page appearance:',
			type:'choice',
			choices:['Poor','Average','Good','Very good','Extremely good'],
			default_choice:1,
			score:function(v){return 35*v-50}
		}
	};
	rater.questions={ans:{}};
	
	rater.ratings={
		tattered:{id:1,color:{b:'#333',bg:'#ccc',c:'#333'},s:'x'},
		fine:{id:2,color:{b:'#db8',bg:'#ffe0cc',c:'#ca7a02'},s:'+'},
		superior:{id:3,color:{b:'#b8f',bg:'#e4ccff',c:'#80c'},s:'*'},
		exceptional:{id:4,color:{b:'#9df',bg:'#cce4ff',c:'#08c'},s:'\u2261'},
		masterwork:{id:5,color:{b:'#bd8',bg:'#e2fdce',c:'#72a329'},s:'\u263c'}
	};
	rater.rating_arr=['tattered','fine','superior','exceptional','masterwork'];
	
	/* Stores the results of tests */
	rater.tests={};
	
	/*
	Loader
	Loads multiple URLs, with optional callbacks 
	*/
	var loader={};
	loader.list={}; //list of all tests
	loader.results={}; //shortcut: data[x]==lists[x].data
	
	loader.event=$({});
	loader.num_waiting = 0;
	loader.total_tests = 0;
	loader.key=Math.floor(Math.random()*1e8); //prevent caching
	
	loader.add = function(name, url, urldata){ 
		loader.list[name] = {url:url, urldata:urldata};
		urldata = $.extend(urldata, {rater:loader.key});
		$.get(url, urldata, function(data){
			loader.ready(name, data);
		});
		loader.num_waiting++;
		loader.total_tests++;
	};
	loader.ready = function(name,data){
		if(data.query)
			data = data.query;
		// Pass data through relevant filter, if it exists
		if (rater.metadata.data_filters[name])
			data = rater.metadata.data_filters[name](data);
		loader.list[name].result = loader.results[name] = data;
		loader.num_waiting--;
		loader.event.trigger('ready',{left:loader.num_waiting,total:loader.total_tests,name:name,data:data}); 
		if(loader.num_waiting <= 0){
			setTimeout(loader.all_complete, 1); //async
		}
	};
	
	loader.all_complete = function(){
		loader.event.trigger('done');
		// Reset
		loader.total_tests=0;
		loader.event.off(); // Unbind all events for another (possible) run
	};
	loader.add_callback=function(func){
		// For compatibility -- triggered on `done` event
		loader.event.bind('done',func);
	};
	
	loader.reset = function(){
		// Avoid caching - it messes with the old rating vs. new rating code
		loader.key+=Math.floor(Math.random()*1e2)+2;
	};
	
	rater.help={view:$('<div>').css({height:'100%'})};
	rater.help.init=function(){
		$.get(wgScript+'/DF:Quality?action=render',function(d){
			d=$(d);
			rater.help.data=[];
			for(var i=0;i<=5;i++){
				rater.help.data[i]=d.filter('h3:nth({0})'.format(i)).nextUntil('h3');
				rater.help.data[i].splice(0,0,d.filter('h3:nth({0})'.format(i))[0]); // prepend header
			};
			rater.help.update();
		});	
	};
	rater.help.update=function(n){
		if(!rater.help.data)return;
		if(!(n+1)){
			try{
				n=rater.ratings[rater.select.current].id;
			} catch(e){return}
		}
		rater.help.view.text('').append(rater.help.data[n]);
		rater.help.view.find('.editsection').hide();
		//rater.box.scrollTop(rater.box.height());
	};
	
	rater.progress={};
	rater.progress.view=$("<div>").css({width:'100%',padding:0,margin:0});
	
	rater.progress.bar=$('<div>').css({width:'100%','background-color':'#fff',border:'1px solid #ac7',padding:3,'border-radius':2,overflow:'hidden'}).appendTo(rater.progress.view);
	
	rater.progress.fill=$('<div>').css({float:'left',padding:0,'background-color':'#ce9','border-right':'1px solid #ac7',height:'100%',width:0,margin:-3, position:'relative',top:0,left:0, 'border-radius':2}).appendTo(rater.progress.bar).html('&nbsp;');
		
	rater.progress.update=function(done,total,dur){
		var perc=done/Math.max(total,1)*100;
		dur=Number(dur||0);
		if(!dur) dur=150;
		rater.progress.fill.stop().animate({width:perc+'%'},dur)
	};
	rater.progress.reset=function(){rater.progress.update(0,1,-1);};
	
	rater.begin_tests = function(){
		// Initialize the 'help' view
		rater.help.init();
		rater.progress.reset();
		for(i in rater.metadata.urls){ if(i in {}) continue;
			// Request result as JSON
			var data = $.extend(rater.metadata.urls[i], {format:'json'});
			var url = wgScriptPath + '/api.php';
			loader.add(i, url, data);
		}
		function update_progress() {
			var html="";
			for (i in loader.list) {
				html += '<p>'+i.capitalize()+': ';
				if (loader.list[i].result)
					html+='Done</p>';
				else
					html+='Waiting...</p>'
			}
			rater.loader_progress.html(html);
		}
		
		loader.event.bind('ready',function(e,d){rater.progress.update(d.total-d.left,d.total)});
		loader.event.bind('ready', update_progress);
		rater.progress.view.insertBefore(rater.loader_progress);
		loader.event.bind('done', rater.process_tests);
		loader.event.bind('done', rater.display_test_results);
		loader.event.bind('done', rater.progress.reset);
	};
	
	rater.score_bool=function(v,y,n){
		if(isNaN(Number(n))) n=-y;
		return Number(v?y:n);
	};
	rater.score_int=function(v,weight,base){
		if(!base) base=0;
		return v*weight+base;
	};
	
	rater.tests={}
	
	rater.process_tests=function(){
		var mdt=rater.metadata.tests;
		for(i in mdt){if(i in {})continue;
			if(is_func(mdt[i].init))
				rater.tests[i]=mdt[i].init(loader.results);
		}
	};
	
	rater.update_score=function(s){
		rater.score=s;$('.rater-score').text(s);
	}
	
	rater.display_questions=function(){
		// returns a <div>
		var v=$('<div>');
		rater.questions.views={};
		for(var i in rater.metadata.questions){if(i in {})continue;
			var qv=rater.questions.views[i]=$('<p>'), qid='raterq-'+i;
			qv.opts=[];
			var q=rater.metadata.questions[i];
			if(q.type == 'bool'){
				qv.opts[0]=$('<input type="checkbox">').attr({id:qid}).appendTo(qv)
					.data({q:q, i:i});
				//rater.questions.ans[i] = false; //default value
				qv.opts[0].label=$('<label>').text(q.q).attr({'for':qid}).appendTo(qv);
				qv.opts[0].on('change', function(e){
					var q=$(this).data('q'), i=$(this).data('i');
					if (!q||!i) return;
					rater.questions.ans[i] = $(this).is(':checked');
					rater.score_questions();
				});
				qv.opts[0].trigger('change'); // set default values
			}
			else if(q.type == 'choice'){
				qv.text(q.q+' ');
				for(var j=0; j<q.choices.length; j++){
					qv.opts[j]=$('<input type="radio">').data({q:q, i:i, j:j})
						.attr({id:qid+j,name:qid}).appendTo(qv);
					qv.opts[j].label=$('<label>').text(q.choices[j])
						.attr('for',qid+j).appendTo(qv);
					qv.opts[j].on('change', function(e){
						var q=$(this).data('q'), i=$(this).data('i'), j=$(this).data('j');
						if (!q||!i) return;
						rater.questions.ans[i] = j;
						rater.score_questions();
					});
				}
				qv.opts[q.default_choice].prop('checked',true).trigger('change');
			}
			qv.appendTo(v);
		}
		return v;
	};
	
	rater.score_questions=function(){
		var s=rater.score_orig;
		for(var i in rater.questions.ans){if(i in {})continue;
			s+=rater.metadata.questions[i].score(rater.questions.ans[i]);
		}
		rater.score=s;
		rater.update_score(s);
	};
	
	rater.display_test_results=function(){
		rater.frame.change('main')
		var md=rater.metadata.tests;
		rater.box.clear();
		data=rater.tests;
		rater.score=0;
		for(var i in data){
			name=md[i].name;
			str=is_func(md[i].str)?md[i].str(data[i]):
				(is_func(md[i].int)?md[i].int(data[i]):data[i]);
			if(is_func(md[i].info)){
				str=$('<a href="#">'+str+'</a>').data({f:md[i].info,d:data[i]})
				.click(function(e){d=$(this).data()
					rater.popup.clear();	rater.popup_show(e);
					d.f(d.d,rater.popup.box.append($("<div>")))
				}).css({color:'#1655ad'});
			}
			rater.box.append($("<p>"+name+": </p>").append(str));
			if(is_func(md[i].score)){
				rater.score += Number(md[i].score(data[i]))
			}
		}
		
		rater.score_orig = rater.score;
		
		rater.box.append(rater.display_questions());
		
		rater.box.append($("<p>").html("Score: <span class='rater-score'>{0}</span>".format(rater.score)));
		$("<a>").attr({href:'#rater-override'}).html('Select rating &rarr;').appendTo(rater.box).css({position:'absolute',top:'1em',right:'0'})
		
		rater.event.trigger('results-displayed')
	};
	rater.select={};
	rater.select.view=$("<div>").css({padding:'.2em'});
	rater.select.init=function(e){PD(e);
		rater.frame.change('rating-desc');
		rater.select.frame=rater.frame.current_frame();
		rater.select.current=rater.tests.current_rating.toLowerCase()||'tattered';
		rater.select.view.appendTo(rater.select.frame);
		rater.select.draw();
	};
	$('body').on('click','a[href=#rater-override]',rater.select.init);
	rater.select.draw=function(){
		$('.topicon > span').hide();
		var c, selected, a, 
			view=rater.select.view,
			topview=$('<span>').appendTo('.topicon');
		view.html(''); topview.html('');
		$("<span>").text('Select rating: ').appendTo(topview);
		list=$('<span>').css({'font-size':'.8em'}).appendTo(topview)
		for(i in rater.ratings){if(i in {}) continue;
			c=rater.ratings[i];
			a=$('<span>').appendTo(list).data('rating',i).attr({tabindex:0}).css({cursor:'pointer'}); //not real link
			a.append($('<span>').text(c.s+i.toUpperCase()+c.s)
				.css({'text-decoration':'none','color':c.color.c}));
			if(i==rater.select.current){
				selected=rater.ratings[i];
				a.find('span').css({'border-color':c.color.b,'background-color':c.color.bg,'border-width':1,'border-style':'solid','border-radius':2,padding:'.2em'})
			}
			a.on('click focus',rater.select.click);
			list.append(' ');
		}
		if(rater.is_valid_page()){
			rater.select.submit_link=$('<a>').attr({href:'#rater-select-submit'}).text("Submit").appendTo(topview);
			topview.append(' ');
		}
		rater.select.reset_link=$('<a>').attr({href:'#rater-select-reset'}).text("Reset").appendTo(topview);
		topview.append(' ');
		rater.select.cancel_link=$('<a>').attr({href:'#rater-select-cancel'}).text("Back").appendTo(topview).css({color:'red'});
		rater.select.cancel_link.clone().appendTo(view)
		rater.help.view.appendTo(view);
		rater.help.update(selected&&selected.id||0);
	};
	
	rater.select.click=function(e){if(e.type=='click')PD(e);
		rater.select.current=$(this).data('rating');
		rater.select.draw();
	};
	
	rater.select.reset=function(e){PD(e);rater.select.init();};
	
	rater.select.cancel=function(e){PD(e);
		rater.select.reset();
		$('.topicon > span').hide().filter(':nth(0)').show();
		rater.frame.change('main');
	};
	
	$('body').on('click','a[href=#rater-select-reset]',rater.select.reset);
	$('body').on('click','a[href=#rater-select-cancel]',rater.select.cancel);
	$('body').on('click','a[href=#rater-select-submit]',function(e){PD(e);
		rater.submit_rating();
	});
	
	rater.submit_rating=function(){
		// Set up UI
		rater.overlay.fadeIn(400);
		rater.frame.change('submit-progress');
		var view=rater.frame.current_frame();
		view.html('');
		rater.progress.reset();
		rater.progress.view.appendTo(view);
		var stat=$('<div>').css({'white-space':'pre'}).appendTo(view);
		function w(s){stat.append(s);}
		// Safety checks
		var r=rater.select.current;
		if(r in {}||!(r in rater.ratings)) return;
		
		var rating=rater.select.current.capitalize();
		var old_rating=rater.tests.current_rating.capitalize();
		if(!rater.loader.results.raw) return;
		// Get token - most of these messages are left over
		w('Getting token... ');
		var token = mw.user.tokens.values.editToken;
		rater.progress.update(1,3);
		w('Ok ({0})\nReplacing quality template... '.format(token.slice(0,8)));
		var text=rater.loader.results.raw.replace(/{{quality[^}]*?}}\n*/gi,'');
		text='{{Quality|'+rating+'|~~~~~}}\n'+text;
		w('Ok\nEditing page... ');
		// Edit summary
		var summary = (old_rating!='')?'Changed quality rating from "{0}" to "{1}" using the rating script'.format(old_rating,rating):'Added quality rating "{0}" using the rating script'.format(rating)
		if(rating==old_rating) summary='Updated quality rating timestamp ("{0}") using the rating script'.format(rating)
		
		var save=function(){
			rater.overlay.fadeIn(400);
			rater.update_page=function(){
				rater.progress.update(2,3);
				w('Finished!\nUpdating...');
				// Parse {{quality}} with the new rating
				$.get(wgScriptPath+'/api.php',{action:'parse',text:'{{Quality|'+rating+'|~~~~~}}', format:'json',title:wgPageName},
				function(d){
					rater.progress.update(3,3);
					$('.topicon > *').hide().parent().prepend($(d.parse.text['*']).filter(':nth(0)').contents());
					// Replace categories
					$('.catlinks ul:nth(0) li a:contains(Quality Articles)').hide();
					var cats = d.parse.categories;
					for(i=0;i<cats.length;i++){
						$('<a>').attr({href:wgScript+'/Category:'+cats[i]['*']}).text(cats[i]['*'].replace(/_/g,' ')).appendTo($("<li>").appendTo('.catlinks ul'));
					}
				
					$('.catlinks li a:hidden').remove();
					$('.catlinks li:empty').remove();
				
					rater.progress.update(5,4);
					rater.cancel();
					jsMsg('Rated article <b>'+rating+'</b>');
					var old_title=document.title;
					document.title='Rated article '+rating
					setTimeout(function(){
						document.title=old_title
					}, 2500);
					loader.reset()
				});
			};
			rater.edit_page({minor:1, text:text, summary:summary}).on('done',rater.update_page);
		};
		// Confirm if ratings are identical
		function cancel(){
			rater.popup.hide()
			// Go back to the rating description
			rater.frame.change('rating-desc')
			rater.overlay.fadeOut(400);
		};
		if(rating == old_rating){
			rater.confirm({
				title:'Confirm submission', 
				text:'The rating you selected is the same as the current rating. Continuing will only update the timestamp. Do you want to continue?',
				ok_text:'Only update timestamp',
				ok:save,
				cancel:cancel
			});
		}
		else save()
	};
	
	rater.edit_page=function(opts){
		if(!('text' in opts)) return false;
		opts=$.extend({
			summary:'',
			token:mw.user.tokens.values.editToken,
			title:rater.page.name,
			minor:0
		},opts);
		var event=$({}); // For attaching callbacks
		$.post(wgScriptPath+'/api.php', {action:'edit', title:opts.title, text:opts.text,
		token:opts.token, minor:opts.minor, summary:opts.summary},function(d){
			event.trigger('done')
		});
		return event;
	};
	
	//check for a provided hash...
	if(window.location.hash.length){
		rater.auto_link=$('<a>').attr('href',window.location.hash).appendTo('body');
		setTimeout(function(){rater.auto_link.click()},100);//after this returns, anon for scope
	}
	//Check querystring for message
	rater.qs_raw=window.location.search.slice(1);rater.qs_list=rater.qs_raw.split('&');rater.qs={};
	for(var i=0;i<rater.qs_list.length;i++){
		var v=rater.qs_list[i].split('=');
		rater.qs[v[0]]=v[1]
	}
	
	//$(document).trigger('rater.ready');
	//export
	rater.loader=loader;window.rater=rater;return rater;
});});
// </nowiki>

