
<h1>Setup</h1>
<h2>Installing and instantiating Accordion Slider</h2>

<h3>1. Copying the required files</h3>

First of all, you will need to copy the files needed for the plugin. You may want to create separate directories for the JavaScript and CSS files for better organization; for this demonstration, we'll name the two folders 'js' and 'css'.

<h4>JavaScript files</h4>

Copy the Accordion Slider script (jquery.accordionSlider.min.js) from the 'dist/js' folder to your 'js' folder. You will also need to copy the jQuery script (jquery-1.10.1.min.js) from the 'libs' folder, or you can download it from <a href="http://jquery.com/">the official jQuery website</a>.

<h4>CSS files</h4>

From 'dist/js', copy accordion-slider.min.css and the 'images' folder into your 'css' folder.

<h3>2. Including the required files in the page</h3>

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

<h3>3. Creating HTML markup</h3>

Inside the `<body>` tag, you need to specify HTML markup like in the example below:
```
HTML markup here
```


<h3>4. Instantiating the accordion</h3>

After including the required files in the header, you will also need to add the following code:
```
<script type="text/javascript">
	var accordion;

	$(document).ready(function() {
		accordion = $('#my-accordion').accordionSlider();
	});
</script>
```

If you want to change any of the default settings for the accordion, you can also pass various properties to the accordion here - more about that in the <a href="api.md">API</a> chapter.
