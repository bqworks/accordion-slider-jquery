/*
	Layers module for Accordion Slider

	Adds support for animated and static layers.
*/
;(function(window, $) {

	"use strict";
	
	var NS = $.AccordionSlider.namespace,

		// detect the current browser name and version
		userAgent = window.navigator.userAgent.toLowerCase(),
		rmsie = /(msie) ([\w.]+)/,
		browserDetect = rmsie.exec(userAgent) || [],
		browserName = browserDetect[1],
		browserVersion = browserDetect[2];

	var Layers = {

		initLayers: function() {
			
			// holds references to the layers
			this.layers = [];

			// reference to the panel object
			var that = this;

			// iterate through the panel's layer jQuery objects
			// and create Layer instances for each object
			this.$panel.find('.as-layer').each(function() {
				var layer = new Layer($(this));

				that.layers.push(layer);
			});

			// check the index pf the panel against the index of the selected/opened panel
			if (this.index === this.accordion.getCurrentIndex())
				this._handleLayersInOpenedState();
			else
				this._handleLayersInClosedState();

			// listen when a panel is opened and when the panels are closed, and handle 
			// the layer's behaviour based on the state of the panel
			this.accordion.on('panelOpen.Layers.' + this.panelNS, function(event) {
				if (that.index === event.index)
					that._handleLayersInOpenedState();

				if (that.index === event.previousIndex)
					that._handleLayersInClosedState();
			});

			this.accordion.on('panelsClose.Layers.' + this.panelNS, function(event) {
				if (that.index === event.previousIndex)
					that._handleLayersInClosedState();
			});
		},

		_handleLayersInOpenedState: function() {
			// show 'opened' layers and close 'closed' layers
			$.each(this.layers, function(index, layer) {
				if (layer.visibleOn == 'opened')
					layer.show();

				if (layer.visibleOn == 'closed')
					layer.hide();
			});
		},

		_handleLayersInClosedState: function() {
			// hide 'opened' layers and show 'closed' layers
			$.each(this.layers, function(index, layer) {
				if (layer.visibleOn == 'opened')
					layer.hide();

				if (layer.visibleOn == 'closed')
					layer.show();
			});
		},

		destroyLayers: function() {
			this.accordion.off('panelOpen.Layers.' + this.panelNS);
			this.accordion.off('panelsClose.Layers.' + this.panelNS);

			$.each(this.layers, function(index, layer) {
				layer.destroy();
			});
		}
	};

	$.AccordionSlider.addModule('Layers', Layers, 'panel');

	var Layer = function(layer) {

		// reference to the layer jQuery object
		this.$layer = layer;

		// indicates when will the layer be visible
		// can be visible when the panel is opened, when the panel is closed or always
		this.visibleOn = 'n/a';

		// indicates whether a layer is currently visible (or hidden)
		this.isVisible = false;

		// indicates whether the layer was styled
		this.styled = false;

		this._init();
	};

	Layer.prototype = {

		_init: function() {
			// hide the layer by default
			this.$layer.css('visibility', 'hidden');

			if (this.$layer.hasClass('as-always')) {
				this.visibleOn = 'always';
				this.show();
			} else if (this.$layer.hasClass('as-opened')) {
				this.visibleOn = 'opened';
			} else if (this.$layer.hasClass('as-closed')) {
				this.visibleOn = 'closed';
			}
		},

		/*
			Set the size and position of the layer
		*/
		_setStyle: function() {
			this.styled = true;

			// get the data attributes specified in HTML
			this.data = this.$layer.data();
				
			if (typeof this.data.width !== 'undefined')
				this.$layer.css('width', this.data.width);
			
			if (typeof this.data.height !== 'undefined')
				this.$layer.css('height', this.data.height);

			if (typeof this.data.depth !== 'undefined')
				this.$layer.css('z-index', this.data.depth);

			this.position = this.data.position ? (this.data.position).toLowerCase() : 'topleft';
			this.horizontalPosition = this.position.indexOf('right') != -1 ? 'right' : 'left';
			this.verticalPosition = this.position.indexOf('bottom') != -1 ? 'bottom' : 'top';

			// set the horizontal position of the layer based on the data set
			if (typeof this.data.horizontal !== 'undefined') {
				if ((this.data.horizontal == 'left' && this.horizontalPosition == 'left') || (this.data.horizontal == 'right' && this.horizontalPosition == 'right')) {
					this.$layer.css(this.horizontalPosition, 0);
				} else if ((this.data.horizontal == 'right' && this.horizontalPosition == 'left') || (this.data.horizontal == 'left' && this.horizontalPosition == 'right')) {
					this.$layer.css('margin-' + this.horizontalPosition, - this.$layer.outerWidth(false));
					this.$layer.css(this.horizontalPosition, '100%');
				} else if (this.data.horizontal == 'center') {
					this.$layer.css('margin-' + this.horizontalPosition, - this.$layer.outerWidth(false) * 0.5);
					this.$layer.css(this.horizontalPosition, '50%');
				} else {
					this.$layer.css(this.horizontalPosition, this.data.horizontal);
				}
			} else {
				this.$layer.css(this.horizontalPosition, 0);
			}

			// set the vetical position of the layer based on the data set
			if (typeof this.data.vertical !== 'undefined') {
				if ((this.data.vertical == 'top' && this.verticalPosition == 'top') || (this.data.vertical == 'bottom' && this.verticalPosition == 'bottom')) {
					this.$layer.css(this.verticalPosition, 0);
				} else if ((this.data.vertical == 'bottom' && this.verticalPosition == 'top') || (this.data.vertical == 'top' && this.verticalPosition == 'bottom')) {
					this.$layer.css('margin-' + this.verticalPosition, - this.$layer.outerHeight(false));
					this.$layer.css(this.verticalPosition, '100%');
				} else if (this.data.vertical == 'center') {
					this.$layer.css('margin-' + this.verticalPosition, - this.$layer.outerHeight(false) * 0.5);
					this.$layer.css(this.verticalPosition, '50%');
				} else {
					this.$layer.css(this.verticalPosition, this.data.vertical);
				}
			} else {
				this.$layer.css(this.verticalPosition, 0);
			}
		},

		/*
			Show the layer
		*/
		show: function() {
			if (this.isVisible === true)
				return;

			this.isVisible = true;

			if (this.styled === false)
				this._setStyle();

			// get the initial left and top margins
			var that = this,
				start = {},
				target = {};
			
			target.opacity = 1;
			start.opacity = 0;

			if (typeof this.data.showTransition !== 'undefined') {
				var offset = typeof this.data.showOffset !== 'undefined' ? this.data.showOffset : 50,
					targetVertical = parseInt(this.$layer.css(this.horizontalPosition), 10),
					targetHorizontal = parseInt(this.$layer.css(this.verticalPosition), 10);

				target[this.horizontalPosition] = targetVertical;
				target[this.verticalPosition] = targetHorizontal;

				if (this.data.showTransition == 'left') {
					start[this.horizontalPosition] = targetVertical + (this.horizontalPosition == 'left' ? offset : -offset);
				} else if (this.data.showTransition == 'right') {
					start[this.horizontalPosition] = targetVertical + (this.horizontalPosition == 'left' ? -offset : offset);
				} else if (this.data.showTransition == 'up') {
					start[this.verticalPosition] = targetHorizontal + (this.verticalPosition == 'top' ? offset : -offset);
				} else if (this.data.showTransition == 'down') {
					start[this.verticalPosition] = targetHorizontal + (this.verticalPosition == 'top' ? -offset : offset);
				}
			}

			// animate the layers only for modern browsers
			// for IE7 and below make the layers visible instantly
			if (browserName == 'msie' && parseInt(browserVersion, 10) <= 8) {
				this.$layer.css('visibility', 'visible')
					.css(target);
			} else {
				this.$layer.stop()
					.delay(this.data.showDelay)
					.css(start)
					.css('visibility', 'visible')
					.animate(target, this.data.showDuration, this.data.showEasing, function() {
						// reset the horizontal position of the layer based on the data set
						if (typeof that.data.horizontal !== 'undefined') {
							if ((that.data.horizontal == 'left' && that.horizontalPosition == 'left') || (that.data.horizontal == 'right' && that.horizontalPosition == 'right')) {
								that.$layer.css(that.horizontalPosition, 0);
							} else if ((that.data.horizontal == 'right' && that.horizontalPosition == 'left') || (that.data.horizontal == 'left' && that.horizontalPosition == 'right')) {
								that.$layer.css('margin-' + that.horizontalPosition, - that.$layer.outerWidth(false));
								that.$layer.css(that.horizontalPosition, '100%');
							} else if (that.data.horizontal == 'center') {
								that.$layer.css('margin-' + that.horizontalPosition, - that.$layer.outerWidth(false) * 0.5);
								that.$layer.css(that.horizontalPosition, '50%');
							} else {
								that.$layer.css(that.horizontalPosition, that.data.horizontal);
							}
						}

						// reset the vetical position of the layer based on the data set
						if (typeof that.data.vertical !== 'undefined') {
							if ((that.data.vertical == 'top' && that.verticalPosition == 'top') || (that.data.vertical == 'bottom' && that.verticalPosition == 'bottom')) {
								that.$layer.css(that.verticalPosition, 0);
							} else if ((that.data.vertical == 'bottom' && that.verticalPosition == 'top') || (that.data.vertical == 'top' && that.verticalPosition == 'bottom')) {
								that.$layer.css('margin-' + that.verticalPosition, - that.$layer.outerHeight(false));
								that.$layer.css(that.verticalPosition, '100%');
							} else if (that.data.vertical == 'center') {
								that.$layer.css('margin-' + that.verticalPosition, - that.$layer.outerHeight(false) * 0.5);
								that.$layer.css(that.verticalPosition, '50%');
							} else {
								that.$layer.css(that.verticalPosition, that.data.vertical);
							}
						}
					});
			}
		},

		/*
			Hide the layer
		*/
		hide: function() {
			if (this.isVisible === false)
				return;

			this.isVisible = false;

			var that = this,
				start = {},
				target = {};
			
			start.opacity = 1;
			target.opacity = 0;

			if (typeof this.data.hideTransition !== 'undefined') {
				var offset = typeof this.data.hideOffset !== 'undefined' ? this.data.hideOffset : 50,
					startVertical = parseInt(this.$layer.css(this.horizontalPosition), 10),
					startHorizontal = parseInt(this.$layer.css(this.verticalPosition), 10);

				if (this.data.hideTransition == 'left') {
					target[this.horizontalPosition] = startVertical - (this.horizontalPosition == 'left' ? offset : -offset);
				} else if (this.data.hideTransition == 'right') {
					target[this.horizontalPosition] = startVertical - (this.horizontalPosition == 'left' ? -offset : offset);
				} else if (this.data.hideTransition == 'up') {
					target[this.verticalPosition] = startHorizontal - (this.verticalPosition == 'top' ? offset : -offset);
				} else if (this.data.hideTransition == 'down') {
					target[this.verticalPosition] = startHorizontal - (this.verticalPosition == 'top' ? -offset : offset);
				}
			}

			// animate the layers only for modern browsers
			// for IE7 and below make the layers invisible instantly
			if (browserName == 'msie' && parseInt(browserVersion, 10) <= 7) {
				this.$layer.css('visibility', 'hidden')
					.css(target);
			} else {
				this.$layer.stop()
					.delay(this.data.hideDelay)
					.css(start)
					.animate(target, this.data.hideDuration, this.data.hideEasing, function() {
						that.$layer.css('visibility', 'visible');

						// reset the horizontal position of the layer based on the data set
						if (typeof that.data.horizontal !== 'undefined') {
							if ((that.data.horizontal == 'left' && that.horizontalPosition == 'left') || (that.data.horizontal == 'right' && that.horizontalPosition == 'right')) {
								that.$layer.css(that.horizontalPosition, 0);
							} else if ((that.data.horizontal == 'right' && that.horizontalPosition == 'left') || (that.data.horizontal == 'left' && that.horizontalPosition == 'right')) {
								that.$layer.css('margin-' + that.horizontalPosition, - that.$layer.outerWidth(false));
								that.$layer.css(that.horizontalPosition, '100%');
							} else if (that.data.horizontal == 'center') {
								that.$layer.css('margin-' + that.horizontalPosition, - that.$layer.outerWidth(false) * 0.5);
								that.$layer.css(that.horizontalPosition, '50%');
							} else {
								that.$layer.css(that.horizontalPosition, that.data.horizontal);
							}
						}

						// reset the vetical position of the layer based on the data set
						if (typeof that.data.vertical !== 'undefined') {
							if ((that.data.vertical == 'top' && that.verticalPosition == 'top') || (that.data.vertical == 'bottom' && that.verticalPosition == 'bottom')) {
								that.$layer.css(that.verticalPosition, 0);
							} else if ((that.data.vertical == 'bottom' && that.verticalPosition == 'top') || (that.data.vertical == 'top' && that.verticalPosition == 'bottom')) {
								that.$layer.css('margin-' + that.verticalPosition, - that.$layer.outerHeight(false));
								that.$layer.css(that.verticalPosition, '100%');
							} else if (that.data.vertical == 'center') {
								that.$layer.css('margin-' + that.verticalPosition, - that.$layer.outerHeight(false) * 0.5);
								that.$layer.css(that.verticalPosition, '50%');
							} else {
								that.$layer.css(that.verticalPosition, that.data.vertical);
							}
						}
					});
			}
		},

		destroy: function() {
			this.$layer.attr('style', '');
		}
	};
	
})(window, jQuery);