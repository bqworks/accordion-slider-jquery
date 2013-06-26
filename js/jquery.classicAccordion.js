/*
	Classic Accordion - jQuery plugin
*/


(function(window, $) {

	var NS = 'ClassicAccordion';



	var ClassicAccordion = function(instance, options) {
		this.accordion = $(instance);

		this.options = options;

		this.settings = $.extend({}, this.defaults, this.options);

		this.currentIndex = this.settings.startPanel;

		this.panels = [];

		this._init();
	};



	ClassicAccordion.prototype = {

		_init: function() {
			this.create();

			// set the initial size of the accordion
			if (this.settings.responsive) {
				this.accordion.css({width: '100%', height: this.settings.height, maxWidth: this.settings.width, maxHeight: this.settings.height});

				if (this.settings.aspectRatio == -1)
					this.settings.aspectRatio = this.settings.width / this.settings.height;
			} else {
				this.accordion.css({width: this.settings.width, height: this.settings.height});
			}

			this.resize();

			var _this = this;

			// resize the accordion when the browser resizes
			$(window).on('resize.' + NS, function() {
				_this.resize();
			});
		},


		create: function() {
			var _this = this;

			this.accordion.find('.ca-panel').each(function(index, element) {
				var panel = new ClassicAccordionPanel($(element), _this.accordion, index, _this.settings);

				_this.panels.push(panel);
			});
		},


		destroy: function() {

		},


		resize: function() {
			var _this = this,
				computedOpenedPanelSize = this.settings.openedPanelSize;


			if (this.settings.aspectRatio != -1)
				this.accordion.css('height', this.accordion.innerWidth() / this.settings.aspectRatio);


			var totalSize = _this.settings.orientation == "horizontal" ? this.accordion.innerWidth() : this.accordion.innerHeight();

			if (typeof computedOpenedPanelSize == 'string') {
				if (computedOpenedPanelSize.indexOf('%') != -1) {
					computedOpenedPanelSize = totalSize * (parseInt(computedOpenedPanelSize, 10)/ 100);
				} else if (computedOpenedPanelSize.indexOf('px') != -1) {
					computedOpenedPanelSize = parseInt(computedOpenedPanelSize, 10);
				} else if (computedOpenedPanelSize == 'max') {
					computedOpenedPanelSize = this.getPanelAt(this.currentIndex - 1).outerWidth(true);

				}
			}


			var closedPanelSize = (totalSize - computedOpenedPanelSize) / (this.getTotalPanels() - 1);

			console.log('resize');

			$.each(_this.panels, function(index) {
				var panel = _this.panels[index];

				panel.setPosition(index * closedPanelSize + (index > _this.currentIndex - 1 ? computedOpenedPanelSize - closedPanelSize : 0));
			});
		},


		getPanelAt: function(index) {
			return this.panels[index];
		},


		getCurrentIndex: function() {
			return this.currentIndex;
		},


		getTotalPanels: function() {
			return this.accordion.find('.ca-panel').length;
		},


		_parseXML: function() {

		},


		openPanel: function(index) {

		},


		nextPanel: function() {

		},


		previousPanel: function() {

		},


		closePanel: function() {

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


		defaults: {
			xmlSource: null,
			width: 500,
			height: 300,
			responsive: true,
			aspectRatio: -1,
			orientation: 'horizontal',
			startPanel: 1,
			openedPanelSize: '50%'
		}

	};



	var ClassicAccordionPanel = function(panel, accordion, index, settings) {
		this.panel = panel;
		this.accordion = accordion;
		this.index = index;
		this.settings = settings;
	};



	ClassicAccordionPanel.prototype = {

		getIndex: function () {
			return this.index;
		},


		setPosition: function (value) {
			if (this.settings.orientation == 'horizontal') {
				this.panel.css('left', value);
			} else if (this.settings.orientation == 'vertical') {
				this.panel.css('top', value);
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