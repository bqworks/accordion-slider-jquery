/*
	JSON module for Accordion Slider

	Creates the panels based on JSON data
*/
;(function(window, $) {

	"use strict";
	
	var NS = $.AccordionSlider.namespace;

	var JSON = {

		JSONDataAttributesMap : {
			'width': 'data-width',
			'height': 'data-height',
			'depth': 'data-depth',
			'position': 'data-position',
			'horizontal': 'data-horizontal',
			'vertical': 'data-vertical',
			'showTransition': 'data-show-transition',
			'showOffset': 'data-show-offset',
			'showDelay': 'data-show-delay',
			'showDuration': 'data-show-duration',
			'showEasing': 'data-show-easing',
			'hideTransition': 'data-hide-transition',
			'hideOffset': 'data-',
			'hideDelay': 'data-hide-delay',
			'hideDuration': 'data-hide-duration',
			'hideEasing': 'data-hide-easing'
		},

		initJSON: function() {
			$.extend(this.settings, this.JSONDefaults, this.options);

			if (this.settings.JSONSource !== null)
				this.updateJSON();
		},

		updateJSON: function() {
			var that = this;

			// clear existing content and data
			this.removePanels();
			this.$accordion.empty();
			this.off('JSONReady.' + NS);

			// create the main containers
			that.$maskContainer = $('<div class="as-mask"></div>').appendTo(that.$accordion);
			that.$panelsContainer = $('<div class="as-panels"></div>').appendTo(that.$maskContainer);

			// parse the JSON data and construct the panels
			this.on('JSONReady.' + NS, function(event) {
				var jsonData = event.jsonData,
					panels = jsonData.accordion.panels;

				$.each(panels, function(index, value) {
					var panel = value,
						backgroundLink,
						backgroundOpenedLink;

					// create the panel element
					var panelElement = $('<div class="as-panel"></div>').appendTo(that.$panelsContainer);

					// create the background image and link
					if (typeof panel.backgroundLink !== 'undefined') {
						backgroundLink = $('<a href="' + panel.backgroundLink.address + '"></a>');

						$.each(panel.backgroundLink, function(name, value) {
							if (name != 'address')
								backgroundLink.attr(name, value);
						});

						backgroundLink.appendTo(panelElement);
					}

					if (typeof panel.background !== 'undefined') {
						var background = $('<img class="as-background" src="' + panel.background.source + '"/>');

						$.each(panel.background, function(name, value) {
							if (name != 'source')
								background.attr(name, value);
						});

						background.appendTo(typeof backgroundLink !== 'undefined' ? backgroundLink : panelElement);
					}

					// create the background image and link for the opened state of the panel
					if (typeof panel.backgroundOpenedLink !== 'undefined') {
						backgroundOpenedLink = $('<a href="' + panel.backgroundOpenedLink.address + '"></a>');

						$.each(panel.backgroundOpenedLink, function(name, value) {
							if (name != 'address')
								backgroundOpenedLink.attr(name, value);
						});

						backgroundOpenedLink.appendTo(panelElement);
					}

					if (typeof panel.backgroundOpened !== 'undefined') {
						var backgroundOpened = $('<img class="as-background-opened" src="' + panel.backgroundOpened.source + '"/>');

						$.each(panel.backgroundOpened, function(name, value) {
							if (name != 'source')
								backgroundOpened.attr(name, value);
						});

						backgroundOpened.appendTo(typeof backgroundOpenedLink !== 'undefined' ? backgroundOpenedLink : panelElement);
					}

					// parse the layer(s)
					if (typeof panel.layers !== 'undefined')
						$.each(panel.layers, function(index, value) {
							var layer = value,
								classes = '',
								dataAttributes = '';

							// parse the data specified for the layer and extract the classes and data attributes
							$.each(layer, function(name, value) {
								if (name == 'style') {
									var classList = value.split(' ');
									
									$.each(classList, function(classIndex, className) {
										classes += ' as-' + className;
									});
								} else if (name !== 'content'){
									dataAttributes += ' ' + that.JSONDataAttributesMap[name] + '="' + value + '"';
								}
							});

							// create the layer element
							$('<div class="as-layer' + classes + '"' + dataAttributes + '">' + layer.content + '</div>').appendTo(panelElement);
						});
				});

				that.update();
			});

			this._loadJSON();
		},

		_loadJSON: function() {
			var that = this;

			if (this.settings.JSONSource.slice(-5) == '.json') {
				$.getJSON(this.settings.JSONSource, function(result) {
					that.trigger({type: 'JSONReady.' + NS, jsonData: result});
				});
			} else {
				var jsonData = $.parseJSON(this.settings.JSONSource);
				that.trigger({type: 'JSONReady.' + NS, jsonData: jsonData});
			}
		},

		destroyJSON: function() {
			this.off('JSONReady.' + NS);
		},

		JSONDefaults: {
			JSONSource: null
		}
	};

	$.AccordionSlider.addModule('JSON', JSON, 'accordion');
	
})(window, jQuery);