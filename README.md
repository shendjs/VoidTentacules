# Interactive Tentacle Animation with JavaScript

This project creates an interactive tentacle-like animation using HTML5 Canvas and JavaScript. The effect responds to mouse movements and clicks, generating a mesmerizing visual display of moving tentacles with glowing effects.

## Features
- **Interactive Animation**: Tentacles follow the mouse movement dynamically.
- **Background Stars**: A starry background for added depth.
- **Pulse Effects**: Clicking generates ripple effects for extra visual appeal.
- **Touch Support**: Works on touch devices with tap and drag gestures.
- **Performance Optimized**: Uses requestAnimationFrame for smooth rendering.

## Demo
You can view the live demo by opening the `voidtentacules.html` file in your browser.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/shendjs/VoidTentacules
   ```
2. Navigate to the project folder:
   ```sh
   cd VoidTentacules
   ```
3. Open `voidtentacules.html` in your browser.

## Usage
Simply move your mouse around the canvas to see the tentacles follow your movements. Click to generate a glowing pulse effect.

## Code Overview
- **`init()`**: Initializes the canvas and sets up event listeners.
- **`tentacle` Class**: Manages individual tentacle segments.
- **`draw()`**: Handles rendering, background stars, and pulse effects.
- **`loop()`**: Continuously updates and redraws the animation.

## Customization
You can modify the animation by tweaking the following parameters in the script:
- `numt`: Number of tentacles.
- `maxl` and `minl`: Tentacle length range.
- `bgStars`: Number of background stars.

## Compatibility
This project works on all modern browsers that support HTML5 Canvas and JavaScript.

## License
This project is licensed under the MIT License. Feel free to use and modify it as needed.

## Author
Created by **[Shend]**. Feel free to reach out for any improvements or suggestions!
