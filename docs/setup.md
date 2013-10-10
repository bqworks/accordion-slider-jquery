# Setup1 #
## Installing and instantiating Accordion Slider ##

### 1. Copying the required files ###

First of all, you will need to copy the files needed for the plugin. You may want to create separate directories for the JavaScript and CSS files for better organization; for this demonstration, we'll name the two folders 'js' and 'css'.

#### JavaScript files ####

Copy the Accordion Slider script (jquery.accordionSlider.min.js) from the 'dist/js' folder to your 'js' folder. You will also need to copy the jQuery script (jquery-1.10.1.min.js) from the 'libs' folder, or you can download it from [the official jQuery website](http://jquery.com/).

#### CSS files ####

From 'dist/css', copy accordion-slider.min.css and the 'images' folder into your 'css' folder.

### 2. Including the required files in the page ###

Once you have copied the files mentioned above, you will need to include them in the header of the HTML page:

```
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">

<title>Page title</title>

<link rel="stylesheet" type="text/css" href="css/accordion-slider.min.css" media="screen"/>

<script type="text/javascript" src="js/jquery-1.10.1.min.js"></script>
<script type="text/javascript" src="js/jquery.accordionSlider.min.js"></script>

</head>
<body>

</body>
</html>
```

### 3. Creating HTML markup ###

Inside the `<body>` tag, you need to specify HTML markup like in the example below:

```
<body>
	<div id="my-accordion" class="accordion-slider">
		<div class="as-panels">
			<div class="as-panel">
				<img class="as-background" data-src="http://bqworks.com/accordion-slider/images/image1.jpg"/>
			</div>
			
			<div class="as-panel">
				<img class="as-background" data-src="http://bqworks.com/accordion-slider/images/image2.jpg"/>
			</div>
			
			<div class="as-panel">
				<img class="as-background" data-src="http://bqworks.com/accordion-slider/images/image3.jpg"/>
			</div>

			<div class="as-panel">
				<img class="as-background" data-src="http://bqworks.com/accordion-slider/images/image4.jpg"/>
			</div>

			<div class="as-panel">
				<img class="as-background" data-src="http://bqworks.com/accordion-slider/images/image5.jpg"/>
			</div>
		</div>
    </div>
</body>
```

This is one of the most basic accordions that you can create. In the "Modules" chapter you will learn how to add richer functionality to the accordion, which will require some additional HTML code.

The accordion's main DIV element needs to have the `accordion-slider` class. Then, inside the main accordion container you create another DIV, which has the `as-panels` class. This DIV will be a container for the individual panel elements. The panel elements need to be DIV's that have the `as-panel` class.

Please note that all class names are prefixed with `as-` in order to prevent CSS conflicts with other scripts from the page.

### 4. Instantiating the accordion ###

After including the required files in the header and creating the HTML markup, you will need to instantiate the accordion by adding the following code before the `</head>` tag:
```
<script type="text/javascript">
	jQuery(document).ready(function($) {
		$('#my-accordion').accordionSlider();
	});
</script>
```

If you want to change any of the default settings for the accordion, you can also pass various properties to the accordion here - more about that in the [API](api.md) chapter.
