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
				$.each(this.panels, function(index, element) {
					var $panel = element.$panel;

					if (typeof $panel.attr('data-loaded') === 'undefined') {
						$panel.attr('data-loaded', true);

						$panel.find('img').each(function() {
							var image = $(this);
							that._loadRetinaImage(image, element);
						});
					}
				});
			}
		},

		_isRetina: function() {
			if (window.devicePixelRatio >= 2)
				return true;

			if (window.matchMedia && (window.matchMedia("(-webkit-min-device-pixel-ratio: 2),(min-resolution: 192dpi)").matches))
				return true;

			return false;
		},

		_loadRetinaImage: function(image, panel) {
			var retinaFound = false,
				newImagePath = '';

			// check if there is a retina image specified
			if (typeof image.attr('data-retina') !== 'undefined') {
				retinaFound = true;

				newImagePath = image.attr('data-retina');
				image.removeAttr('data-retina');
			}

			// check if there is a lazy loaded, non-retina, image specified
			if (typeof image.attr('data-src') !== 'undefined') {
				if (retinaFound === false)
					newImagePath = image.attr('data-src');

				image.removeAttr('data-src');
			}

			// replace the image
			if (newImagePath !== '') {
				// create a new image element
				var newImage = new Image();

				// copy the attributes from the current image to the newly created image
				for (var i = 0, atts = image[0].attributes; i < atts.length; i++) {
					$(newImage).attr(atts.item(i).nodeName, atts.item(i).nodeValue);
				}

				// add the new image in the same container and remove the older image
				$(newImage).insertAfter(image);
				image.remove();

				// assign the source of the image
				$(newImage).attr('src', newImagePath);

				// get the size of the panel, after the new image was added, and 
				// if there aren't loading images, trigger the 'imagesComplete' event
				var newSize = panel.getContentSize();
				if (newSize != 'loading') {
					panel.trigger({type: 'imagesComplete.' + NS, index: panel.getIndex(), contentSize: newSize});
				}
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