/*
	TouchSwipe module for Accordion Slider

	Adds touch swipe support for scrolling through pages
*/
;(function(window, $) {

	"use strict";
	
	var NS = $.AccordionSlider.namespace;

	var TouchSwipe = {

		isTouchSupport: false,

		touchStartPoint: {x: 0, y: 0},

		touchEndPoint: {x: 0, y: 0},

		touchStartPosition: 0,

		isTouchMoving: false,

		initTouchSwipe: function() {
			var that = this;

			$.extend(this.settings, this.touchSwipeDefaults, this.options);

			// check if touch swipe is enabled
			if (this.settings.touchSwipe === false)
				return;

			// check if there is touch support
			this.isTouchSupport = 'ontouchstart' in window;

			// listen to touch events or, if touch support doesn't exist, listen to mouse events
			var startEvent = this.isTouchSupport ? 'touchstart' : 'mousedown';
			this.$panelsContainer.on(startEvent + '.' + NS, $.proxy(this._onTouchStart, this));

			// add grabbing icon
			this.$panelsContainer.addClass('as-grab');

			// remove mouse events on panels
			if (this.isTouchSupport) {
				this.on('update.TouchSwipe.' + NS, function() {
					$.each(that.panels, function(index, element) {
						var panel = element;
						panel.off('panelMouseOver.' + NS);
						panel.off('panelMouseOut.' + NS);
						panel.off('panelClick.' + NS);
					});
				});
			}
		},

		_onTouchStart: function(event) {
			// disable dragging if the element is set to allow selections
			if ($(event.target).closest('.selectable').length >= 1)
				return;

			// prevent default behaviour only for mouse events
			if (this.isTouchSupport === false)
				event.preventDefault();

			var that = this,
				eventObject = this.isTouchSupport ? event.originalEvent.touches[0] : event.originalEvent,
				moveEvent = this.isTouchSupport ? 'touchmove' : 'mousemove',
				endEvent = this.isTouchSupport ? 'touchend' : 'mouseup';

			// get the initial position of the mouse pointer and the initial position of the panels' container
			this.touchStartPoint.x = eventObject.pageX;
			this.touchStartPoint.y = eventObject.pageY;
			this.touchStartPosition = parseInt(this.$panelsContainer.css(this.positionProperty), 10);

			// listen for move adn end events
			this.$panelsContainer.on(moveEvent + '.' + NS, $.proxy(this._onTouchMove, this));
			$(document).on(endEvent + '.' + this.uniqueId + '.' + NS, $.proxy(this._onTouchEnd, this));

			// swap grabbing icons
			this.$panelsContainer.removeClass('as-grab').addClass('as-grabbing');

			// disable click events on links
			$(event.target).parents('.as-panel').find('a').one('click.TouchSwipe', function(event) {
				event.preventDefault();
			});
		},

		_onTouchMove: function(event) {
			event.preventDefault();

			var eventObject = this.isTouchSupport ? event.originalEvent.touches[0] : event.originalEvent;

			// indicate that the move event is being fired
			this.isTouchMoving = true;

			// get the current position of the mouse pointer
			this.touchEndPoint.x = eventObject.pageX;
			this.touchEndPoint.y = eventObject.pageY;

			// calculate the distance of the movement on both axis
			var xDistance = this.touchEndPoint.x - this.touchStartPoint.x,
				yDistance = this.touchEndPoint.y - this.touchStartPoint.y,
				distance = this.settings.orientation == 'horizontal' ? xDistance : yDistance;
			
			// get the current position of panels' container
			var currentPanelsPosition = parseInt(this.$panelsContainer.css(this.positionProperty), 10);
			
			// reduce the movement speed if the panels' container is outside its bounds
			if (currentPanelsPosition > 0 || currentPanelsPosition < - this.totalPanelsSize + this.totalSize)
				distance = distance * 0.2;

			// move the panels' container
			this.$panelsContainer.css(this.positionProperty, this.touchStartPosition + distance);
		},

		_onTouchEnd: function(event) {
			// remove the move and end listeners
			var moveEvent = this.isTouchSupport ? 'touchmove' : 'mousemove',
				endEvent = this.isTouchSupport ? 'touchend' : 'mouseup';

			this.$panelsContainer.off(moveEvent + '.' + NS);
			$(document).off(endEvent + '.' + this.uniqueId + '.' + NS);

			// check if there is intention for a tap
			if (this.isTouchSupport === true && (this.isTouchMoving === false || this.isTouchMoving === true && Math.abs(this.touchEndPoint.x - this.touchStartPoint.x) < 10 && Math.abs(this.touchEndPoint.y - this.touchStartPoint.y) < 10)) {
				var index = $(event.target).parents('.as-panel').index();

				if (index !== this.currentIndex) {
					this.openPanel(index);
				} else {
					// re-enable click events on links
					$(event.target).parents('.as-panel').find('a').off('click.TouchSwipe');
				}

				return;
			}

			// return if there was no movement and re-enable click events on links
			if (this.isTouchMoving === false) {
				$(event.target).parents('.as-panel').find('a').off('click.TouchSwipe');
				return;
			}

			this.isTouchMoving = false;

			// calculate the distance of the movement
			var xDistance = this.touchEndPoint.x - this.touchStartPoint.x,
				yDistance = this.touchEndPoint.y - this.touchStartPoint.y,
				noScrollAnimObj = {};

			noScrollAnimObj[this.positionProperty] = this.touchStartPosition;

			// set the accordion's page based on the distance of the movement and the accordion's settings
			if (this.settings.orientation == 'horizontal') {
				if (xDistance > this.settings.touchSwipeThreshold) {
					if (this.currentPage > 0) {
						this.previousPage();
					} else {
						this.$panelsContainer.stop().animate(noScrollAnimObj, 300);
					}
				} else if (- xDistance > this.settings.touchSwipeThreshold) {
					if (this.currentPage < this.getTotalPages() - 1) {
						this.nextPage();
					} else {
						this.gotoPage(this.currentPage);
					}
				} else if (Math.abs(xDistance) < this.settings.touchSwipeThreshold) {
					this.$panelsContainer.stop().animate(noScrollAnimObj, 300);
				}
			} else if (this.settings.orientation == 'vertical') {
				if (yDistance > this.settings.touchSwipeThreshold) {
					if (this.currentPage > 0) {
						this.previousPage();
					} else {
						this.$panelsContainer.stop().animate(noScrollAnimObj, 300);
					}
				} else if (- yDistance > this.settings.touchSwipeThreshold) {
					if (this.currentPage < this.getTotalPages() - 1) {
						this.nextPage();
					} else {
						this.$panelsContainer.animate(noScrollAnimObj, 300);
					}
				} else if (Math.abs(yDistance) < this.settings.touchSwipeThreshold) {
					this.$panelsContainer.stop().animate(noScrollAnimObj, 300);
				}
			}

			// swap grabbing icons
			this.$panelsContainer.removeClass('as-grabbing').addClass('as-grab');
		},

		destroyTouchSwipe: function() {
			var startEvent = this.isTouchSupport ? 'touchstart' : 'mousedown',
				endEvent = this.isTouchSupport ? 'touchend' : 'mouseup',
				moveEvent = this.isTouchSupport ? 'touchmove' : 'mousemove';

			this.$panelsContainer.off(startEvent + '.' + NS);
			$(document).off(endEvent + '.' + this.uniqueId + '.' + NS);
			this.$panelsContainer.off(moveEvent + '.' + NS);
			this.off('update.TouchSwipe.' + NS);
		},

		touchSwipeDefaults: {
			touchSwipe: true,
			touchSwipeThreshold: 50
		}
	};

	$.AccordionSlider.addModule('TouchSwipe', TouchSwipe, 'accordion');
	
})(window, jQuery);