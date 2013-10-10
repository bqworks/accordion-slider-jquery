# Modules #

## Introduction ##

Accordion Slider has a modular architecture. It consists of a core and several optional modules. The advantage of modular architecture is that it allows you to load only the code you need and leave out what you don't need, resulting in a smaller file size for the script and, theoretically, better performance, although, practically, you won't have any performance issue even if you load all the modules. There are also advantages for developers because the plugin is easier to extend and maintain.

The jquery.accordionSlider.js file (and its minified version, jquery.accordionSlider.min.js) from the 'dist' folder includes all the modules, so that you can have quick and easy access to all the available features. However, if you would like to build a custom script, and you're familiar enough with JavaScript, please see the next chapter.

## Building a custom script ##

You can find all the modules, in separate files, in the 'src/js' folder. What you need to do is copy the code from those files in a separate file, starting with the jquery.advancedSlider.core.js file. It's important that the jquery.advancedSlider.core.js code is the first block of code in your script. The order of the optional modules is not important. After you created your script, you can obtain a minified version by using Google's [Closure Compiler](http://closure-compiler.appspot.com/home).

## Modules presentation ##

### 1. Touch Swipe ###

Although it's an optional module, you will most likely want to include it in all your projects because it enables touch functionality for touch screen devices. The module also adds mouse drag functionality (on non-touch screen devices) when the accordion has more than one page.

### 2. Autoplay ###

Adds autoplay functionality. In the [Javascript API](api.md) chapter you can see the properties that allow you to control this module. If you do include this module but you want to disable the autoplay, you can set the 'autoplay' property to false.

### 3. Mouse Wheel ###

Enables the accordion to respond to mouse wheel input.

### 4. Layers ###

### 5. Lazy Loading ###

### 6. Retina ###

### 7. Deep Linking ###

### 8. Swap Background ###

### 9. Smart Video ###

### 10. XML ###

### 11. JSON ###
