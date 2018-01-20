/*
config = {
	remoteBaseURL,
	feedURL,
	getPageCallback (page),
	whitelistCategories,
	getContent(response),
	fetchItemResultFromXML(item)
}
*/

if (!config) {
  throw 'config not found';
}

var remoteBaseUrl = config.remoteBaseURL;
var remotePage = location.hash.replace('#', '');
var remotePageSupplied = remotePage.length > 0;
var remoteIndex = -1;
var playlist = []
var currentTrack = -1;

var startDate = new Date();
fetchResult();

function intersection(array1, array2) {
  var result = array1.filter(function (n) {
    return array2.indexOf(n) != -1;
  });

  return result.length > 0;
}

function getItems() {
  return $.ajax({
    url: 'https://api.rss2json.com/v1/api.json',
    method: 'GET',
    dataType: 'json',
    data: {
      rss_url: config.feedURL,
      api_key: 'ysnxxhitqnd70wq1xxnenlwwyzxnlxsssck98rub', // put your api key here
      count: 150
    }
  }).done(function (response) {
    if (response.status != 'ok') {
      throw response.message;
    }
    return response.items;
  });
}

function handleItems(result) {
  result.items.forEach(function (entity, index) {
    item = {
      title: entity.title,
      artist: entity.author,
      link: entity.link,
      mp3: entity.enclosure.link,
      content: entity.description,
      categories: entity.categories.join(',')
    };

    if (item.mp3 && (!config.whitelistCategories || intersection(item.categories, config.whitelistCategories))) {
      playlist.push(item);
    }

    // if (remotePageSupplied && item.link.indexOf(remotePage) > -1) {
    //   remoteIndex = index;
    // }
  });
}

function finalizePlaylist() {
  var currentDate = new Date();
  var def = currentDate.getTime() - startDate.getTime();
  var to = 6000 - def;
  setTimeout(function () {
    loadPlaylist(playlist);
    if (remotePageSupplied) {
      $(window).trigger('hashchange');
    }
  }, to);
}

function fetchResult(result) {
  getItems().
    then(handleItems).
    then(finalizePlaylist);
}

function loadPlaylist(playlist) {
  myPlaylist = new jPlayerPlaylist({
      jPlayer: "#jquery_jplayer_N",
      cssSelectorAncestor: "#jp_container_N"
    },
    playlist, {
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
            setTimeout(scrollToTrack, 1000);
          } else {
            scrollToTrack();
          }

          redirect(myPlaylist.playlist[myPlaylist.current].link);
          $('#menu-trigger-mobile').removeAttr('checked');
        }
      },
      ready: function (e) {
        if (remoteIndex > -1) {
          myPlaylist.play(remoteIndex);
        } else {
          redirect(remoteBaseUrl + remotePage, true);
        }
      }
    }
  );

  $('#page').on('click', 'a[href*="' + remoteBaseUrl + '"][href$=".mp3"]', function () {
    var elem = $(this),
      founded = false,
      link = elem.attr('href'),
      track = $.each(playlist, function (index, item) {
        founded = item.mp3 == link;
        if (founded) {
          myPlaylist.play(index);
        }

        return !founded;
      });

    return founded;
  });

  $('#page').on('click', 'a[href^="' + remoteBaseUrl + '"]:not(.skip)', function () {
    redirect($(this).attr('href'));
    return false;
  });
}

function cleanHtml(data) {
  return $('<textarea />').html($('<div />').text(data.replace(/\n/g, '').replace(/\t/g, '')).html().replace(/&nbsp;&nbsp;/g, '')).text();
}

function getPage(link, stayLocation, callback) {
  var page = $('#content-wrapper');
  page.html(loader);

  $.post('http://podcasts.smydesign.co.il/proxy.php', {url: link}, function (data) {
    var response = cleanHtml(data),
        title = /<title>(.*)<\/title>/.exec(response)[1],
        body = $(/<body(.*)>(.*)<\/body>/.exec(response.replace(/\n/g, ''))[0]);

    var content = config.getContent(body);
    if (!stayLocation) {
      document.title = title;

      ga('send', {
        'hitType': 'pageview',
        'page': getPath(),
        'title': title
      });
    }
    page.html(content);

    config.getPageCallback(page);

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
  var path = $('<a />', {
    href: link
  })[0].pathname;
  location.hash = path;
}

function getPath() {
  return location.hash.replace('#', '');
}

function playTrack() {
  var localUrl = getPath();
  var trackIndex = -1;
  $.each(playlist, function (index, t) {
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
$(function () {
  loader = $('#loader').clone();
  const cbs = $('input[type="checkbox"]').on('change', function() {
    cbs.not(this).prop('checked', false);
  });

  $('a[href="about.php"]').on('click', function() {
    dataLayer.push({'event': 'about'});
  });
});

$(window).bind('hashchange', function (e) {
  getPage(remoteBaseUrl + getPath());
  playTrack();
});