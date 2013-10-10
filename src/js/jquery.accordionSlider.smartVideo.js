/*
	Smart Video module for Accordion Slider

	Adds automatic handling for several video players and providers
*/
;(function(window, $) {

	"use strict";

	var NS = $.AccordionSlider.namespace,

		// detect the current browser name and version
		userAgent = window.navigator.userAgent.toLowerCase();
	
	var SmartVideo = {

		initSmartVideo: function() {

			$.extend(this.settings, this.smartVideoDefaults, this.options);

			// check if the device uses iOS
			var isIOS = (userAgent.match(/ipad/i) !== null) ||
						(userAgent.match(/ipod/i) !== null) ||
						(userAgent.match(/iphone/i) !== null);

			// find all HTML5 videos from the accordion
			this.$accordion.find('video').each(function() {
				var video = $(this);

				// recreate the video element for iOS devices (workaround for WebKit bug,
				// which breaks videos if they are moved inside the DOM)
				if (isIOS) {
					var videoParent = video.parent(),
						videoString = video[0].outerHTML;

					video.remove();
					videoParent.html(videoString);
					video = videoParent.find('video');
					video[0].load();
				}

				// instantiate VideoJS videos
				if (typeof videojs !== 'undefined' && video.hasClass('video-js')) {
					videojs(video.attr('id'), video.data('video'));
				}
					
				// load sublime API
				if (typeof sublime === 'object' && video.hasClass('sublime-video')) {
					video.addClass('sublime');
					sublime.load();
				}
			});

			this._setupVideos();
		},

		_setupVideos: function() {
			var that = this;

			// find all video elements from the accordion, instantiate the SmartVideo for each of the video,
			// and trigger the set actions for the videos' events
			this.$accordion.find('.as-video').each(function() {
				var video = $(this);

				video.smartVideo();

				video.on('play.SmartVideo', function() {
					if (that.settings.playVideoAction == 'stopAutoplay' && typeof that.stopAutoplay !== 'undefined') {
						that.stopAutoplay();
						that.settings.autoplay = false;
					}

					var eventObject = {type: 'videoPlay', video: video};
					that.trigger(eventObject);
					if ($.isFunction(that.settings.videoPlay))
						that.settings.videoPlay.call(that, eventObject);
				});

				video.on('pause.SmartVideo', function() {
					if (that.settings.pauseVideoAction == 'startAutoplay' && typeof that.startAutoplay !== 'undefined') {
						that.startAutoplay();
						that.settings.autoplay = true;
					}

					var eventObject = {type: 'videoPause', video: video};
					that.trigger(eventObject);
					if ($.isFunction(that.settings.videoPause))
						that.settings.videoPause.call(that, eventObject);
				});

				video.on('end.SmartVideo', function() {
					if (that.settings.endVideoAction == 'startAutoplay' && typeof that.startAutoplay !== 'undefined') {
						that.startAutoplay();
						that.settings.autoplay = true;
					} else if (that.settings.endVideoAction == 'nextPanel') {
						that.nextPanel();
					} else if (that.settings.endVideoAction == 'replayVideo') {
						video.smartVideo('replay');
					}

					var eventObject = {type: 'videoEnd', video: video};
					that.trigger(eventObject);
					if ($.isFunction(that.settings.videoEnd))
						that.settings.videoEnd.call(that, eventObject);
				});
			});
			
			// when a panel opens, check to see if there are video actions associated 
			// with the opening an closing of individual panels
			this.on('panelOpen.SmartVideo.' + NS, function(event) {
				// handle the video from the closed panel
				if (event.previousIndex != -1 && that.$panelsContainer.find('.as-panel').eq(event.previousIndex).find('.as-video').length !== 0) {
					var previousVideo = that.$panelsContainer.find('.as-panel').eq(event.previousIndex).find('.as-video');

					if (that.settings.closePanelVideoAction == 'stopVideo')
						previousVideo.smartVideo('stop');
					else if (that.settings.closePanelVideoAction == 'pauseVideo')
						previousVideo.smartVideo('pause');
				}

				// handle the video from the opened panel
				if (that.$panelsContainer.find('.as-panel').eq(event.index).find('.as-video').length !== 0) {
					var currentVideo = that.$panelsContainer.find('.as-panel').eq(event.index).find('.as-video');

					if (that.settings.openPanelVideoAction == 'playVideo')
						currentVideo.smartVideo('play');
				}
			});

			// when all panels close, check to see if there is a video in the 
			// previously opened panel and handle it
			this.on('panelsClose.SmartVideo.' + NS, function(event) {
				// handle the video from the closed panel
				if (event.previousIndex != -1 && that.$panelsContainer.find('.as-panel').eq(event.previousIndex).find('.as-video').length !== 0) {
					var previousVideo = that.$panelsContainer.find('.as-panel').eq(event.previousIndex).find('.as-video');

					if (that.settings.closePanelVideoAction == 'stopVideo')
						previousVideo.smartVideo('stop');
					else if (that.settings.closePanelVideoAction == 'pauseVideo')
						previousVideo.smartVideo('pause');
				}
			});
		},

		destroySmartVideo: function() {
			this.$accordion.find('.as-video').each(function() {
				var video = $(this);

				video.off('SmartVideo');
				$(this).smartVideo('destroy');
			});

			this.off('panelOpen.SmartVideo.' + NS);
			this.off('panelsClose.SmartVideo.' + NS);
		},

		smartVideoDefaults: {
			openPanelVideoAction: 'playVideo',
			closePanelVideoAction: 'pauseVideo',
			playVideoAction: 'stopAutoplay',
			pauseVideoAction: 'none',
			endVideoAction: 'startAutoplay',
			videoPlay: function() {},
			videoPause: function() {},
			videoEnd: function() {}
		}
	};

	$.AccordionSlider.addModule('SmartVideo', SmartVideo, 'accordion');
	
})(window, jQuery);