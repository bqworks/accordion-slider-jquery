<h1>JavaScript API (properties, methods and callbacks)</h1>
<h2>Customizing the core of the plugin</h2>

<h3>1. Properties</h3>

Accordion Slider can be customized using several options which are described in the following table:

<table>
<tr>
<th>Property name</th><th>Default value</th><th>Other values</th><th>Description</th>
</tr>
<tr>
<td>width</td><td>500</td><td></td><td>Sets the width of the accordion.</td>
</tr>
<tr>
<td>height</td><td>300</td><td></td><td>Sets the height of the accordion.</td>
</tr>
<tr>
<td>responsive</td><td>true</td><td></td><td>Makes the accordion responsive.</td>
</tr>
<tr>
<td>responsiveMode</td><td>'auto'</td><td>'custom'</td><td>Sets the responsive mode of the accordion: 'auto' resizes the accordion and all of its elements (e.g., captions), while 'custom' only resizes the accordion.</td>
</tr>
<tr>
<td>aspectRatio</td><td>-1</td><td></td><td>Sets the aspect ratio of the accordion panels.</td>
</tr>
<tr>
<td>orientation</td><td>'horizontal'</td><td>'vertical'</td><td>Sets the orientation of the panels.</td>
</tr>
<tr>
<td>startPanel</td><td>-1</td><td></td><td>Indicates which panel will be opened when the accordion loads (0 for the first panel, 1 for the second panel, etc.). If set to -1, no panel will be opened.</td>
</tr>
<tr>
<td>openedPanelSize</td><td>'50%'</td><td></td><td>Sets the size of an open panel.</td>
</tr>
<tr>
<td>maxOpenedPanelSize</td><td>'90%'</td><td></td><td>Sets the maximum size of an open panel.</td>
</tr>
<tr>
<td>openPanelOn</td><td>'hover'</td><td>'click'</td><td>If set to 'hover', the panels will be opened by moving the mouse pointer over them; if set to 'click', the panels will only open when clicked.</td>
</tr>
<tr>
<td>closePanelsOnMouseOut</td><td>true</td><td></td><td>Determines whether the opened panel closes or remains open when the mouse pointer is moved away.</td>
</tr>
<tr>
<td>mouseDelay</td><td>200</td><td></td><td>Sets the delay in milliseconds between the movement of the mouse pointer and the opening of the panel.</td>
</tr>
<tr>
<td>panelDistance</td><td>0</td><td></td><td>Sets the distance between consecutive panels.</td>
</tr>
<tr>
<td>openPanelDuration</td><td>500</td><td></td><td>Determines the duration in milliseconds for the opening of a panel.</td>
</tr>
<tr>
<td>closePanelDuration</td><td>500</td><td></td><td>Determines the duration in milliseconds for the closing of a panel.</td>
</tr>
<tr>
<td>openPanelEasing</td><td>'swing'</td><td></td><td>Sets the easing type of the panel opening effect.</td>
</tr>
<tr>
<td>closePanelEasing</td><td>'swing'</td><td></td><td>Sets the easing type of the panel closing effect.</td>
</tr>
<tr>
<td>pageScrollDuration</td><td>500</td><td></td><td>Indicates the duration of the page scroll effect.</td>
</tr>
<tr>
<td>pageScrollEasing</td><td>'swing'</td><td></td><td>Indicates the easing type of the page scroll effect.</td>
</tr>
<tr>
<td>breakpoints</td><td>null</td><td></td><td>Sets specific breakpoints which allow changing the behavior of the accordion (decreasing the number of panels visible per page, shifting the orientation of the panels, etc.) when resized.</td>
</tr>
<tr>
<td>visiblePanels</td><td>-1</td><td></td><td>Indicates the number of panels visible per page. If set to -1, all the panels will be displayed on one page.</td>
</tr>
<tr>
<td>startPage</td><td>0</td><td></td><td>Indicates which page will be opened when the accordion loads, if the panels are displayed on more than one page.</td>
</tr>
</table>

Note: most of the optional modules also have specific properties which you can modify in order to customize the plugin; you can read about them in the <a href="modules.md">Modules</a> chapter.

<h3>2. Public methods</h3>

The public methods below allow you to manipulate the accordion using external controls:

<table>
<tr>
<th>Method name</th><th>Description</th>
</tr>
<tr>
<td>getPanelAt</td><td>Gets all the data of the panel at the specified index. Returns an object that contains all the data specified for that panel.</td>
</tr>
<tr>
<td>getCurrentIndex</td><td>Gets the index of the current panel.</td>
</tr>
<tr>
<td>getTotalPanels</td><td>Gets the total number of panels.</td>
</tr>
<tr>
<td>nextPanel</td><td>Opens the next panel.</td>
</tr>
<tr>
<td>previousPanel</td><td>Opens the previous panel.</td>
</tr>
<tr>
<td>openPanel</td><td>Opens the panel at the specified index.</td>
</tr>
<tr>
<td>closePanels</td><td>Closes all the panels.</td>
</tr>
<tr>
<td>getVisiblePanels</td><td>Gets the number of visible panels.</td>
</tr>
<tr>
<td>getTotalPages</td><td>Gets the number of pages.</td>
</tr>
<tr>
<td>getPage</td><td>Gets the index of the page currently displayed.</td>
</tr>
<tr>
<td>gotoPage</td><td>Opens the specified page.</td>
</tr>
<tr>
<td>nextPage</td><td>Goes to the next page.</td>
</tr>
<tr>
<td>previousPage</td><td>Goes to the previous page.</td>
</tr>
<tr>
<td>on</td><td></td>
</tr>
<tr>
<td>off</td><td></td>
</tr>
<tr>
<td>destroy</td><td>Stops all running actions.</td>
</tr>
<tr>
<td>setProperties({})</td><td></td>
</tr>
<tr>
<td>update()</td><td></td>
</tr>
<tr>
<td>removePanels()</td><td></td>
</tr>
<tr>
<td>resize()</td><td></td>
</tr>
</table>

<h3>3. Callbacks</h3>

Callbacks (or events) are used to detect when certain actions take place:

<table>
<tr>
<th>Callback name</th><th>Description</th>
</tr>
<tr>
<td>accordionMouseOver</td><td>Triggered when the mouse pointer moves over the accordion.</td>
</tr>
<tr>
<td>accordionMouseOut</td><td>Triggered when the mouse pointer leaves the accordion.</td>
</tr>
<tr>
<td>panelClick</td><td>Triggered when a panel is clicked.</td>
</tr>
<tr>
<td>panelMouseOver</td><td>Triggered when the mouse pointer moves over a panel.</td>
</tr>
<tr>
<td>panelMouseOut</td><td>Triggered when the mouse pointer leaves a panel.</td>
</tr>
<tr>
<td>panelOpen</td><td>Triggered when a panel is opened.</td>
</tr>
<tr>
<td>panelsClose</td><td>Triggered when a panel is closed.</td>
</tr>
<tr>
<td>pageScroll</td><td>Triggered when a new page is displayed.</td>
</tr>
<tr>
<td>panelOpenComplete</td><td>Triggered when the opening of a panel is completed.</td>
</tr>
<tr>
<td>panelsCloseComplete</td><td>Triggered when the closing of a panel is completed.</td>
</tr>
<tr>
<td>pageScrollComplete</td><td>Triggered when the opening of a page is completed.</td>
</tr>
<tr>
<td>breakpointReach</td><td>Triggered when a breakpoint is reached.</td>
</tr>
</table>
