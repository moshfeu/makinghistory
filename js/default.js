var config = {
	remoteBaseURL: 'https://www.ranlevi.com',
	feedURL: 'http://www.ranlevi.com/feed/podcast/?' + Date.now(),
	//whitelistCategories: ['תוכניות'],
	getContent: function(response) {
		var doc = response.filter('#wrapper');
		return doc.find('.content article .post-inner').first()[0].outerHTML;
	},
	getPageCallback: function(page) {
		page.find('#respond,.wp-audio-shortcode, h3:contains(יצירות אשר הושמעו בפרק), p:has(iframe),.wonderpluginaudio').remove();
	    page.find('a[href*="pod.icast.co.il"]').attr('download', document.title + '.mp3').attr('target', '_blank');
	    page.find('.comments-area a').each(function () {
	      var elem = $(this);
	      elem.addClass('skip').attr('target', '_blank');

	      if (elem.attr('href').indexOf('http://') == -1) {
	        elem.attr('href', function (index, href) {
	          return remoteBaseUrl + href;
	        });
	      }
	    });
	}
};