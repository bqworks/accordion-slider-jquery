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

			// animate each panel to its position and size
			this._transformPanels(true);
		},

		/*
			Close the panels
		*/
		closePanels: function() {
			var that = this;

			this.currentIndex = -1;

			clearTimeout(this.mouseDelayTimer);

			// animate each panel to its closed position and size
			this._transformPanels(true);
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

			// init panel modules
			var modules = $.ClassicAccordion.panelModules;

			for (var i in modules) {
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
		CSS3 Transitions module
	*/
	var CSS3Transitions = {

		initCSS3Transitions: function() {

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

		_animate: function(element, properties) {
			if (this.useTransforms) {
				properties.use3DTransforms = this.use3DTransforms;
				this._animateUsingTranslate(element, properties);
			} else {
				this._animateUsingJavaScript(element, properties);
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

			css.transition = transition;

			element.css(css);
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
				element.css(css);
			} else {
				if (typeof properties.delay !== 'undefined')
					element.delay(properties.delay);

				element.animate(css, properties.duration, properties.easing);
			}
		}
	};

	$.ClassicAccordion.addPanelModule('CSS3Transitions', CSS3Transitions);

	$.fn.classicAccordion = function(options) {
		return this.each(function() {
			new ClassicAccordion(this, options);
		});
	};

	window.ClassicAccordion = ClassicAccordion;
	window.ClassicAccordionPanel = ClassicAccordionPanel;

})(window, jQuery);