/*
	Classic Accordion - jQuery plugin
*/
(function(window, $) {

	// namespace
	var NS = 'ClassicAccordion',

		// detect the current browser name and version
		userAgent = window.navigator.userAgent.toLowerCase(),
		rwebkit = /(webkit)[ \/]([\w.]+)/,
		rmsie = /(msie) ([\w.]+)/,
		browserDetect = rwebkit.exec(userAgent) ||
						rmsie.exec(userAgent) ||
						[],
		browserName = browserDetect[1],
		browserVersion = browserDetect[2];

	var ClassicAccordion = function(instance, options) {

		// reference to the accordion jQuery object
		this.$accordion = $(instance);

		// holds the options specified when the accordion was instantiated
		this.options = options;

		// holds the final settings of the accordion
		this.settings = $.extend({}, this.defaults, this.options);

		// the index of the currently opened panel (starts with 1)
		this.currentIndex = this.settings.startPanel;

		// the actual size, in pixels, of the opened panel
		this.computedOpenedPanelSize = 0;

		// the size, in pixels, of the collapsed panels
		this.collapsedPanelSize = 0;

		// the size, in pixels, of the closed panels
		this.closedPanelSize = 0;

		// the distance, in pixels, between the accordion's panels
		this.computedPanelDistance = this.settings.panelDistance;

		// array that contains the ClassicAccordionPanel objects
		this.panels = [];

		// timer used for delaying the opening of the panel on mouse hover
		this.mouseDelayTimer = 0;

		// init the accordion
		this._init();
	};

	ClassicAccordion.prototype = {

		/*
			The starting place for the accordion
		*/
		_init: function() {

			// create the accordion
			this.create();

			// add a class to the accordion based on the orientation
			// to be used in CSS
			if (this.settings.orientation == 'horizontal')
				this.$accordion.addClass('ca-horizontal');
			else if (this.settings.orientation == 'vertical')
				this.$accordion.addClass('ca-vertical');

			// prepare the accordion for responsiveness
			if (this.settings.responsive) {
				// if the accordion is responsive set the width to 100% and use
				// the specified width and height as a max-width and max-height
				this.$accordion.css({width: '100%', height: this.settings.height, maxWidth: this.settings.width, maxHeight: this.settings.height});

				// if an aspect ratio was not specified, set the aspect ratio
				// based on the specified width and height
				if (this.settings.aspectRatio == -1)
					this.settings.aspectRatio = this.settings.width / this.settings.height;

				var that = this;

				// resize the accordion when the browser resizes
				$(window).on('resize.' + NS, function() {
					that.resize();
				});
			} else {
				this.$accordion.css({width: this.settings.width, height: this.settings.height});
			}

			// set the initial size of the accordion
			this.resize();

			// listen for 'mouseenter' events
			this.on('mouseenter.' + NS, function(event) {
				var eventObject = {type: 'accordionMouseOver'};
				that.trigger(eventObject);
				if ($.isFunction(that.settings.accordionMouseOver))
					that.settings.accordionMouseOver.call(that, eventObject);
			});

			// listen for 'mouseleave' events
			this.on('mouseleave.' + NS, function(event) {
				// close the panels
				if (that.settings.closePanelsOnMouseOut)
					that.closePanels();

				var eventObject = {type: 'accordionMouseOut'};
				that.trigger(eventObject);
				if ($.isFunction(that.settings.accordionMouseOut))
					that.settings.accordionMouseOut.call(that, eventObject);
			});
		},

		/*
			Create the panels based on the HTML specified in the accordion
		*/
		create: function() {
			var that = this;

			this.$accordion.find('.ca-panel').each(function(index, element) {
				that._createPanel(index + 1, element);
			});
		},

		/*
			Create an individual panel
		*/
		_createPanel: function(index, element) {
			var that = this,
				$element = $(element);

			// create a panel instance and add it to the array of panels
			var panel = new ClassicAccordionPanel($element, this, index, this.settings);
			this.panels.splice(index, 0, panel);

			// listen for 'panelMouseOver' events
			panel.on('panelMouseOver.' + NS, function(event) {
				if (that.settings.openPanelOn == 'hover') {
					clearTimeout(that.mouseDelayTimer);

					// open the panel, but only after a short delay in order to prevent
					// opening panels that the user doesn't intend
					that.mouseDelayTimer = setTimeout(function() {
						that.openPanel(event.index);
					}, that.settings.mouseDelay);
				}

				var eventObject = {type: 'panelMouseOver', index: index, element: $element};
				that.trigger(eventObject);
				if ($.isFunction(that.settings.panelMouseOver))
					that.settings.panelMouseOver.call(that, eventObject);
			});

			// listen for 'panelMouseOut' events
			panel.on('panelMouseOut.' + NS, function(event) {
				var eventObject = {type: 'panelMouseOut', index: index, element: $element};
				that.trigger(eventObject);
				if ($.isFunction(that.settings.panelMouseOut))
					that.settings.panelMouseOut.call(that, eventObject);
			});

			// listen for 'panelClick' events
			panel.on('panelClick.' + NS, function(event) {
				if (that.settings.openPanelOn == 'click') {
					// open the panel if it's not already opened
					// and close the panels if the clicked panel is opened
					if (index !== this.currentIndex)
						that.openPanel(event.index);
					else
						that.closePanels();
				}

				var eventObject = {type: 'panelClick', index: index, element: $element};
				that.trigger(eventObject);
				if ($.isFunction(that.settings.panelClick))
					that.settings.panelClick.call(that, eventObject);
			});
		},

		/*
			Destroy the Classic Accordion instance
		*/
		destroy: function() {

		},

		/*
			Called when the accordion needs to resize 
		*/
		resize: function() {
			var that = this;

			// set the height of the accordion based on the aspect ratio
			if (this.settings.aspectRatio != -1)
				this.$accordion.css('height', this.$accordion.innerWidth() / this.settings.aspectRatio);

			// set the initial computedOpenedPanelSize to the value defined in the options
			this.computedOpenedPanelSize = this.settings.openedPanelSize;

			// get the total size, in pixels, of the accordion
			var totalSize = this.settings.orientation == "horizontal" ? this.$accordion.innerWidth() : this.$accordion.innerHeight();

			// parse computedOpenedPanelSize and set it to a pixel value
			if (typeof this.computedOpenedPanelSize == 'string') {
				if (this.computedOpenedPanelSize.indexOf('%') != -1) {
					this.computedOpenedPanelSize = totalSize * (parseInt(this.computedOpenedPanelSize, 10)/ 100);
				} else if (this.computedOpenedPanelSize.indexOf('px') != -1) {
					this.computedOpenedPanelSize = parseInt(this.computedOpenedPanelSize, 10);
				} else if (this.computedOpenedPanelSize == 'max') {
					this.computedOpenedPanelSize = this.getPanelAt(this.currentIndex - 1).outerWidth(true);

				}
			}

			// set the initial computedPanelDistance to the value defined in the options
			this.computedPanelDistance = this.settings.panelDistance;

			// parse computedPanelDistance and set it to a pixel value
			if (typeof this.computedPanelDistance == 'string') {
				if (this.computedPanelDistance.indexOf('%') != -1) {
					this.computedPanelDistance = totalSize * (parseInt(this.computedPanelDistance, 10)/ 100);
				} else if (this.computedPanelDistance.indexOf('px') != -1) {
					this.computedPanelDistance = parseInt(this.computedPanelDistance, 10);
				}
			}

			// set the size, in pixels, of the collapsed panels
			this.collapsedPanelSize = (totalSize - this.computedOpenedPanelSize - (this.getTotalPanels() - 1) * that.computedPanelDistance) / (this.getTotalPanels() - 1);

			// set the size, in pixels, of the closed panels
			this.closedPanelSize = (totalSize - (this.getTotalPanels() - 1) * that.computedPanelDistance) / this.getTotalPanels();

			// round the values
			this.computedOpenedPanelSize = Math.floor(this.computedOpenedPanelSize);
			this.collapsedPanelSize = Math.floor(this.collapsedPanelSize);
			this.closedPanelSize = Math.floor(this.closedPanelSize);

			// set the initial position and size of the panels
			this._transformPanels();
		},

		/*
			change the position (and size) of the panels
		*/
		_transformPanels: function(animate) {
			var that = this,
				properties = {};

			$.each(this.panels, function(index) {
				var panel = that.panels[index];

				// get the position of the panel based on the currently selected index and the panel's index
				properties.position = (that.currentIndex == -1) ? (index * (that.closedPanelSize + that.computedPanelDistance)) : (index * (that.collapsedPanelSize + that.computedPanelDistance) + (index > that.currentIndex - 1 ? that.computedOpenedPanelSize - that.collapsedPanelSize : 0));

				// get the size of the panel based on the state of the panel (opened, closed or collapsed)
				if (that.computedPanelDistance !== 0)
					properties.size = (that.currentIndex == -1) ? (that.closedPanelSize) : (index + 1 === that.currentIndex ? that.computedOpenedPanelSize : that.collapsedPanelSize);

				panel.transform(properties, animate);
			});
		},

		/*
			Attach an event handler to the accordion
		*/
		on: function(type, callback) {
			this.$accordion.on(type, callback);
		},

		/*
			Trigger an event on the accordion
		*/
		trigger: function(data) {
			this.$accordion.triggerHandler(data);
		},

		/*
			Return the panel at the specified index
		*/
		getPanelAt: function(index) {
			return this.panels[index];
		},

		/*
			Return the index of the currently opened panel
		*/
		getCurrentIndex: function() {
			return this.currentIndex;
		},

		/*
			Return the total amount of panels
		*/
		getTotalPanels: function() {
			return this.$accordion.find('.ca-panel').length;
		},

		/*
			Parse the XML file
		*/
		_parseXML: function() {

		},

		/*
			Open the next panel
		*/
		nextPanel: function() {
			var index = (this.currentIndex === this.getTotalPanels() - 1) ? 0 : (this.currentIndex + 1);
			this.openPanel(index);
		},

		/*
			Open the previous panel
		*/
		previousPanel: function() {
			var index = this.currentIndex === 0 ? (this.getTotalPanels() - 1) : (this.currentIndex - 1);
			this.openPanel(index);
		},

		/*
			Open the panel at the specified index
		*/
		openPanel: function(index) {
			if (index == this.currentIndex)
				return;

			var previousIndex = this.currentIndex;

			this.currentIndex = index;

			// animate each panel to its position and size
			this._transformPanels(true);

			// fire 'panelOpen' event
			var eventObject = {type: 'panelOpen', index: index, previousIndex: previousIndex, element: this.getPanelAt(index)};
			this.trigger(eventObject);
			if ($.isFunction(this.settings.panelOpen))
				this.settings.panelOpen.call(this, eventObject);
		},

		/*
			Close the panels
		*/
		closePanels: function() {
			var previousIndex = this.currentIndex;

			this.currentIndex = -1;

			clearTimeout(this.mouseDelayTimer);

			// animate each panel to its closed position and size
			this._transformPanels(true);

			// fire 'panelsClose' event
			var eventObject = {type: 'panelsClose', previousIndex: previousIndex};
			this.trigger(eventObject);
			if ($.isFunction(this.settings.panelsClose))
				this.settings.panelsClose.call(this, eventObject);
		},

		startSlideshow: function() {

		},

		stopSlideshow: function() {

		},

		toggleSlideshow: function() {

		},

		getSlideshowState: function() {

		},

		getAccordionState: function() {

		},

		/*
			The default options of the accordion
		*/
		defaults: {
			xmlSource: null,
			width: 500,
			height: 300,
			responsive: true,
			aspectRatio: -1,
			orientation: 'horizontal',
			startPanel: 1,
			openedPanelSize: '50%',
			openPanelOn: 'hover',
			closePanelsOnMouseOut:false,
			mouseDelay: 200,
			panelDistance: 0,
			openPanelDuration: 700,
			closePanelDuration: 700,
			openPanelEasing: 'linear',
			closePanelEasing: 'linear',
			accordionMouseOver: function() {},
			accordionMouseOut: function() {},
			panelClick: function() {},
			panelMouseOver: function() {},
			panelMouseOut: function() {},
			panelOpen: function() {},
			panelsClose: function() {}
		}
	};

	var ClassicAccordionPanel = function(panel, accordion, index, settings) {

		// reference to the panel jQuery object
		this.$panel = panel;

		// reference to the accordion object
		this.accordion = accordion;

		// the index of the panel
		this.index = index;

		// reference to the global settings of the accordion
		this.settings = settings;

		// init the panel
		this._init();
	};

	ClassicAccordionPanel.prototype = {

		/*
			The starting point for the panel
		*/
		_init: function() {
			var that = this;

			// listen for 'mouseenter' events
			this.on('mouseenter.' + NS, function() {
				that.trigger({type: 'panelMouseOver.' + NS, index: that.index});
			});

			// listen for 'mouseleave' events
			this.on('mouseleave.' + NS, function() {
				that.trigger({type: 'panelMouseOut.' + NS, index: that.index});
			});

			// listen for 'click' events
			this.on('click.' + NS, function() {
				that.trigger({type: 'panelClick.' + NS, index: that.index});
			});

			// init panel modules
			var modules = $.ClassicAccordion.panelModules;

			for (var i in modules) {
				if (typeof this['init' + modules[i]] !== 'undefined')
					this['init' + modules[i]]();
			}
		},

		/*
			Return the index of the panel
		*/
		getIndex: function() {
			return this.index;
		},

		/*
			Set the position (and size) of the panel
		*/
		transform: function(props, animate) {
			var properties = {},
				positionProperty = this.settings.orientation == 'horizontal' ? 'x' : 'y',
				sizeProperty = this.settings.orientation == 'horizontal' ? 'width' : 'height';

			if (typeof props.position !== 'undefined')
				properties[positionProperty] = props.position;

			if (typeof props.size !== 'undefined')
				properties[sizeProperty] = props.size;

			if (typeof animate !== 'undefined') {
				var duration = this.currentIndex == -1 ? this.settings.closePanelDuration : this.settings.openPanelDuration,
					easing = this.currentIndex == -1 ? this.settings.closePanelEasing : this.settings.openPanelEasing;

				properties.duration = duration;
				properties.easing =  easing;
			}

			this._animate(this.$panel, properties);
		},

		/*
			Animate the panel to the specified position
		*/
		_animate: function(element, properties) {
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
				element.css(css);
			} else {
				element.stop().animate(css, properties.duration, properties.easing);
			}
		},

		/*
			Attach an event handler to the panel
		*/
		on: function(type, callback) {
			this.$panel.on(type, callback);
		},

		/*
			Trigger an event on the panel
		*/
		trigger: function(data) {
			this.$panel.triggerHandler(data);
		}
	};

	/*
		Static methods for Classic Accordion
	*/
	$.ClassicAccordion = {

		accordionModules: [],

		panelModules: [],

		addAccordionModule: function(name, module) {
			this.accordionModules.push(module);

			$.extend(ClassicAccordion.prototype, module);
		},

		addPanelModule: function(name, module) {
			this.panelModules.push(name);

			$.extend(ClassicAccordionPanel.prototype, module);
		}
	};

	/*
		Layers module
	*/
	var Layers = {

		initLayers: function() {

			// holds references to the layers
			this.layers = [];

			// reference to the panel object
			var that = this;

			// iterate through the panel's layer jQuery objects
			// and create Layer instances for each object
			this.$panel.find('.ca-layer').each(function() {
				var layer = new Layer($(this));

				that.layers.push(layer);
			});

			// check the index pf the panel against the index of the selected/opened panel
			if (this.index == this.accordion.getCurrentIndex())
				that.handleLayersInOpenedState();
			else
				that.handleLayersInClosedState();

			// listen when a panel is opened and when the panels are closed, and handle 
			// the layer's behaviour based on the state of the panel
			this.accordion.on('panelOpen.' + NS, function(event) {
				if (that.index === event.index)
					that.handleLayersInOpenedState();

				if (that.index === event.previousIndex)
					that.handleLayersInClosedState();
			});

			this.accordion.on('panelsClose.' + NS, function(event) {
				if (that.index === event.previousIndex)
					that.handleLayersInClosedState();
			});
		},

		handleLayersInOpenedState: function() {
			var that = this;

			// show 'opened' layers and close 'closed' layers
			$.each(this.layers, function(index, value) {
				var layer = that.layers[index];

				if (layer.visibleOn == 'opened')
					layer.show();

				if (layer.visibleOn == 'closed')
					layer.hide();
			});
		},

		handleLayersInClosedState: function() {
			var that = this;

			// hide 'opened' layers and show 'closed' layers
			$.each(this.layers, function(index, value) {
				var layer = that.layers[index];

				if (layer.visibleOn == 'opened')
					layer.hide();

				if (layer.visibleOn == 'closed')
					layer.show();
			});
		}
	};

	$.ClassicAccordion.addPanelModule('Layers', Layers);

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

			if (this.$layer.hasClass('ca-always')) {
				this.visibleOn = 'always';
				this.show();
			} else if (this.$layer.hasClass('ca-opened')) {
				this.visibleOn = 'opened';
			} else if (this.$layer.hasClass('ca-closed')) {
				this.visibleOn = 'closed';
			}
		},

		/*
			Set the size and position of the layer
		*/
		setStyle: function() {
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
				this.setStyle();

			// get the initial left and top margins
			var that = this,
				start = {},
				target = {};
			
			target['opacity'] = 1;
			start['opacity'] = 0;

			if (typeof this.data['showTransition'] !== 'undefined') {
				var offset = typeof this.data['showOffset'] !== 'undefined' ? this.data['showOffset'] : 50,
					targetVertical = parseInt(this.$layer.css(this.horizontalPosition), 10),
					targetHorizontal = parseInt(this.$layer.css(this.verticalPosition), 10);

				target[this.horizontalPosition] = targetVertical;
				target[this.verticalPosition] = targetHorizontal;

				if (this.data['showTransition'] == 'left') {
					start[this.horizontalPosition] = targetVertical + (this.horizontalPosition == 'left' ? offset : -offset);
				} else if (this.data['showTransition'] == 'right') {
					start[this.horizontalPosition] = targetVertical + (this.horizontalPosition == 'left' ? -offset : offset);
				} else if (this.data['showTransition'] == 'up') {
					start[this.verticalPosition] = targetHorizontal + (this.verticalPosition == 'top' ? offset : -offset);
				} else if (this.data['showTransition'] == 'down') {
					start[this.verticalPosition] = targetHorizontal + (this.verticalPosition == 'top' ? -offset : offset);
				}
			}

			// animate the layers only for modern browsers
			// for IE7 and below make the layers visible instantly
			if (browserName == 'msie' && parseInt(browserVersion, 10) <= 7) {
				this.$layer.css('visibility', 'visible')
					.css(target);
			} else {
				this.$layer.stop()
					.delay(this.data['showDelay'])
					.css(start)
					.css('visibility', 'visible')
					.animate(target, this.data['showDuration'], this.data['showEasing'], function() {
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
			
			start['opacity'] = 1;
			target['opacity'] = 0;

			if (typeof this.data['hideTransition'] !== 'undefined') {
				var offset = typeof this.data['hideOffset'] !== 'undefined' ? this.data['hideOffset'] : 50,
					startVertical = parseInt(this.$layer.css(this.horizontalPosition), 10),
					startHorizontal = parseInt(this.$layer.css(this.verticalPosition), 10);

				if (this.data['hideTransition'] == 'left') {
					target[this.horizontalPosition] = startVertical - (this.horizontalPosition == 'left' ? offset : -offset);
				} else if (this.data['hideTransition'] == 'right') {
					target[this.horizontalPosition] = startVertical - (this.horizontalPosition == 'left' ? -offset : offset);
				} else if (this.data['hideTransition'] == 'up') {
					target[this.verticalPosition] = startHorizontal - (this.verticalPosition == 'top' ? offset : -offset);
				} else if (this.data['hideTransition'] == 'down') {
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
					.delay(this.data['hideDelay'])
					.css(start)
					.animate(target, this.data['hideDuration'], this.data['hideEasing'], function() {
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
		}
	};

	$.fn.classicAccordion = function(options) {
		return this.each(function() {
			new ClassicAccordion(this, options);
		});
	};

	window.ClassicAccordion = ClassicAccordion;
	window.ClassicAccordionPanel = ClassicAccordionPanel;

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