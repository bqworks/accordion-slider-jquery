/*
	Classic Accordion - jQuery plugin
*/

var ClassicAccordion;


(function(window, $) {

	var NS = 'ClassicAccordion';

	var ClassicAccordion = function(instance, options) {
		this.accordion = $(instance);
		this.options = options;

		this._init();
	};



	ClassicAccordion.prototype = {

		_init: function() {
			this.settings = $.extend({}, this.defaults, this.options);

			this.accordion.css({width: this.settings.width, height: this.settings.height});

			this.refresh();

			this.resize();

			var _this = this;

			$(window).on('resize.' + NS, function() {
				_this.resize();
			});
		},


		destroy: function() {

		},


		refresh: function() {
			this.totalPanels = this.accordion.find('.panel').length;
		},


		resize: function() {
			var _this = this,
				totalSize = _this.settings.orientation == "horizontal" ? this.accordion.innerWidth() : this.accordion.innerHeight(),
				computedOpenedPanelSize = _this.settings.openedPanelSize;

			if (typeof computedOpenedPanelSize == 'string') {
				if (computedOpenedPanelSize.indexOf('%') != -1)
					computedOpenedPanelSize = totalSize * (parseInt(computedOpenedPanelSize, 10)/ 100);
				else if (computedOpenedPanelSize.indexOf('px') != -1)
					computedOpenedPanelSize = parseInt(computedOpenedPanelSize, 10);
				else if (computedOpenedPanelSize == 'max')
					computedOpenedPanelSize = parseInt(computedOpenedPanelSize, 10);
			}

			var closedPanelSize = (totalSize - computedOpenedPanelSize) / (this.totalPanels - 1);

			this.accordion.find('.panel').each(function(index, element) {
				if (_this.settings.orientation == 'horizontal') {
					$(element).css('left', index * closedPanelSize);
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
			orientation: 'horizontal',
			openedPanelSize: '50%',
			startPanel: 1
		}

	};



	$.fn.classicAccordion = function(options) {
		return this.each(function() {
			new ClassicAccordion(this, options);
		});
	};



	window.ClassicAccordion = ClassicAccordion;

})(window, jQuery);