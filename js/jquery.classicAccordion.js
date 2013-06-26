/*
	Classic Accordion - jQuery plugin
*/

var ClassicAccordion;


(function(window, $) {

	var NS = 'ClassicAccordion';

	var ClassicAccordion = function(instance, options) {
		this.accordion = $(instance);

		this.options = options;

		this.settings = $.extend({}, this.defaults, this.options);

		this.currentIndex = this.settings.startPanel;

		this._init();
	};



	ClassicAccordion.prototype = {

		_init: function() {
			this.refresh();

			// set the initial size of the accordion
			if (this.settings.responsive) {
				this.accordion.css({width: '100%', height: this.settings.height, maxWidth: this.settings.width, maxHeight: this.settings.height});

				if (this.settings.aspectRatio == -1)
					this.settings.aspectRatio = this.accordion.innerWidth() / this.accordion.innerHeight();
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


		destroy: function() {

		},


		refresh: function() {

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
					computedOpenedPanelSize = this.accordion.find('.panel').eq(this.currentIndex - 1).outerWidth(true);

				}
			}


			var closedPanelSize = (totalSize - computedOpenedPanelSize) / (this.getTotalPanels() - 1);

			console.log('resize');

			this.accordion.find('.panel').each(function(index, element) {
				if (_this.settings.orientation == 'horizontal') {
					$(element).css('left', index * closedPanelSize + (index > _this.currentIndex - 1 ? computedOpenedPanelSize - closedPanelSize : 0));
				} else if (_this.settings.orientation == 'vertical') {

				}
			});
		},


		_addPanel: function() {

		},


		_removePanel: function() {

		},


		getPanelAt: function(index) {

		},


		getCurrentIndex: function() {
			return this.currentIndex;
		},


		getTotalPanels: function() {
			return this.accordion.find('.panel').length;
		},


		_parseXML: function() {

		},


		openPanel: function() {

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



	$.fn.classicAccordion = function(options) {
		return this.each(function() {
			new ClassicAccordion(this, options);
		});
	};



	window.ClassicAccordion = ClassicAccordion;

})(window, jQuery);