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

		this.computedOpenedPanelSize = 0;

		this.collapsedPanelSize = 0;

		this.closedPanelSize = 0;

		this.panels = [];

		this.mouseDelayTimer = 0;

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

				var _this = this;

				// resize the accordion when the browser resizes
				$(window).on('resize.' + NS, function() {
					_this.resize();
				});
			} else {
				this.accordion.css({width: this.settings.width, height: this.settings.height});
			}

			this.resize();
		},


		create: function() {
			var _this = this;

			this.accordion.find('.ca-panel').each(function(index, element) {
				_this._createPanel(index + 1, element);
			});

			this.accordion.on('mouseenter.' + NS, function(event) {
				var eventObject = {type: 'accordionMouseOver'};
				if ($.isFunction(_this.settings.accordionMouseOver))
					_this.settings.accordionMouseOver.call(_this, eventObject);
			});

			this.accordion.on('mouseleave.' + NS, function(event) {
				if (_this.settings.closePanelsOnMouseOut)
					_this.closePanels();

				var eventObject = {type: 'accordionMouseOut'};
				if ($.isFunction(_this.settings.accordionMouseOut))
					_this.settings.accordionMouseOut.call(_this, eventObject);
			});
		},


		_createPanel: function(index, el) {
			var _this = this,
				element = $(el);

			var panel = new ClassicAccordionPanel(element, this.accordion, index, this.settings);
			this.panels.splice(index, 0, panel);


			element.on('panelMouseOver.' + NS, function(event) {
				if (_this.settings.openPanelOn == 'hover') {
					clearTimeout(_this.mouseDelayTimer);

					_this.mouseDelayTimer = setTimeout(function() {
						_this.openPanel(event.index);
					}, _this.settings.mouseDelay);
				}

				var eventObject = {type: 'panelMouseOver', index: index, element: element};
				if ($.isFunction(_this.settings.panelMouseOver))
					_this.settings.panelMouseOver.call(_this, eventObject);
			});

			element.on('panelMouseOut.' + NS, function(event) {
				var eventObject = {type: 'panelMouseOut', index: index, element: element};
				if ($.isFunction(_this.settings.panelMouseOut))
					_this.settings.panelMouseOut.call(_this, eventObject);
			});

			element.on('panelClick.' + NS, function(event) {
				if (_this.settings.openPanelOn == 'click')
					if (index !== this.currentIndex)
						_this.openPanel(event.index);
					else
						_this.closePanels();

				var eventObject = {type: 'panelClick', index: index, element: element};
				if ($.isFunction(_this.settings.panelClick))
					_this.settings.panelClick.call(_this, eventObject);
			});
		},


		destroy: function() {

		},


		resize: function() {
			var _this = this;

			if (this.settings.aspectRatio != -1)
				this.accordion.css('height', this.accordion.innerWidth() / this.settings.aspectRatio);

			this.computedOpenedPanelSize = this.settings.openedPanelSize;

			var totalSize = this.settings.orientation == "horizontal" ? this.accordion.innerWidth() : this.accordion.innerHeight();

			if (typeof this.computedOpenedPanelSize == 'string') {
				if (this.computedOpenedPanelSize.indexOf('%') != -1) {
					this.computedOpenedPanelSize = totalSize * (parseInt(this.computedOpenedPanelSize, 10)/ 100);
				} else if (this.computedOpenedPanelSize.indexOf('px') != -1) {
					this.computedOpenedPanelSize = parseInt(this.computedOpenedPanelSize, 10);
				} else if (this.computedOpenedPanelSize == 'max') {
					this.computedOpenedPanelSize = this.getPanelAt(this.currentIndex - 1).outerWidth(true);

				}
			}

			this.collapsedPanelSize = (totalSize - this.computedOpenedPanelSize) / (this.getTotalPanels() - 1);

			this.closedPanelSize = totalSize / this.getTotalPanels();

			console.log('resize');

			$.each(_this.panels, function(index) {
				var panel = _this.panels[index];

				if (_this.currentIndex == -1) {
					panel.setPositionAndSize(index * _this.closedPanelSize, _this.closedPanelSize);
				} else {
					panel.setPositionAndSize(index * _this.collapsedPanelSize + (index > _this.currentIndex - 1 ? _this.computedOpenedPanelSize - _this.collapsedPanelSize : 0), index + 1 === _this.currentIndex ? _this.computedOpenedPanelSize : _this.collapsedPanelSize);
				}
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


		nextPanel: function() {
			var index = (this.currentIndex === this.getTotalPanels() - 1) ? 0 : (this.currentIndex + 1);
			this.openPanel(index);
		},


		previousPanel: function() {
			var index = this.currentIndex === 0 ? (this.getTotalPanels() - 1) : (this.currentIndex - 1);
			this.openPanel(index);
		},


		openPanel: function(index) {
			var _this = this;

			_this.currentIndex = index;

			$.each(this.panels, function(index) {
				var panel = _this.panels[index];
				panel.setPositionAndSize(index * _this.collapsedPanelSize + (index > _this.currentIndex - 1 ? _this.computedOpenedPanelSize - _this.collapsedPanelSize : 0), index + 1 === _this.currentIndex ? _this.computedOpenedPanelSize : _this.collapsedPanelSize, true);
			});
		},


		closePanels: function() {
			var _this = this;

			_this.currentIndex = -1;

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
		this.panel = panel;
		this.accordion = accordion;
		this.index = index;
		this.settings = settings;

		this._init();
	};



	ClassicAccordionPanel.prototype = {

		_init: function() {
			var _this = this;

			this.panel.on('mouseenter.' + NS, function() {
				_this.panel.trigger({type: 'panelMouseOver.' + NS, index: _this.index});
			});

			this.panel.on('mouseleave.' + NS, function() {
				_this.panel.trigger({type: 'panelMouseOut.' + NS, index: _this.index});
			});

			this.panel.on('click.' + NS, function() {
				_this.panel.trigger({type: 'panelClick.' + NS, index: _this.index});
			});
		},


		getIndex: function() {
			return this.index;
		},


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
		},


		setSize: function(value, animate) {
			if (this.settings.orientation == 'horizontal') {
				if (this.panel.css('width') === value)
					return;

				if (animate === true) {
					this.panel.stop().transition({'width': value});
				} else {
					this.panel.css('width', value);
				}
			} else if (this.settings.orientation == 'vertical') {
				if (this.panel.css('top') === value)
					return;

				if (animate === true) {
					this.panel.stop().transition({'height': value});
				} else {
					this.panel.css('height', value);
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