/*
	Swap Background module for Accordion Slider

	Allows a different image to be displayed as the panel's background
	when the panel is selected
*/
;(function(window, $) {

	"use strict";
	
	var NS = $.AccordionSlider.namespace;

	var SwapBackground = {

		initSwapBackground: function() {
			var that = this;

			$.extend(this.settings, this.swapBackgroundDefaults, this.options);

			this.on('panelOpen.SwapBackground.' + NS, function(event) {
				// get the currently opened panel
				var panel = that.getPanelAt(event.index),
					background = panel.$panel.find('.as-background'),
					opened = panel.$panel.find('.as-background-opened');

				// fade in the opened content
				if (opened.length !== 0) {
					opened.css({'visibility': 'visible', 'opacity': 0});
					that._fadeInBackground(opened);

					if (background.length !== 0 && that.settings.fadeOutBackground === true)
						that._fadeOutBackground(background);
				}

				if (event.previousIndex != -1) {
					// get the previously opened panel
					var previousPanel = that.getPanelAt(event.previousIndex),
						previousBackground = previousPanel.$panel.find('.as-background'),
						previousOpened = previousPanel.$panel.find('.as-background-opened');

					// fade out the opened content
					if (previousOpened.length !== 0) {
						that._fadeOutBackground(previousOpened);

						if (previousBackground.length !== 0 && that.settings.fadeOutBackground === true)
							that._fadeInBackground(previousBackground);
					}
				}
			});

			this.on('panelsClose.SwapBackground.' + NS, function(event) {
				if (event.previousIndex == -1)
					return;

				// get the previously opened panel
				var panel = that.getPanelAt(event.previousIndex),
					background = panel.$panel.find('.as-background'),
					opened = panel.$panel.find('.as-background-opened');

				// fade out the opened content
				if (opened.length !== 0) {
					that._fadeOutBackground(opened);

					if (background.length !== 0 && that.settings.fadeOutBackground === true)
						that._fadeInBackground(background);
				}
			});
		},

		_fadeInBackground: function(target) {
			target.stop().animate({'opacity': 1}, this.settings.swapBackgroundDuration);
		},

		_fadeOutBackground: function(target) {
			target.stop().animate({'opacity': 0}, this.settings.swapBackgroundDuration, function() {
				target.css({'visibility': 'hidden'});
			});
		},

		destroySwapBackground: function() {
			this.off('panelOpen.SwapBackground.' + NS);
			this.off('panelsClose.SwapBackground.' + NS);
		},

		swapBackgroundDefaults: {
			swapBackgroundDuration: 700,
			fadeOutBackground: false
		}
	};

	$.AccordionSlider.addModule('SwapBackground', SwapBackground, 'accordion');
	
})(window, jQuery);