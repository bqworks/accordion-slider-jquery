# [Accordion Slider - jQuery slider plugin](http://bqworks.net/accordion-slider/) #

>A responsive and touch-enabled jQuery accordion slider plugin that combines the functionality of a slider with that of an accordion.

Main features: 

* modular architecture
* responsive
* touch-swipe
* CSS3 transitions
* animated layers (and static)
* deep linking
* lazy loading
* retina-enabled
* video support
* JavaScript breakpoints 

Check the plugin's [presentation page](http://bqworks.net/accordion-slider/) for examples and more details of the available features.

## Getting started ##

### 1. Get a copy of the plugin ###

You can fork or download the plugin from GitHub, or you can install it through `npm`.

```
$ npm install accordion-slider
``

### 2. Load the required files ###

Inside the page's head tag include the accordion's CSS file.

```html
<link rel="stylesheet" href="dist/css/accordion-slider.min.css"/>
```

In the page's footer, just before <code>&lt;/body&gt;</code>, include the required JavaScript files.

```html
<script src="libs/js/jquery-1.11.0.min.js"></script>
<script src="dist/js/jquery.accordionSlider.min.js"></script>
```

### 3. Create the HTML markup ###

```html
<body>
	<div id="my-accordion" class="accordion-slider">
		<div class="as-panels">
			<div class="as-panel">
				<img class="as-background" src="path/to/image1.jpg"/>
			</div>
			<div class="as-panel">
				<img class="as-background" src="path/to/image2.jpg"/>
			</div>
			<div class="as-panel">
				<img class="as-background" src="path/to/image3.jpg"/>
			</div>
			<div class="as-panel">
				<img class="as-background" src="path/to/image4.jpg"/>
			</div>
			<div class="as-panel">
				<img class="as-background" src="path/to/image5.jpg"/>
			</div>
		</div>
    </div>
</body>
```

The structure you see in the code above (accordion-slider > as-panels > as-panel) as well as the class names used are required.

More about the supported content (i.e., layers, html, video) in the [Modules](docs/modules.md#modules) doc.

### 4. Instantiate the accordion ###

```html
<script type="text/javascript">
	jQuery(document).ready(function($) {
		$('#my-accordion').accordionSlider();
	});
</script>
```

Accordion Slider has 40+ customizable options. More about this in the [JavaScript API](docs/api.md#javascript-api) doc.

## Detailed usage instructions ##

* [JavaScript API](docs/api.md#javascript-api)
	* [1. Properties](docs/api.md#1-properties)
	* [2. Public Methods](docs/api.md#2-public-methods)
	* [3. Callbacks](docs/api.md#3-callbacks)
* [Modules](docs/modules.md#modules)
	* [1. Touch Swipe](docs/modules.md#1-touch-swipe)
	* [2. Autoplay](docs/modules.md#2-autoplay)
	* [3. Mouse Wheel](docs/modules.md#3-mouse-wheel)
	* [4. Keyboard](docs/modules.md#4-keyboard)
	* [5. Layers](docs/modules.md#5-layers)
	* [6. Lazy Loading](docs/modules.md#6-lazy-loading)	
	* [7. Retina](docs/modules.md#7-retina)
	* [8. Deep Linking](docs/modules.md#8-deep-linking)
	* [9. Swap Background](docs/modules.md#9-swap-background)
	* [10. Smart Video](docs/modules.md#10-smart-video)
	* [11. XML](docs/modules.md#11-xml)
	* [12. JSON](docs/modules.md#12-json)

## Support ##

If you found a bug or have a feature suggestion, please submit it in the [Issues tracker](https://github.com/bqworks/accordion-slider-js/issues).

## License ##

The plugin is available under the <a href="http://opensource.org/licenses/MIT">MIT license</a>.