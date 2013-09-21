(function($) {
	
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

			var players = $.SmartVideo.players;

			if (players.length === 0)
				return;

			for (var name in players) {
				if (this._getVideoType() == name && typeof players[name] !== 'undefined') {
					this.player = new players[name](this.$video);
				}
			}

			this.player.on('videoReady', function() {
				console.log('ready');
			});

			this.player.on('videoLoad', function() {
				console.log('load');
			});

			this.player.on('videoPlay', function() {
				console.log('play');
			});

			this.player.on('videoPause', function() {
				console.log('pause');
			});

			this.player.on('videoEnd', function() {
				console.log('end');
			});
		},

		_getVideoType: function(video) {
			return 'VimeoVideo';
		},
		
		play: function() {
			this.player.play();
		},
		
		stop: function() {
			this.player.stop();
		},
		
		pause: function() {
			this.player.pause();
		},

		replay: function() {
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
			videoLoad: function() {},
			videoPlay: function() {},
			videoPause: function() {},
			videoEnd: function() {}
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
			// instantiate the smart video or alter it
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

	var Video = function(video) {
		this.$video = video;
		this.player = null;
		this.ready = false;
		this.state = '';

		this._init();
	};

	Video.prototype = {
		_init: function() {},

		play: function() {},

		pause: function() {},

		stop: function() {},

		replay: function() {},

		isReady: function() {
			return this.ready;
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
							that.state = 'load';
							that.trigger({type: 'videoLoad'});
							break;
							
						case YT.PlayerState.PLAYING:
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
				that.state = 'load';
				that.trigger({type: 'videoLoad'});
			});
			
			that.player.addEvent('play', function() {
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
		this.player.api('pause');
		this.player.api('unload');
	};

	VimeoVideo.prototype.replay = function() {
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

	HTML5Video.prototype._init = function() {
		this.player = $video[0];
		this.ready = true;
		this.trigger({type: 'videoReady'});
		
		var that = this;

		this.player.addEventListener('play', function() {
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

	VideoJSVideo.prototype._init = function() {
		var that = this;

		videojs($video.attr('id')).ready(function() {
			that.player = this;
			that.ready = true;
			that.trigger({type: 'videoReady'});
			
			that.player.on('play', function() {
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

	SublimeVideo.prototype._init = function() {
		var sublimeVideoAPILoaded = window.sublimevideo && window.sublimevideo.prepare;

		if (sublimeVideoAPILoaded) {
			_handleSublimeVideo();
		} else {
			var sublimeVideoInterval = setInterval(function() {
				if (sublimevideo.prepare) {
					clearInterval(sublimeVideoInterval);
					_handleSublimeVideo();
				}
			}, 100);
		}
	};
	
	SublimeVideo.prototype._handleSublimeVideo = function() {
		that.ready = true;
		that.trigger({type: 'videoReady'});
		
		sublimevideo.onStart(function() {
			that.state = 'play';
			that.trigger({type: 'videoPlay'});
		});
		
		sublimevideo.onEnd(function() {
			that.state = 'end';
			that.trigger({type: 'videoEnd'});
		});
	};

	SublimeVideo.prototype.play = function() {
		sublimevideo.play();
	};

	SublimeVideo.prototype.pause = function() {
		sublimevideo.stop();
	};

	SublimeVideo.prototype.stop = function() {
		sublimevideo.stop();
	};

	SublimeVideo.prototype.replay = function() {
		sublimevideo.play();
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

	JWPlayerVideo.prototype._init = function() {
		var videoID = $video.find('object').length ? $video.find('object').attr('id') : $video.attr('id');
		
		this.player = jwplayer(videoID);
		
		that.ready = true;
		that.trigger({type: 'videoReady'});
		
		this.player.onBuffer(function() {
			that.state = 'load';
			that.trigger({type: 'videoLoad'});
		});
		
		this.player.onPlay(function() {
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