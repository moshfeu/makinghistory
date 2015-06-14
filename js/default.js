var remoteBaseUrl = 'http://www.ranlevi.com/';
var remotePage = location.hash.replace('#', '');
var remotePageSupplied = remotePage.length > 0;
var remoteIndex = -1;
var playlist = []
var currentTrack = -1;

var startDate = new Date();
var feed = new google.feeds.Feed("http://www.ranlevi.com/feed/podcast/");
feed.setNumEntries(1000);
feed.setResultFormat(google.feeds.Feed.XML_FORMAT);

feed.load(function(result) {
	fetchResult(result);
});

function fetchResult(result) {
	var $xml = $(result.xmlDocument);
	$xml.find('item').each(function(index) {
		var elem = $(this),
			item = {
				title: elem.find('title').html(),
				artist: elem.find('author').html(),
				link: elem.find('link').html(),
				mp3: elem.find('enclosure').attr('url'),
				content: elem.find('description').html()
			};
			
		playlist.push(item);
		
		if (remotePageSupplied && item.link.indexOf(remotePage) > -1) {
			remoteIndex = index;
		}
	});
	
	var currentDate = new Date();
	var def = currentDate.getTime() - startDate.getTime();
	var to = 6000 - def;
	setTimeout(function(){
		loadPlaylist(playlist);
		if (remotePageSupplied) {
			$(window).trigger('hashchange');
		}
	}, to);
}

function loadPlaylist(playlist) {
	myPlaylist = new jPlayerPlaylist(
		{
			jPlayer: "#jquery_jplayer_N",
			cssSelectorAncestor: "#jp_container_N"
		},
		playlist,
		{
			playlistOptions: {
				enableRemoveControls: true,
				autoPlay: getPath() == ''
			},
			swfPath: "js/jplayer",
			supplied: "webmv, ogv, m4v, oga, mp3",
			useStateClassSkin: true,
			autoBlur: false,
			smoothPlayBar: true,
			keyEnabled: true,
			audioFullScreen: true,
			play: function (e) {
				if (myPlaylist.current != currentTrack) {
					currentTrack = myPlaylist.current;
					
					if ($('a.jp-playlist-current').length == 0) {
						setTimeout(scrollToTrack,1000);	
					}
					else {
						scrollToTrack();
					}
					
					redirect(myPlaylist.playlist[myPlaylist.current].link);
					$('#menu-trigger-mobile').removeAttr('checked');
				}
			},
			ready: function(e) {
				if (remoteIndex > -1) {
					myPlaylist.play(remoteIndex);
				}
				else {
					redirect(remoteBaseUrl + remotePage, true);
				}
			}
		}
	);
	
	$('#page').on('click', 'a[href*="' + remoteBaseUrl + '"][href$=".mp3"]', function(){
		var elem = $(this),
			founded = false,
			link = elem.attr('href'),
			track = $.each(playlist, function(index, item) {
				founded = item.mp3 == link;
				if (founded) {
					myPlaylist.play(index);
				}
				
				return !founded;
			});
			
		return founded;
	});
	
	$('#page').on('click', 'a[href^="' + remoteBaseUrl + '"]:not(.skip)', function() {
		//var elem = $(this),
		//	founded = false,
		//	href = elem.attr('href'),
		//	track = $.each(playlist, function(index, item) {
		//		founded = (item.link == href);
		//		if (founded) {
		//			myPlaylist.play(index);
		//			return false;
		//		}
		//	});
		//	
		//	if (!founded) {
		//		redirect(href);
		//		//getPage(href);
		//	}
		
		redirect($(this).attr('href'));
			
		return false;
	});
}

function getPage(link, stayLocation, callback) {
	var page = $('#content-wrapper');
	page.html(loader);
	
	$.get(link, function(data) {
		var response = $(data.responseText),
			title = response.filter('title').html(),
			doc = response.filter('#page'),
			content = doc.find('#content').html();
		
		if (!stayLocation) {
			document.title = title;
			
			ga('send', {
			  'hitType': 'pageview',
			  'page': getPath(),
			  'title': title
			});
		}
		page.html(content);
		page.find('#respond,.wp-audio-shortcode, h3:contains(יצירות אשר הושמעו בפרק), p:has(iframe)').remove();
		page.find('a[href*="pod.icast.co.il"]').attr('download', document.title + '.mp3').attr('target', '_blank');
		page.find('.comments-area a').each(function(){
			var elem = $(this);
			elem.addClass('skip').attr('target', '_blank');
			
			if (elem.attr('href').indexOf('http://') == -1) {
				elem.attr('href', function(index, href) {
					return remoteBaseUrl + href;
				});
			}
		});
		
		page.animate({
			scrollTop: 0
		}, 300);
		
		$('#loader').hide();
		
		if (callback) {
			callback();
		}
	});
}

function redirect(link) {
	var path = $('<a />', {href: link})[0].pathname;
	location.hash = path;
}

function getPath() {
	return location.hash.replace('#', '');
}

function playTrack() {
	var localUrl = getPath();
	var trackIndex = -1;
	$.each(playlist, function(index, t) {
		if (t.link.indexOf(localUrl) > -1) {
			trackIndex = index;
			return false;
		}
	});
	
	if (trackIndex > -1) {
		myPlaylist.play(trackIndex);
	}
}

function scrollToTrack() {
	$('.jp-playlist').animate({
		scrollTop: $('a.jp-playlist-current').closest('li').position().top
	});
}

var loader;
$(function(){
	loader = $('#loader').clone();
});

$(window).bind('hashchange', function(e) {
	getPage(remoteBaseUrl + getPath());
	playTrack();
});