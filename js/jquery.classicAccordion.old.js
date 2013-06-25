/*
	Accordion
*/

(function($) {

	function ClassicAccordion(instance, options) {

		// contains all the settings for the accordion
		this.settings = $.extend({}, $.fn.classicAccordion.defaults, options);

		// reference to the main DIV that contains the slideshow
		var accordion = $(instance),

			// reference to the current object
			self = this,

			// index of the current slide
			currentIndex = -1,

			// array of objects, each object containing data(path, caption etc.) about the panel
			panels = [],

			// array of DIV panel objects
			panelDivs = [],

			// will be used as the timer for the slideshow mode
			slideshowTimer = 0,

			// these properties can be assign to individual panels in the XML file
			panelProps = ['captionFadeDuration', 'captionWidth', 'captionHeight', 'captionTop', 'captionLeft', 'linkTarget'],

			// the total width/height of the accordion panel
			totalSize,

			// the initial width/height of the panels
			initialPanelSize,

			// the width/height of the panel when it is opened
			openedPanelSize,

			// the current state of the accordion. can be 'opened' or 'closed'
			accordionState = 'closed',

			// the total width of the margins and borders
			outerWidth = 0,

			// the total height of the margins and borders
			outerHeight = 0,

			// the total number of panels
			totalPanels = 0,

			// timer used to delay of panel's opening
			openPanelTimer;

		// START
		init();


		/**
		* Initializes the accordion
		*/
		function init() {
			// delete the content of the selected DIV and initialize it
			accordion.css({width: self.settings.width, height: self.settings.height});

			totalSize = self.settings.orientation == "horizontal" ? accordion.innerWidth() : accordion.innerHeight();

			$(window).resize(function() {
				accordionResize();
			});

			if (self.settings.xmlSource) {
				// delete the previous content of the selected DIV
				accordion.empty();

				//parse the XML file
				$.ajax({type:'GET', url:self.settings.xmlSource, dataType: $.browser.msie ? 'text' : 'xml', success:function(data) {																													
					var xml;

					if ($.browser.msie) {
						xml = new ActiveXObject('Microsoft.XMLDOM');
						xml.async = false;
						xml.loadXML(data);
					} else {
						xml = data;
					}

					// find all the <panel> nodes
					$(xml).find('panel').each(function() {
						// will contain data such as path, caption or link
						var panel = {};

						// will contain data such as alignType etc.
						panel.properties = {};

						// reads all the tags that were specified for a panel in the XML file
						for (var i = 0; i < $(this).children().length; i++) {
							var node = $(this).children()[i];
							panel[node.nodeName] = $(this).find(node.nodeName).text();
						}

						// reads all the attributes that were specified for a slide in the XML file
						for (var i = 0; i < panelProps.length; i++) {
							var name = panelProps[i],
							value = $(this).attr(name);

							// if a property was not specified in the XML file, take the default value	
							if (value === undefined)
								panel.properties[name] = self.settings[name];
							else
								panel.properties[name] = value;
						}

						panels.push(panel);
					});

					loadPanels();
				}});
			} else {
				// if an XML file was not specified, read the content of the selected div
				accordion.children().each(function(index) {
					// will contain data such as path, caption, or link
					var panel = {};

					// will contain data such as alignType etc.
					panel.properties = {};

					// loops through all the sub-children of child
					for (var i = 0; i < $(this).children().length; i++) {
						var data = $(this).children()[i];

						// check whether the current sub-child is an image, a thumbnail, a link, or a paragraph, and copy the data
						if($(data).is('a')) {
							panel['path'] = $(data).find('img').attr('src');
							panel['link'] = $(data).attr('href');
							if ($(data).attr('target'))
								panel.properties.linkTarget = $(data).attr('target');
						} else if($(data).is('img')) {
							panel['path'] = $(data).attr('src');
						} else if ($(data).hasClass('html')){
							panel['html'] = $(data);
						} else {
							panel[$(data).attr('class')] = $(data).html();
						}
					}

					// reads all the settings that were specified for each panel
					for (var i = 0; i < panelProps.length; i++) {
						var name = panelProps[i],
						value;

						if (self.settings.panelProperties)
							if (self.settings.panelProperties[index])
								value = self.settings.panelProperties[index][name];

						// if a property was not specified, take the default value
						if (!panel.properties[name])
							if (value === undefined)
								panel.properties[name] = self.settings[name];
							else
								panel.properties[name] = value;
						}

						panels.push(panel);
					});

				// delete the current content of the selected div and create the accordion
				//accordion.empty();
				loadPanels();
			}
		}


		function accordionResize() {

			totalSize = self.settings.orientation == "horizontal" ? accordion.innerWidth() : accordion.innerHeight();

			if (accordionState == "closed") {
				// calculate the initial panel size
				initialPanelSize = (totalSize - (totalPanels - 1) * self.settings.distance) / panels.length;

				for (var i = 0; i < totalPanels; i++) {
					if (self.settings.orientation == "horizontal") {
						panelDivs[i].css('left', i * (initialPanelSize  + self.settings.distance));
						panelDivs[i].css('height',  accordion.innerHeight() - outerHeight);
						panelDivs[i].css('width', initialPanelSize - outerWidth);
					} else if (self.settings.orientation == "vertical") {
						panelDivs[i].css('top', i * (initialPanelSize  + self.settings.distance));
						panelDivs[i].css('width',  accordion.innerWidth() - outerWidth);
						panelDivs[i].css('height', initialPanelSize - outerHeight);
					}
				}
			} else {
				// calculate the opened panel size
				openedPanelSize = totalSize - (totalPanels - 1) * (self.settings.closedPanelSize + self.settings.distance);

				var openedSize =  Math.min(openedPanelSize, panels[currentIndex].size),
				closedSize = (totalSize - (totalPanels - 1) * self.settings.distance - openedSize) / (totalPanels - 1);

				for (var i = 0; i < totalPanels; i++) {
					if (self.settings.orientation == "horizontal") {
						panelDivs[i].css('left', i * (closedSize + self.settings.distance) + (i <= currentIndex ? 0 : openedSize - closedSize));
						panelDivs[i].css('height',  accordion.innerHeight() - outerHeight);
						panelDivs[i].css('width', (i == currentIndex ? Math.min(openedPanelSize, panels[i].size) : closedSize) - outerWidth);
					} else if (self.settings.orientation == "vertical") {
						panelDivs[i].css('top', i * (closedSize + self.settings.distance) + (i <= currentIndex ? 0 : openedSize - closedSize));
						panelDivs[i].css('width',  accordion.innerWidth() - outerWidth);
						panelDivs[i].css('height', (i == currentIndex ? Math.min(openedPanelSize, panels[i].size) : closedSize) - outerHeight);
					}
				}
			}

		}


		/**
		* Loads the panels
		*/
		function loadPanels() {
			// randomizes the panels
			if (self.settings.shuffle)
				panels.sort(function(){return 0.5 - Math.random();});

			// preloades the images for the panels
			if (self.settings.preloadPanels) {
				showPreloader();

				// contains the number of slides that were preloaded
				var counter = 0,

					// the number of slides that need to be preloaded
					n = panels.length;

				// load the images
				for (var i = 0; i < n; i++) {
					$('<img/>').load(function() {
						counter++;
						if (counter == n) {
							hidePreloader();
							displayPanels();
						}
					})
					.attr('src', panels[i].path);
				}
			} else {
				displayPanels();
			}
		}


		/**
		* Displays the panels
		*/
		function  displayPanels() {
			totalPanels = panels.length;

			// calculate the initial panel size
			initialPanelSize = (totalSize - (totalPanels - 1) * self.settings.distance) / panels.length;

			// calculate the opened panel size
			openedPanelSize = totalSize - (totalPanels - 1) * (self.settings.closedPanelSize + self.settings.distance);

			// create a dummy div in order to calculate the width/height of the border, margins and other elements
			var div = $('<div class="panel"></div>').appendTo(accordion);
			outerWidth = div.outerWidth() - div.innerWidth();
			outerHeight = div.outerHeight() - div.innerHeight();
			div.remove();

			for (var i = 0; i < totalPanels; i++)
				createPanel(i);

			if (self.settings.slideshow)
				startSlideshow();

			// pause or resume the slidethos on hover
			// also close all the panels on mouse out
			accordion.hover(function() {
				if (self.settings.slideshow && self.settings.stopSlideshowOnHover)
					stopSlideshow();
			},

			function() {
				if (self.settings.closePanelOnMouseOut)
					resetPanels();

				if (self.settings.slideshow && self.settings.stopSlideshowOnHover)
					startSlideshow();
			});
		}


		/**
		* Creates an individual panel 
		*/
		function createPanel(index) {
			var	panel = accordion.find('li').eq(index).addClass('panel');

			var image = panel.find('img'),
			parent = image.parent();

			image.remove();

			$('<div class="mockup"></div>').css({'width': '100%', 'height': '100%', 'visibility': 'hidden'}).appendTo(parent);

			panelDivs.push(panel);

			// temporarily set the panel's size to the default size
			// this value might change after the image is loaded and its actual size becomes available
			panels[index].size = openedPanelSize;

			if (panels[index].html) {
				(panels[index].html).appendTo(panelDivs[index]);
			}

			// preload the image
			$('<img/>').load(function() {
							// when it's loaded replace the preloader with the actual image
							panelDivs[index].css('background-image', 'url(' + $(this).attr('src') + ')');

							// set the alignment of the image
							switch (self.settings.alignType) {
								case 'leftTop':
								panelDivs[index].css('background-position', 'left top');
								break;

								case 'leftCenter':
								panelDivs[index].css('background-position', 'left center');
								break;

								case 'leftBottom':
								panelDivs[index].css('background-position', 'left bottom');
								break;

								case 'centerTop':
								panelDivs[index].css('background-position', 'center top');
								break;

								case 'centerCenter':
								panelDivs[index].css('background-position', 'center center');
								break;

								case 'centerBottom':
								panelDivs[index].css('background-position', 'center bottom');
								break;

								case 'rightTop':
								panelDivs[index].css('background-position', 'right top');
								break;

								case 'rightCenter':
								panelDivs[index].css('background-position', 'right center');
								break;

								case 'rightBottom':
								panelDivs[index].css('background-position', 'right bottom');
								break;

								case 'default':
								panelDivs[index].css('background-position', 'left top');
							}

							// create the shadow only if there is not distance between the panels
							if (self.settings.shadow) {
								var shadowClass = self.settings.orientation == "horizontal" ? "shadow-horizontal" : "shadow-vertical",
								shadow = $('<div class=' + shadowClass + '></div>').appendTo(panel);
							}

							var size = self.settings.orientation == "horizontal" ? $(this).attr('width') || $(this).prop('width') : $(this).attr('height') || $(this).prop('height');
							panels[index].size	= Math.min(openedPanelSize, size);

							// fire the panelLoaded event
							var eventObject = {type: 'panelLoaded', index:index, data:panels[index]};
							$.isFunction(self.settings.panelLoaded) && self.settings.panelLoaded.call(this, eventObject);
						})
						.attr('src', panels[index].path);


			// set the initial size and position of the panel depending on the orientation of the accordion
			if (self.settings.orientation == "horizontal") {
				panel.css('left', index * (initialPanelSize  + self.settings.distance));
				panel.css('height',  accordion.innerHeight() - outerHeight);
				panel.css('width', initialPanelSize - outerWidth);
			} else if (self.settings.orientation == "vertical") {
				panel.css('top', index * (initialPanelSize  + self.settings.distance));
				panel.css('width',  accordion.innerWidth() - outerWidth);
				panel.css('height', initialPanelSize - outerHeight);
			}


			// listen for mouse over and mouse out
			panel.hover(
				function(event) {
					if (self.settings.openPanelOnMouseOver) {
						if (openPanelTimer)
							clearTimeout(openPanelTimer);
						// set a delay before opening the panel
						openPanelTimer = setTimeout(function() {openPanel(index);}, self.settings.openPanelDelay);
					}

					// fire the panelMouseOver event
					var eventObject = {type: 'panelMouseOver', index:index, data:panels[index]};
					$.isFunction(self.settings.panelMouseOver) && self.settings.panelMouseOver.call(this, eventObject);
				},
				function() {
					// fire the panelMouseOut event
					var eventObject = {type: 'panelMouseOut', index:index, data:panels[index]};
					$.isFunction(self.settings.panelMouseOut) && self.settings.panelMouseOut.call(this, eventObject);
				}
				);

			if(panels[index].link)
				panel.css('cursor', 'pointer');

			//listen for clicks
			panel.click(function() {
				if (self.settings.openPanelOnClick)
					openPanel(index);

				/*if(panels[index].link)
				window.open(panels[index].link, panels[index].properties.linkTarget);*/

				// fire the panelClick event
				var eventObject = {type: 'panelClick', index:index, data:panels[index]};
				$.isFunction(self.settings.panelClick) && self.settings.panelClick.call(this, eventObject);
			});


			// fire the panelCreated event
			var eventObject = {type: 'panelCreated', index:index, data:panels[index]};
			$.isFunction(self.settings.panelCreated) && self.settings.panelCreated.call(this, eventObject);

			if (index == panels.length - 1) {
				// fire the panelCreated event
				var eventObject = {type: 'allPanelsCreated'};
				$.isFunction(self.settings.allPanelsCreated) && self.settings.allPanelsCreated.call(this, eventObject);
			}
		}


		/**
		* Opens the panel with the specified index
		*/
		function openPanel(index) {
			if (currentIndex == index && accordionState == 'opened')
				return;

			// change the accordion state
			accordionState = 'opened';

			// stop any running animation
			if (currentIndex != -1)
				panelDivs[currentIndex].stop();

			currentIndex = index;

			// fire the openPanel event
			var eventObject = {type: 'openPanel', index:index, data:panels[index]};
			$.isFunction(self.settings.openPanel) && self.settings.openPanel.call(this, eventObject);

			removeCaption();

			// this flag will assure that some actions are only being done once
			var flag = false,
			size = self.settings.orientation == "horizontal" ? 'width' : 'height',
			position = self.settings.orientation == "horizontal" ? 'left' : 'top',
			outerSize = self.settings.orientation == "horizontal" ? outerWidth : outerHeight,
				// reference to the opened panel
				openedPanel = panelDivs[currentIndex],
				// the width/height of the opened panel (used to calcualte the progress)
				openedSize = Math.min(openedPanelSize, panels[currentIndex].size),
				// the width/height of the closed panels
				closedSize = (totalSize - (totalPanels - 1) * self.settings.distance - openedSize) / (totalPanels - 1),
				// the initial size of the selected opened panel (used only to calcualte the progress)
				openedStartSize = parseFloat(openedPanel.css(size)),
				// the target value for the panel's position
				openedTargetPosition = currentIndex * (closedSize + self.settings.distance),
				// holds the properties that will be animated
				anim = {},
				// array containing the target size values of the panels
				targetSizeArray = [],
				// array containing the initial size values of the panels
				startSizeArray = [],
				// array containing the target position values of the panels
				targetPositionArray = [],
				// array containing the initial position values of the panels
				startPositionArray = [],
				// a number from 0 to 1 indicating the current progress of the animation
				progress;

			// populate the arrays with the correct values
			for (var i = 0; i < totalPanels; i++) {
				startSizeArray[i] = parseFloat(panelDivs[i].css(size));
				targetSizeArray[i] = (i == currentIndex ? Math.min(openedPanelSize, panels[index].size) : closedSize) - outerSize;

				startPositionArray[i] = parseFloat(panelDivs[i].css(position));
				targetPositionArray[i] = i * (closedSize + self.settings.distance) + (i <= currentIndex ? 0 : openedSize - closedSize);
			}

			anim[size] = openedSize - outerSize;

			// stop any running animation
			openedPanel.stop();

			// if there are properties that have changed, start the animation
			openedPanel.animate(anim, {duration: self.settings.slideDuration, 
				complete: function() {
					if (!flag) {
						flag = true;
						// when the animation is complete, create the caption
						if (panels[index].caption)
							createCaption(panels[index].caption);

						// fire the animationComplete event
						var eventObject = {type: 'animationComplete'};
						$.isFunction(self.settings.animationComplete) && self.settings.animationComplete.call(this, eventObject);
					}
				},
				step: function(currentValue) {
					progress = (currentValue - openedStartSize) / (openedSize - outerSize - openedStartSize);

					for (var i = 0; i < totalPanels; i++) {
						if (i != currentIndex)
							panelDivs[i].css(size, progress * (targetSizeArray[i] - startSizeArray[i]) + startSizeArray[i]);

						panelDivs[i].css(position, progress * (targetPositionArray[i] - startPositionArray[i]) + startPositionArray[i]);
					}

				}
			});

		}


		/**
		* Rearranges all the panels in their initial state
		*/
		function resetPanels() {
			// change the state of the accordion
			accordionState = 'closed';

			if (openPanelTimer)
				clearTimeout(openPanelTimer);

			removeCaption();

			// this flag will assure that some actions are only being done once
			var	flag = false,
			size = self.settings.orientation == "horizontal" ? 'width' : 'height',
			position = self.settings.orientation == "horizontal" ? 'left' : 'top',
			outerSize = self.settings.orientation == "horizontal" ? outerWidth : outerHeight,
				// reference to the opened panel
				openedPanel = panelDivs[currentIndex],
				// the initial size of the selected opened panel (used only to calcualte the progress)
				openedStartSize = parseFloat(openedPanel.css(size)),
				// holds the properties that will be animated
				anim = {},
				// array containing the target size values of the panels
				targetSizeArray = [],
				// array containing the initial size values of the panels
				startSizeArray = [],
				// array containing the target position values of the panels
				targetPositionArray = [],
				// array containing the initial position values of the panels
				startPositionArray = [],
				// a number from 0 to 1 indicating the current progress of the animation
				progress;

			// populate the arrays with the correct values
			for (var i = 0; i < totalPanels; i++) {
				startSizeArray[i] = parseFloat(panelDivs[i].css(size));
				targetSizeArray[i] = initialPanelSize - outerSize;

				startPositionArray[i] = parseFloat(panelDivs[i].css(position));
				targetPositionArray[i] = i * (initialPanelSize  + self.settings.distance);
			}

			anim[size] = initialPanelSize - outerSize;

			// stop any running animation
			openedPanel.stop();

			// if there are properties that have changed, start the animation
			openedPanel.animate(anim, {duration: self.settings.slideDuration,
				complete: function() {
					if (!flag) {
						flag = true;

						// fire the animationComplete event
						var eventObject = {type: 'animationComplete'};
						$.isFunction(self.settings.animationComplete) && self.settings.animationComplete.call(this, eventObject);
					}
				},
				step: function(currentValue) {
					progress = (openedStartSize - currentValue) / (openedStartSize - initialPanelSize + outerSize);

					for (var i = 0; i < totalPanels; i++) {
						if (i != currentIndex)
							panelDivs[i].css(size, progress * (targetSizeArray[i] - startSizeArray[i]) + startSizeArray[i]);

						panelDivs[i].css(position, progress * (targetPositionArray[i] - startPositionArray[i]) + startPositionArray[i]);
					}

				}
			});
		}


		/**
		* Opens the next panel
		*/
		function nextPanel() {
			var index = (currentIndex == panels.length - 1) ? 0 : (currentIndex + 1);
			openPanel(index);
		}



		/**
		* Opens the previous panel
		*/
		function previousPanel() {
			var index = currentIndex === 0 ? (panels.length - 1) : (currentIndex - 1);
			openPanel(index);
		}


		/**
		* Shows the main preloader
		*/
		function showPreloader() {
			var preloader = $('<div class="preloader"></div>').hide()
			.fadeIn(300)
			.appendTo(accordion),

				// calculate the preloader's position
				preloaderLeft = ((accordion.outerWidth() - parseInt(preloader.css('width'))) * 0.5),
				preloaderTop = ((accordion.outerHeight() - parseInt(preloader.css('height'))) * 0.5);

				preloader.css({'left':preloaderLeft, 'top':preloaderTop});
			}


		/**
		* Hides the main preloader
		*/
		function hidePreloader() {
			accordion.find('.preloader').remove();
		}


		/**
		* Creates the caption
		*/
		function createCaption(captionText) {
			// get the specified values for the current caption
			var panelData = panels[currentIndex],
			properties = panelData.properties,
			captionFadeDuration = parseInt(properties.captionFadeDuration),
			captionWidth = parseInt(properties.captionWidth),
			captionHeight = parseInt(properties.captionHeight),
			captionTop = parseInt(properties.captionTop),
			captionLeft = parseInt(properties.captionLeft),

				// create the main caption container
				caption = panelDivs[currentIndex].find('.caption').css({'width':captionWidth, 'height':captionHeight,
					'left':captionLeft, 'top':captionTop,
					'opacity': 0})
				.addClass('active');

				// create the background
				// captionBackground = $('<div class="caption-background"></div>').css({'width':'100%', 'height': '100%'}).appendTo(caption),			

				// create the content of the caption
				// captionContent = $('<p></p>').html(captionText)
				//							 .css({'width':'100%', 'height': '100%', 'opacity': 1})
				//							 .appendTo(captionBackground);

			// slide in the caption
			caption.animate({'opacity': 1}, captionFadeDuration);
		}


		/**
		* Removes the caption
		*/
		function removeCaption() {
			var caption = accordion.find('.active');

			if (caption)
				caption.stop().animate({'opacity': 0}, 300, function(){caption.removeClass('active');});
		}


		/**
		* Starts the slideshow
		*/
		function startSlideshow() {
			slideshowTimer = setInterval(function() {
				if (self.settings.slideshowDirection == 'next')
					nextPanel();
				else if (self.settings.slideshowDirection == 'previous')
					previousPanel();
			}, self.settings.slideshowDelay);
		}


		/**
		* Stops the slideshow
		*/
		function stopSlideshow() {
			if (slideshowTimer)
				clearInterval(slideshowTimer);
		}


		// PUBLIC METHODS

		this.nextPanel = nextPanel;

		this.previousSlide = previousPanel;

		this.openPanel = openPanel;

		this.startSlideshow = function() {
			startSlideshow();
		};

		this.stopSlideshow = function() {
			stopSlideshow();
		};

		this.getSlideshowState = function() {
			return slideshowState;
		};

		this.getCurrentIndex = function() {
			return currentIndex;
		};

		this.getPanelAt = function(index) {
			return panels[index];
		};

		this.getAccordionState = function() {
			return accordionState;
		};
	}


	$.fn.classicAccordion = function(options) {
		var collection = [];

		for (var i = 0; i < this.length; i++) {
			if (!this[i].accordion) {
				this[i].accordion = new ClassicAccordion(this[i], options);
				collection.push(this[i].accordion);
			}
		}

		// if there are more accordion instances, return the array
		// it there is only one, return just the accordion instance
		return collection.length > 1 ? collection : collection[0];
	};


	// default settings
	$.fn.classicAccordion.defaults =  {
		xmlSource:null,
		width:500,
		height:300,
		orientation:'horizontal',
		alignType:'leftTop',
		distance:0,
		slideshow:false,
		slideshowDelay:5000,
		slideshowDirection:'next',
		stopSlideshowOnHover:true,
		slideDuration:700,
		openPanelOnMouseOver:true,
		closePanelOnMouseOut:true,
		openPanelOnClick:false,
		preloadPanels:false,
		shuffle:false,
		closedPanelSize:30,
		captionFadeDuration:500,
		captionWidth:300,
		captionHeight:100,
		captionTop:100,
		captionLeft:30,
		shadow:true,
		linkTarget:'_blank',
		openPanelDelay:200,
		panelProperties:null,
		panelMouseOver:null,
		panelMouseOut:null,
		panelClick:null,
		panelLoaded:null,
		panelCreated:null,
		allPanelsCreated:null,
		animationComplete:null,
		openPanel:null
	};

})(jQuery);