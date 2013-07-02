/*
	Classic Accordion - jQuery plugin
*/
(function(window, $) {

	// declare a namespace to use it in events
	var NS = 'ClassicAccordion';

	var ClassicAccordion = function(instance, options) {

		// reference to the accordion jQuery object
		this.accordion = $(instance);

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
				this.accordion.addClass('ca-horizontal');
			else if (this.settings.orientation == 'vertical')
				this.accordion.addClass('ca-vertical');

			// prepare the accordion for responsiveness
			if (this.settings.responsive) {
				// if the accordion is responsive set the width to 100% and use
				// the specified width and height as a max-width and max-height
				this.accordion.css({width: '100%', height: this.settings.height, maxWidth: this.settings.width, maxHeight: this.settings.height});

				// if an aspect ratio was not specified, set the aspect ratio
				// based on the specified width and height
				if (this.settings.aspectRatio == -1)
					this.settings.aspectRatio = this.settings.width / this.settings.height;

				var _this = this;

				// resize the accordion when the browser resizes
				$(window).on('resize.' + NS, function() {
					_this.resize();
				});
			} else {
				this.accordion.css({width: this.settings.width, height: this.settings.height});
			}

			// set the initial size of the accordion
			this.resize();

			// listen for 'mouseenter' events
			this.accordion.on('mouseenter.' + NS, function(event) {
				var eventObject = {type: 'accordionMouseOver'};
				if ($.isFunction(_this.settings.accordionMouseOver))
					_this.settings.accordionMouseOver.call(_this, eventObject);
			});

			// listen for 'mouseleave' events
			this.accordion.on('mouseleave.' + NS, function(event) {
				// close the panels
				if (_this.settings.closePanelsOnMouseOut)
					_this.closePanels();

				var eventObject = {type: 'accordionMouseOut'};
				if ($.isFunction(_this.settings.accordionMouseOut))
					_this.settings.accordionMouseOut.call(_this, eventObject);
			});
		},

		/*
			Create the panels based on the HTML specified in the accordion
		*/
		create: function() {
			var _this = this;

			this.accordion.find('.ca-panel').each(function(index, element) {
				_this._createPanel(index + 1, element);
			});
		},

		/*
			Create an individual panel
		*/
		_createPanel: function(index, el) {
			var _this = this,
				element = $(el);

			// create a panel instance and add it to the array of panels
			var panel = new ClassicAccordionPanel(element, this.accordion, index, this.settings);
			this.panels.splice(index, 0, panel);

			// listen for 'panelMouseOver' events
			element.on('panelMouseOver.' + NS, function(event) {
				if (_this.settings.openPanelOn == 'hover') {
					clearTimeout(_this.mouseDelayTimer);

					// open the panel, but only after a short delay in order to prevent
					// opening panels that the user doesn't intend
					_this.mouseDelayTimer = setTimeout(function() {
						_this.openPanel(event.index);
					}, _this.settings.mouseDelay);
				}

				var eventObject = {type: 'panelMouseOver', index: index, element: element};
				if ($.isFunction(_this.settings.panelMouseOver))
					_this.settings.panelMouseOver.call(_this, eventObject);
			});

			// listen for 'panelMouseOut' events
			element.on('panelMouseOut.' + NS, function(event) {
				var eventObject = {type: 'panelMouseOut', index: index, element: element};
				if ($.isFunction(_this.settings.panelMouseOut))
					_this.settings.panelMouseOut.call(_this, eventObject);
			});

			// listen for 'panelClick' events
			element.on('panelClick.' + NS, function(event) {
				if (_this.settings.openPanelOn == 'click') {
					// open the panel if it's not already opened
					// and close the panels if the clicked panel is opened
					if (index !== this.currentIndex)
						_this.openPanel(event.index);
					else
						_this.closePanels();
				}

				var eventObject = {type: 'panelClick', index: index, element: element};
				if ($.isFunction(_this.settings.panelClick))
					_this.settings.panelClick.call(_this, eventObject);
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
			var _this = this;

			// set the height of the accordion based on the aspect ratio
			if (this.settings.aspectRatio != -1)
				this.accordion.css('height', this.accordion.innerWidth() / this.settings.aspectRatio);

			// set the initial computedOpenedPanelSize to the value defined in the options
			this.computedOpenedPanelSize = this.settings.openedPanelSize;

			// get the total size, in pixels, of the accordion
			var totalSize = this.settings.orientation == "horizontal" ? this.accordion.innerWidth() : this.accordion.innerHeight();

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
			$.each(_this.panels, function(index) {
				var panel = _this.panels[index];

				if (_this.currentIndex == -1) {
					panel.setPositionAndSize(index * _this.closedPanelSize, _this.closedPanelSize);
				} else {
					panel.setPositionAndSize(index * _this.collapsedPanelSize + (index > _this.currentIndex - 1 ? _this.computedOpenedPanelSize - _this.collapsedPanelSize : 0), index + 1 === _this.currentIndex ? _this.computedOpenedPanelSize : _this.collapsedPanelSize);
				}
			});
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
			return this.accordion.find('.ca-panel').length;
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
			var _this = this;

			_this.currentIndex = index;

			// animate each panel to its position and size, based on the current index
			$.each(this.panels, function(index) {
				var panel = _this.panels[index];
				panel.setPositionAndSize(index * _this.collapsedPanelSize + (index > _this.currentIndex - 1 ? _this.computedOpenedPanelSize - _this.collapsedPanelSize : 0), index + 1 === _this.currentIndex ? _this.computedOpenedPanelSize : _this.collapsedPanelSize, true);
			});
		},

		/*
			Close the panels
		*/
		closePanels: function() {
			var _this = this;

			_this.currentIndex = -1;

			clearTimeout(_this.mouseDelayTimer);

			// animate each panel to its closed position and size
			$.each(this.panels, function(index) {
				var panel = _this.panels[index];
				panel.setPositionAndSize(index * _this.closedPanelSize, _this.closedPanelSize, true);
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
			accordionMouseOver: function() {},
			accordionMouseOut: function() {},
			panelClick: function() {},
			panelMouseOver: function() {},
			panelMouseOut: function() {}
		}

	};

	var ClassicAccordionPanel = function(panel, accordion, index, settings) {

		// reference to the panel jQuery object
		this.panel = panel;

		// reference to the accordion jQuery object
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
			var _this = this;

			// listen for 'mouseenter' events
			this.panel.on('mouseenter.' + NS, function() {
				_this.panel.trigger({type: 'panelMouseOver.' + NS, index: _this.index});
			});

			// listen for 'mouseleave' events
			this.panel.on('mouseleave.' + NS, function() {
				_this.panel.trigger({type: 'panelMouseOut.' + NS, index: _this.index});
			});

			// listen for 'click' events
			this.panel.on('click.' + NS, function() {
				_this.panel.trigger({type: 'panelClick.' + NS, index: _this.index});
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
		setPositionAndSize: function(positionValue, sizeValue, animate) {
			if (this.settings.orientation == 'horizontal') {
				if (this.panel.css('left') === positionValue)
					return;

				if (animate === true) {
					this.panel.stop().animate({'left': positionValue, 'width': sizeValue});
				} else {
					this.panel.css({'left': positionValue, 'width': sizeValue});
				}
			} else if (this.settings.orientation == 'vertical') {
				if (this.panel.css('top') === sizeValue)
					return;

				if (animate === true) {
					this.panel.stop().animate({'top': positionValue, 'height': sizeValue});
				} else {
					this.panel.css({'top': positionValue, 'height': sizeValue});
				}
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

})(window, jQuery);