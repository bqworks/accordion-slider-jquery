/*
	Retina module for Accordion Slider

	Checks if a high resolution image was specified and replaces the default image with the high DPI one
*/
;(function(window, $) {

	"use strict";
	
	var NS = $.AccordionSlider.namespace;

	var Retina = {

		initRetina: function() {
			var that = this;

			$.extend(this.settings, this.retinaDefaults, this.options);

			// check if retina is enabled and the current display supports high DPI
			if (this.settings.retina === false || this._isRetina() === false)
				return;

			// check if the Lazy Loading module is enabled and overwrite its loading method
			// if not, check all images from the accordion
			if (typeof this._loadImage !== 'undefined') {
				this._loadImage = this._loadRetinaImage;
			} else {
				this.$accordion.find('img').each(function() {
					var image = $(this);
					that._loadRetinaImage(image);
				});
			}
		},

		_isRetina: function() {
			if (window.devicePixelRatio > 1.5)
				return true;

			if (window.matchMedia && (window.matchMedia("(-webkit-min-device-pixel-ratio: 2),(min-resolution: 192dpi)").matches))
				return true;

			return false;
		},

		_loadRetinaImage: function(image) {
			var retinaFound = false;

			// check if there is a retina image specified
			if (typeof image.attr('data-retina') !== 'undefined') {
				retinaFound = true;

				image.attr('src', image.attr('data-retina'));
				image.removeAttr('data-retina');
			}

			// check if there is a lazy loaded, non-retina, image specified
			if (typeof image.attr('data-src') !== 'undefined') {
				if (retinaFound === false)
					image.attr('src', image.attr('data-src'));

				image.removeAttr('data-src');
			}
		},

		destroyRetina: function() {

		},

		retinaDefaults : {
			retina: true
		}
	};

	$.AccordionSlider.addModule('Retina', Retina, 'accordion');
	
})(window, jQuery);