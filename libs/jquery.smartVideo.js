(function($) {
	
	// check if an iOS device is used
	var	userAgent = window.navigator.userAgent.toLowerCase(),
		isIOS = (userAgent.match(/ipad/i) !== null) ||
				(userAgent.match(/ipod/i) !== null) ||
				(userAgent.match(/iphone/i) !== null);

	var SmartVideo = function(instance, options) {
		this.$video = $(instance);
		this.options = options;
		this.settings = {};
		this.player = null;

		this._init();
	};

	SmartVideo.prototype = {

		_init: function() {
			
			this.settings = $.extend({}, this.defaults, this.options);

			// get the list of players
			var players = $.SmartVideo.players,
				that = this;

			if (players.length === 0)
				return;

			// check if the video element is supported by one of the players
			for (var name in players) {
				if (typeof players[name] !== 'undefined' && players[name].isType(this.$video)) {
					this.player = new players[name](this.$video);
					break;
				}
			}

			if (this.player === null)
				return;

			// add event listeners
			this.player.on('videoReady', function() {
				that.trigger({type: 'ready'});
				if ($.isFunction(that.settings.ready))
					that.settings.ready.call(that, {type: 'ready'});
			});

			this.player.on('videoStart', function() {
				that.trigger({type: 'start'});
				if ($.isFunction(that.settings.start))
					that.settings.start.call(that, {type: 'start'});
			});

			this.player.on('videoLoad', function() {
				that.trigger({type: 'loading'});
				if ($.isFunction(that.settings.loading))
					that.settings.loading.call(that, {type: 'loading'});
			});

			this.player.on('videoPlay', function() {
				that.trigger({type: 'play'});
				if ($.isFunction(that.settings.play))
					that.settings.play.call(that, {type: 'play'});
			});

			this.player.on('videoPause', function() {
				that.trigger({type: 'pause'});
				if ($.isFunction(that.settings.pause))
					that.settings.pause.call(that, {type: 'pause'});
			});

			this.player.on('videoEnd', function() {
				that.trigger({type: 'end'});
				if ($.isFunction(that.settings.end))
					that.settings.end.call(that, {type: 'end'});
			});
		},
		
		play: function() {
			if (isIOS === true && this.player.isStarted() === false)
				return;

			this.player.play();
		},
		
		stop: function() {
			if (isIOS === true && this.player.isStarted() === false)
				return;

			this.player.stop();
		},
		
		pause: function() {
			if (isIOS === true && this.player.isStarted() === false)
				return;

			this.player.pause();
		},

		replay: function() {
			if (isIOS === true && this.player.isStarted() === false)
				return;
			
			this.player.replay();
		},

		on: function(type, callback) {
			return this.$video.on(type, callback);
		},
		
		off: function(type) {
			return this.$video.off(type);
		},

		trigger: function(data) {
			return this.$video.triggerHandler(data);
		},

		defaults: {
			ready: function() {},
			start: function() {},
			loading: function() {},
			play: function() {},
			pause: function() {},
			end: function() {}
		}
	};

	$.SmartVideo = {
		players: {},

		addPlayer: function(name, player) {
			this.players[name] = player;
		}
	};
	
	$.fn.smartVideo = function(options) {
		var args = Array.prototype.slice.call(arguments, 1);

		return this.each(function() {
			// instantiate the smart video or call a function on the current instance
			if (typeof $(this).data('smartVideo') === 'undefined') {
				var newInstance = new SmartVideo(this, options);

				// store a reference to the instance created
				$(this).data('smartVideo', newInstance);
			} else if (typeof options !== 'undefined') {
				var	currentInstance = $(this).data('smartVideo');

				// check the type of argument passed
				if (typeof currentInstance[options] === 'function') {
					currentInstance[options].apply(currentInstance, args);
				} else {
					$.error(options + ' does not exist in smartVideo.');
				}
			}
		});
	};

	/*
		Base object for the video players
	*/
	var Video = function(video) {
		this.$video = video;
		this.player = null;
		this.ready = false;
		this.started = false;
		this.state = '';

		this._init();
	};

	Video.prototype = {
		_init: function() {},

		play: function() {},

		pause: function() {},

		stop: function() {},

		replay: function() {},

		isType: function() {},

		isReady: function() {
			return this.ready;
		},

		isStarted: function() {
			return this.started;
		},

		getState: function() {
			return this.state;
		},

		on: function(type, callback) {
			return this.$video.on(type, callback);
		},
		
		off: function(type) {
			return this.$video.off(type);
		},

		trigger: function(data) {
			return this.$video.triggerHandler(data);
		}
	};

	/*
		YouTube video
	*/
	var YoutubeVideo = function(video) {
		Video.call(this, video);
	};

	YoutubeVideo.prototype = new Video();
	YoutubeVideo.prototype.constructor = YoutubeVideo;
	$.SmartVideo.addPlayer('YoutubeVideo', YoutubeVideo);

	YoutubeVideo.isType = function(video) {
		if (video.is('iframe')) {
			var src = video.attr('src');

			if (src.indexOf('youtube.com') != -1 || src.indexOf('youtu.be') != -1)
				return true;
		}

		return false;
	};

	YoutubeVideo.prototype._init = function() {
		var that = this,
			youtubeAPILoaded = window.YT && window.YT.Player;

		if (typeof youtubeAPILoaded !== 'undefined') {
			this._setup();
		} else {
			var tag = document.createElement('script');
			tag.src = "http://www.youtube.com/player_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			
			window.onYouTubePlayerAPIReady = function() {
				that._setup();
			};
		}
	};
		
	YoutubeVideo.prototype._setup = function() {
		var that = this;

		this.player = new YT.Player(this.$video[0], {
			events: {
				'onReady': function() {
					that.ready = true;
					that.trigger({type: 'videoReady'});
				},
				
				'onStateChange': function(event) {
					switch (event.data) {
						case YT.PlayerState.BUFFERING:
							if (that.started === false) {
								that.started = true;
								that.trigger({type: 'videoStart'});
							}

							that.state = 'load';
							that.trigger({type: 'videoLoad'});
							break;
							
						case YT.PlayerState.PLAYING:
							if (that.started === false) {
								that.started = true;
								that.trigger({type: 'videoStart'});
							}

							that.state = 'play';
							that.trigger({type: 'videoPlay'});
							break;
						
						case YT.PlayerState.PAUSED:
							that.state = 'pause';
							that.trigger({type: 'videoPause'});
							break;
						
						case YT.PlayerState.ENDED:
							that.state = 'end';
							that.trigger({type: 'videoEnd'});
							break;
					}
				}
			}
		});
	};

	YoutubeVideo.prototype.play = function() {
		this.player.playVideo();
	};

	YoutubeVideo.prototype.pause = function() {
		this.player.pauseVideo();
	};

	YoutubeVideo.prototype.stop = function() {
		this.player.seekTo(1);
		this.player.stopVideo();
	};

	YoutubeVideo.prototype.replay = function() {
		this.player.seekTo(1);
		this.player.playVideo();
	};

	/*
		Vimeo video
	*/
	var VimeoVideo = function(video) {
		Video.call(this, video);
	};

	VimeoVideo.prototype = new Video();
	VimeoVideo.prototype.constructor = VimeoVideo;
	$.SmartVideo.addPlayer('VimeoVideo', VimeoVideo);

	VimeoVideo.isType = function(video) {
		if (video.is('iframe')) {
			var src = video.attr('src');

			if (src.indexOf('vimeo.com') != -1)
				return true;
		}

		return false;
	};

	VimeoVideo.prototype._init = function() {
		var that = this;

		if (typeof window.Froogaloop !== 'undefined') {
			this._setup();
		} else {
			var tag = document.createElement('script');
			tag.src = "http://a.vimeocdn.com/js/froogaloop2.min.js";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			
			var checkVimeoAPITimer = setInterval(function() {
				if (typeof window.Froogaloop !== 'undefined') {
					clearInterval(checkVimeoAPITimer);
					that._setup();
				}
			}, 100);
		}
	};

	VimeoVideo.prototype._setup = function() {
		var that = this;

		this.player = Froogaloop(this.$video[0]);
		
		this.player.addEvent('ready', function() {
			that.ready = true;
			that.trigger({type: 'videoReady'});
			
			that.player.addEvent('loadProgress', function() {
				if (that.started === false) {
					that.started = true;
					that.trigger({type: 'videoStart'});
				}

				that.state = 'load';
				that.trigger({type: 'videoLoad'});
			});
			
			that.player.addEvent('play', function() {
				if (that.started === false) {
					that.started = true;
					that.trigger({type: 'videoStart'});
				}

				that.state = 'play';
				that.trigger({type: 'videoPlay'});
			});
			
			that.player.addEvent('pause', function() {
				that.state = 'pause';
				that.trigger({type: 'videoPause'});
			});
			
			that.player.addEvent('finish', function() {
				that.state = 'end';
				that.trigger({type: 'videoEnd'});
			});
		});
	};

	VimeoVideo.prototype.play = function() {
		this.player.api('play');
	};

	VimeoVideo.prototype.pause = function() {
		this.player.api('pause');
	};

	VimeoVideo.prototype.stop = function() {
		this.player.api('seekTo', 0);
		this.player.api('pause');
	};

	VimeoVideo.prototype.replay = function() {
		this.player.api('seekTo', 0);
		this.player.api('play');
	};

	/*
		HTML5 video
	*/
	var HTML5Video = function(video) {
		Video.call(this, video);
	};

	HTML5Video.prototype = new Video();
	HTML5Video.prototype.constructor = HTML5Video;
	$.SmartVideo.addPlayer('HTML5Video', HTML5Video);

	HTML5Video.isType = function(video) {
		if (video.is('video') && video.hasClass('video-js') === false && video.hasClass('sublime-video') === false)
			return true;

		return false;
	};

	HTML5Video.prototype._init = function() {
		this.player = this.$video[0];
		this.ready = true;
		
		var that = this;

		this.player.addEventListener('play', function() {
			if (that.started === false) {
				that.started = true;
				that.trigger({type: 'videoStart'});
			}

			that.state = 'play';
			that.trigger({type: 'videoPlay'});
		});
		
		this.player.addEventListener('pause', function() {
			that.state = 'pause';
			that.trigger({type: 'videoPause'});
		});
		
		this.player.addEventListener('ended', function() {
			that.state = 'end';
			that.trigger({type: 'videoEnd'});
		});
	};

	HTML5Video.prototype.play = function() {
		this.player.play();
	};

	HTML5Video.prototype.pause = function() {
		this.player.pause();
	};

	HTML5Video.prototype.stop = function() {
		this.player.currentTime = 0;
		this.player.pause();
	};

	HTML5Video.prototype.replay = function() {
		this.player.currentTime = 0;
		this.player.play();
	};

	/*
		VideoJS video
	*/
	var VideoJSVideo = function(video) {
		Video.call(this, video);
	};

	VideoJSVideo.prototype = new Video();
	VideoJSVideo.prototype.constructor = VideoJSVideo;
	$.SmartVideo.addPlayer('VideoJSVideo', VideoJSVideo);

	VideoJSVideo.isType = function(video) {
		if (video.hasClass('video-js'))
			return true;

		return false;
	};

	VideoJSVideo.prototype._init = function() {
		var that = this;

		if (typeof videojs === 'undefined')
			return;

		videojs(this.$video.attr('id')).ready(function() {
			that.player = this;
			that.ready = true;

			that.player.on('play', function() {
				if (that.started === false) {
					that.started = true;
					that.trigger({type: 'videoStart'});
				}

				that.state = 'play';
				that.trigger({type: 'videoPlay'});
			});
			
			that.player.on('pause', function() {
				that.state = 'pause';
				that.trigger({type: 'videoPause'});
			});
			
			that.player.on('ended', function() {
				that.state = 'end';
				that.trigger({type: 'videoEnd'});
			});
		});
	};

	VideoJSVideo.prototype.play = function() {
		this.player.play();
	};

	VideoJSVideo.prototype.pause = function() {
		this.player.pause();
	};

	VideoJSVideo.prototype.stop = function() {
		this.player.currentTime(0);
		this.player.pause();
	};

	VideoJSVideo.prototype.replay = function() {
		this.player.currentTime(0);
		this.player.play();
	};

	/*
		Sublime video
	*/
	var SublimeVideo = function(video) {
		Video.call(this, video);
	};

	SublimeVideo.prototype = new Video();
	SublimeVideo.prototype.constructor = SublimeVideo;
	$.SmartVideo.addPlayer('SublimeVideo', SublimeVideo);

	SublimeVideo.isType = function(video) {
		if (video.hasClass('sublime-video'))
			return true;

		return false;
	};

	SublimeVideo.prototype._init = function() {
		var that = this;

		if (typeof sublime === 'undefined')
			return;

		sublime.ready(function() {
			that.ready = true;
			that.player = sublime.player(that.$video.attr('id'));

			that.player.on('play', function() {
				if (that.started === false) {
					that.started = true;
					that.trigger({type: 'videoStart'});
				}

				that.state = 'play';
				that.trigger({type: 'videoPlay'});
			});

			that.player.on('pause', function() {
				that.state = 'pause';
				that.trigger({type: 'videoPause'});
			});

			that.player.on('stop', function() {
				that.state = 'stop';
				that.trigger({type: 'videoStop'});
			});

			that.player.on('end', function() {
				that.state = 'end';
				that.trigger({type: 'videoEnd'});
			});
		});
	};

	SublimeVideo.prototype.play = function() {
		this.player.play();
	};

	SublimeVideo.prototype.pause = function() {
		this.player.pause();
	};

	SublimeVideo.prototype.stop = function() {
		this.player.stop();
	};

	SublimeVideo.prototype.replay = function() {
		this.player.stop();
		this.player.play();
	};

	/*
		JWPlayer video
	*/
	var JWPlayerVideo = function(video) {
		Video.call(this, video);
	};

	JWPlayerVideo.prototype = new Video();
	JWPlayerVideo.prototype.constructor = JWPlayerVideo;
	$.SmartVideo.addPlayer('JWPlayerVideo', JWPlayerVideo);

	JWPlayerVideo.isType = function(video) {
		if (video.hasClass('jwplayer'))
			return true;

		return false;
	};

	JWPlayerVideo.prototype._init = function() {
		var that = this,
			videoID = this.$video.find('object').length ? this.$video.find('object').attr('id') : this.$video.attr('id');

		this.player = jwplayer(videoID);

		this.ready = true;
		
		this.player.onBuffer(function() {
			if (that.started === false) {
				that.started = true;
				that.trigger({type: 'videoStart'});
			}

			that.state = 'load';
			that.trigger({type: 'videoLoad'});
		});
		
		this.player.onPlay(function() {
			if (that.started === false) {
				that.started = true;
				that.trigger({type: 'videoStart'});
			}

			that.state = 'play';
			that.trigger({type: 'videoPlay'});
		});

		this.player.onPause(function() {
			that.state = 'pause';
			that.trigger({type: 'videoPause'});
		});
		
		this.player.onComplete(function() {
			that.state = 'end';
			that.trigger({type: 'videoEnd'});
		});
	};

	JWPlayerVideo.prototype.play = function() {
		this.player.play(true);
	};

	JWPlayerVideo.prototype.pause = function() {
		this.player.pause(true);
	};

	JWPlayerVideo.prototype.stop = function() {
		this.player.seek(0);
		this.player.pause(true);
	};

	JWPlayerVideo.prototype.replay = function() {
		this.player.seek(0);
		this.player.play(true);
	};

})(jQuery);