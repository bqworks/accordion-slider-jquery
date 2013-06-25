/*
	Classic Accordion - jQuery plugin
*/

var ClassicAccordion;


(function(window, $) {

	var NS = 'ClassicAccordion';

	var ClassicAccordion = function(instance, options) {
		this.self = instance;
		this.accordion = $(instance);
		this.options = options;

		this._init();
	};



	ClassicAccordion.prototype = {

		_init: function() {
			this.settings = $.extend({}, this.defaults, this.options);


		},


		destroy: function() {

		},


		refresh: function() {

		},


		resize: function() {

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
			orientation:' horizontal'
		}

	};



	$.fn.classicAccordion = function(options) {
		return this.each(function() {
			new ClassicAccordion(this, options);
		});
	};



	window.ClassicAccordion = ClassicAccordion;

})(window, jQuery);