A simple HTML canvas animation. You can see this in action at https://carlansell.co.uk.

Features:
* Canvas draw rate independent of system frame rate, allowing system load to be reduced
* Canvas element is hidden when scrolled off screen, stopping all processing and rendering
* Range of settings to customise the animation
* -os version uses an offscreen canvas to improve performance

## How To Use
First, you'll need to choose whether to use the standard, or offscreen variant. The offscreen version is recommended.

Include either 'animation.js' (standard), or 'animation-os-loader.js' (offscreen) in your HTML file.

Provide an empty canvas element in your HTML. By default, the first canvas element will be used.

If the system is struggling with the default configuration, start by setting shadowAmount to 0. Applying a shadow is computationally very expensive, so switching this off can lead to a decent speed up.

## Configuration
Several configuration parameters are provided at the start of the file.

### General Settings
* turnChance: Chance of a line turning on a given move (%)
* minLineSpeed: Minimum number of pixels a line will move in a single cycle (px)
* maxLineSpeed: Maximum number of pixels a line will move in a single cycle (px)
* lineQty: Initial number of lines to draw on the screen
* minLength: Minimum length of a complete line (px)
* maxLength: Minimum length of a complete line (px)
* canvasDrawRate: Frame rate the app will use to draw to the canvas - use an integer factor of the screen refresh rate for a consistent result

### Appearance Settings
* lineWidth: Width of stoke used to draw each line (px)
* lineColour: Colour of each line
* shadowColour: Colour of the shadow applied to each line
* shadowAmount: Size of the shadow applied to each line (px)
* fadeAmount: Percentage of each line to act as a tail, and fade out (%)

### Auto Throttle Settings
* autoThrottle: When enabled, the app will progressively reduce system load
* minLineQty: Minimum number of lines the application will draw
* minCanvasDrawRate: Minimum frame rate used when the system is under severe load - use an integer factor of the screen refresh rate for a consistent result

Separate values for minLength and maxLength are provided for small screens (<800px) by default, to better fit lines to the small screen size.

## Auto Throttling
When turned on, the system will progressively reduce the number of lines the system will draw, each time the frame time exceeds three times the target frame time (1/3 of the target frame rate). Once the system has reached the minimum line quantity, the shadowAmount setting is forced to 0, and the canvas drawing rate is set to the minCanvasDrawRate setting.

There's no science to any of this, rather it is an attempt to provide a smoother experience should a device struggle with the settings applied.

Turning this off will not affect the canvasDrawRate, which will always be used to control the drawing rate.