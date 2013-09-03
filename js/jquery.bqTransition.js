/*
	bqTransition - jQuery plugin
*/
(function(window, $) {

	/*
		Handles object animation by using CSS3 transitions where supported and jQuery animations otherwise
	*/
	$.bqTransition = {
		// indicates whether the plugin was initiated
		initiated: false,

		/*
			Check if the browser supports CSS3 transitions
		*/
		init: function() {

			// check if 2D and 3D transforms are supported
			// inspired by Modernizr
			var div = document.createElement('div');

			// check if 2D transforms are supported
			this.useTransforms = typeof div.style['-webkit-transform'] !== 'undefined' || typeof div.style['transform'] !== 'undefined';

			// check if 3D transforms are supported
			this.use3DTransforms = typeof div.style['WebkitPerspective'] !== 'undefined' || typeof div.style['perspective'] !== 'undefined';

			// additional checks for Webkit
			if (this.use3DTransforms && typeof div.style['WebkitPerspective'] !== 'undefined') {
				var style = document.createElement('style');
				style.textContent = '@media (transform-3d),(-webkit-transform-3d){#test-3d{left:9px;position:absolute;height:5px;margin:0;padding:0;border:0;}}';
				document.getElementsByTagName('head')[0].appendChild(style);

				div.id = 'test-3d';
				document.body.appendChild(div);
				this.use3DTransforms = div.offsetLeft === 9 && div.offsetHeight === 5;

				style.parentNode.removeChild(style);
				div.parentNode.removeChild(div);
			}
		},

		animate: function(element, properties) {
			if (this.initiated === false) {
				this.initiated = true;
				this.init();
			}

			if (this.useTransforms) {
				properties.use3DTransforms = this.use3DTransforms;
				return this._animateUsingTranslate(element, properties);
			} else {
				return this._animateUsingJavaScript(element, properties);
			}
		},

		_animateUsingTranslate: function(element, properties) {
			var css = {},
				x = 0,
				y = 0,
				transition;

			if (typeof properties.x !== 'undefined')
				x = properties.x;

			if (typeof properties.y !== 'undefined')
				y = properties.y;

			if (typeof properties.use3DTransforms !== 'undefined' && properties.use3DTransforms === true)
				css.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
			else
				css.transform = 'translate(' + x + 'px, ' + y + 'px)';

			if (typeof properties.width !== 'undefined')
				css.width = properties.width;

			if (typeof properties.height !== 'undefined')
				css.height = properties.height;

			if (typeof properties.duration === 'undefined')
				transition = 'none';
			else
				transition = 'all ' + properties.duration / 1000 + 's';

			if (typeof properties.easing !== 'undefined')
				transition += ' ' + properties.easing;

			if (typeof properties.delay !== 'undefined')
				transition += ' ' + properties.delay / 1000 + 's';

			if (typeof properties.callback !== 'undefined')
				element.on('transitionend webkitTransitionEnd oTransitionEnd msTransitionEnd', function() {
					element.off('transitionend webkitTransitionEnd oTransitionEnd msTransitionEnd');
					properties.callback();
				});

			css.transition = transition;

			return element.css(css);
		},

		_animateUsingJavaScript: function(element, properties) {
			var css = {};

			if (typeof properties.x !== 'undefined')
				css.left = properties.x;

			if (typeof properties.y !== 'undefined')
				css.top = properties.y;

			if (typeof properties.width !== 'undefined')
				css.width = properties.width;

			if (typeof properties.height !== 'undefined')
				css.height = properties.height;

			if (typeof properties.duration === 'undefined') {
				return element.css(css);
			} else {
				if (typeof properties.delay !== 'undefined')
					element.delay(properties.delay);

				return element.animate(css, properties.duration, properties.easing);
			}
		}
	};

	/*
		bqTransition plugin adds animations that support CSS3 transitions
	*/
	$.fn.bqTransition = function(options) {
		return this.each(function() {
			$.bqTransition.animate($(this), options);
		});
	};

})(window, jQuery);