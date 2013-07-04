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
				if ($.isFunction(that.settings.accordionMouseOver))
					that.settings.accordionMouseOver.call(that, eventObject);
			});

			// listen for 'mouseleave' events
			this.$accordion.on('mouseleave.' + NS, function(event) {
				// close the panels
				if (that.settings.closePanelsOnMouseOut)
					that.closePanels();

				var eventObject = {type: 'accordionMouseOut'};
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
			$element.on('panelMouseOver.' + NS, function(event) {
				if (that.settings.openPanelOn == 'hover') {
					clearTimeout(that.mouseDelayTimer);

					// open the panel, but only after a short delay in order to prevent
					// opening panels that the user doesn't intend
					that.mouseDelayTimer = setTimeout(function() {
						that.openPanel(event.index);
					}, that.settings.mouseDelay);
				}

				var eventObject = {type: 'panelMouseOver', index: index, element: $element};
				if ($.isFunction(that.settings.panelMouseOver))
					that.settings.panelMouseOver.call(that, eventObject);
			});

			// listen for 'panelMouseOut' events
			$element.on('panelMouseOut.' + NS, function(event) {
				var eventObject = {type: 'panelMouseOut', index: index, element: $element};
				if ($.isFunction(that.settings.panelMouseOut))
					that.settings.panelMouseOut.call(that, eventObject);
			});

			// listen for 'panelClick' events
			$element.on('panelClick.' + NS, function(event) {
				if (that.settings.openPanelOn == 'click') {
					// open the panel if it's not already opened
					// and close the panels if the clicked panel is opened
					if (index !== this.currentIndex)
						that.openPanel(event.index);
					else
						that.closePanels();
				}

				var eventObject = {type: 'panelClick', index: index, element: $element};
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
					panel.setPositionAndSize(index * that.closedPanelSize, that.closedPanelSize);
				} else {
					panel.setPositionAndSize(index * that.collapsedPanelSize + (index > that.currentIndex - 1 ? that.computedOpenedPanelSize - that.collapsedPanelSize : 0), index + 1 === that.currentIndex ? that.computedOpenedPanelSize : that.collapsedPanelSize);
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

			that.currentIndex = index;

			// animate each panel to its position and size, based on the current index
			$.each(this.panels, function(index) {
				var panel = that.panels[index];
				panel.setPositionAndSize(index * that.collapsedPanelSize + (index > that.currentIndex - 1 ? that.computedOpenedPanelSize - that.collapsedPanelSize : 0), index + 1 === that.currentIndex ? that.computedOpenedPanelSize : that.collapsedPanelSize, true);
			});
		},

		/*
			Close the panels
		*/
		closePanels: function() {
			var that = this;

			that.currentIndex = -1;

			clearTimeout(that.mouseDelayTimer);

			// animate each panel to its closed position and size
			$.each(this.panels, function(index) {
				var panel = that.panels[index];
				panel.setPositionAndSize(index * that.closedPanelSize, that.closedPanelSize, true);
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
			this.$panel.on('mouseenter.' + NS, function() {
				that.$panel.trigger({type: 'panelMouseOver.' + NS, index: that.index});
			});

			// listen for 'mouseleave' events
			this.$panel.on('mouseleave.' + NS, function() {
				that.$panel.trigger({type: 'panelMouseOut.' + NS, index: that.index});
			});

			// listen for 'click' events
			this.$panel.on('click.' + NS, function() {
				that.$panel.trigger({type: 'panelClick.' + NS, index: that.index});
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
				if (animate === true) {
					this.$panel.css({'transition': 'all 1s', 'transform': 'translate3d(' + positionValue + 'px, 0, 0)'});
				} else {
					this.$panel.css({'transition': 'none', 'transform': 'translate3d(' + positionValue + 'px, 0, 0)'});
				}
			} else if (this.settings.orientation == 'vertical') {
				if (animate === true) {
					this.$panel.stop().animate({'top': positionValue, 'height': sizeValue});
				} else {
					this.$panel.css({'top': positionValue, 'height': sizeValue});
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