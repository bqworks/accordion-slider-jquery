/*
	Classic Accordion - jQuery plugin
*/
(function(window, $) {

	// namespace
	var NS = 'ClassicAccordion';

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
			this.$accordion.on('mouseenter.' + NS, function(event) {
				var eventObject = {type: 'accordionMouseOver'};
				that.trigger(eventObject);
				if ($.isFunction(that.settings.accordionMouseOver))
					that.settings.accordionMouseOver.call(that, eventObject);
			});

			// listen for 'mouseleave' events
			this.$accordion.on('mouseleave.' + NS, function(event) {
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
			var panel = new ClassicAccordionPanel($element, this.accordion, index, this.settings);
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

			// parse computedOpenedPanelSize set it to a pixel value
			if (typeof this.computedOpenedPanelSize == 'string') {
				if (this.computedOpenedPanelSize.indexOf('%') != -1) {
					this.computedOpenedPanelSize = totalSize * (parseInt(this.computedOpenedPanelSize, 10)/ 100);
				} else if (this.computedOpenedPanelSize.indexOf('px') != -1) {
					this.computedOpenedPanelSize = parseInt(this.computedOpenedPanelSize, 10);
				} else if (this.computedOpenedPanelSize == 'max') {
					this.computedOpenedPanelSize = this.getPanelAt(this.currentIndex - 1).outerWidth(true);

				}
			}

			// set the size, in pixels, of the collapsed panels
			this.collapsedPanelSize = (totalSize - this.computedOpenedPanelSize) / (this.getTotalPanels() - 1);

			// set the size, in pixels, of the closed panels
			this.closedPanelSize = totalSize / this.getTotalPanels();

			// set the initial position and size of the panels
			$.each(that.panels, function(index) {
				var panel = that.panels[index];

				if (that.currentIndex == -1) {
					panel.transform(index * that.closedPanelSize, that.closedPanelSize);
				} else {
					panel.transform(index * that.collapsedPanelSize + (index > that.currentIndex - 1 ? that.computedOpenedPanelSize - that.collapsedPanelSize : 0), index + 1 === that.currentIndex ? that.computedOpenedPanelSize : that.collapsedPanelSize);
				}
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
			this.$accordion.triggerHandler({type: data.type, index: data.index});
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
			var that = this;

			this.currentIndex = index;

			// animate each panel to its position and size, based on the current index
			$.each(this.panels, function(index) {
				var panel = that.panels[index];
				panel.transform(index * that.collapsedPanelSize + (index > that.currentIndex - 1 ? that.computedOpenedPanelSize - that.collapsedPanelSize : 0), index + 1 === that.currentIndex ? that.computedOpenedPanelSize : that.collapsedPanelSize, true);
			});
		},

		/*
			Close the panels
		*/
		closePanels: function() {
			var that = this;

			this.currentIndex = -1;

			clearTimeout(this.mouseDelayTimer);

			// animate each panel to its closed position and size
			$.each(this.panels, function(index) {
				var panel = that.panels[index];
				panel.transform(index * that.closedPanelSize, that.closedPanelSize, true);
			});
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
			openPanelDuration: 700,
			closePanelDuration: 700,
			openPanelEasing: 'ease',
			closePanelEasing: 'ease',
			accordionMouseOver: function() {},
			accordionMouseOut: function() {},
			panelClick: function() {},
			panelMouseOver: function() {},
			panelMouseOut: function() {}
		}
	};

	var ClassicAccordionPanel = function(panel, accordion, index, settings) {

		// reference to the panel jQuery object
		this.$panel = panel;

		// reference to the accordion jQuery object
		this.$accordion = accordion;

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
		},

		/*
			Return the index of the panel
		*/
		getIndex: function() {
			return this.index;
		},

		/*
			Set the position and size of the panel
		*/
		transform: function(positionValue, sizeValue, animate) {
			var properties = {};

			if (this.settings.orientation == 'horizontal')
				properties = {'left': positionValue, 'width': sizeValue};
			else if (this.settings.orientation == 'vertical')
				properties = {'top': positionValue, 'height': sizeValue};

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

			if (typeof properties.left !== 'undefined')
				css.left = properties.left;

			if (typeof properties.top !== 'undefined')
				css.top = properties.top;

			if (typeof properties.width !== 'undefined')
				css.width = properties.width;

			if (typeof properties.height !== 'undefined')
				css.height = properties.height;

			if (typeof properties.duration === 'undefined') {
				element.css(css);
			} else {
				element.animate(css, properties.duration, properties.easing);
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
			this.$panel.triggerHandler({type: data.type, index: data.index});
		}
	};

	/*
		Static methods for Classic Accordion
	*/
	$.ClassicAccordion = {

		accordionModules: [],

		panelModules: [],

		addAccordionModule: function(module) {
			this.accordionModules.push(module);

			$.extend(ClassicAccordion.prototype, module.prototype.extend);
		},

		addPanelModule: function(module) {
			this.panelModules.push(module);

			$.extend(ClassicAccordionPanel.prototype, module.prototype.extend);
		}
	};

	/*
		CSS3 Transitions module
	*/
	var CSS3Transitions = function() {
		this.name = 'CSS3TransitionsModule';
	};

	CSS3Transitions.prototype = {

		/*
			Contains the main methods of the module, that will add or overwrite functionality
		*/
		extend: {
			_animate: function(element, properties) {
				this._animateUsingTranslate3D(element, properties);
			},

			_animateUsingTranslate3D: function(element, properties) {
				var css = {},
					left = 0,
					top = 0,
					transition;

				if (typeof properties.left !== 'undefined')
					left = properties.left;

				if (typeof properties.top !== 'undefined')
					top = properties.top;

				css.transform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';

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

				css.transition = transition;

				element.css(css);
			},

			_animateUsingTranslate: function(element, properties) {
				var css = {},
					left = 0,
					top = 0,
					transition;

				if (typeof properties.left !== 'undefined')
					left = properties.left;

				if (typeof properties.top !== 'undefined')
					top = properties.top;

				css.transform = 'translate(' + left + 'px, ' + top + 'px)';

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

				css.transition = transition;

				element.css(css);
			},

			_animateUsingJavaScript: function(element, properties) {
				var css = {};

				if (typeof properties.left !== 'undefined')
					css.left = properties.left;

				if (typeof properties.top !== 'undefined')
					css.top = properties.top;

				if (typeof properties.width !== 'undefined')
					css.width = properties.width;

				if (typeof properties.height !== 'undefined')
					css.height = properties.height;

				if (typeof properties.duration === 'undefined') {
					element.css(css);
				} else {
					if (typeof properties.delay !== 'undefined')
						element.delay(properties.delay);

					element.animate(css, properties.duration, properties.easing);
				}
			}
		}
	};

	$.ClassicAccordion.addPanelModule(CSS3Transitions);

	$.fn.classicAccordion = function(options) {
		return this.each(function() {
			new ClassicAccordion(this, options);
		});
	};

	window.ClassicAccordion = ClassicAccordion;
	window.ClassicAccordionPanel = ClassicAccordionPanel;

})(window, jQuery);