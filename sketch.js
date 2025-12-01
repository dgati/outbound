// Set the video capture as a global variable.
let capture;

function setup() {
  describe('Video capture from the device webcam.');
  createCanvas(360, 400);

  // Use the createCapture() function to access the device's
  // camera and start capturing video.
  capture = createCapture(VIDEO);

  // Make the capture frame half of the canvas.
  capture.size(360, 200);

  // Use capture.hide() to remove the p5.Element object made
  // using createCapture(). The video will instead be rendered as
  // an image in draw().
  capture.hide();
}

function draw() {
  // Set the background to gray.
  background(51);

  // Draw the resulting video capture on the canvas
  // with the invert filter applied.
  image(capture, 0, 0, 360, 400);

  // Experiment with applying filters  to the video!
  filter(INVERT);

  // here are some filter options to play with: 
  // INVERT - what does this do?
  // THRESHOLD - Pixels with a grayscale value above a given threshold are converted to white. 
  // The rest are converted to black. The threshold must be between 0.0 (black) and 1.0 (white).
  // POSTERIZE -Limits the number of colors in the image. Each color channel is limited to the number of colors specified. 
  // Values between 2 and 255 are valid, but results are most noticeable with lower values. The default value is 4.
   
  // filter(THRESHOLD, 0.7);
  // filter(POSTERIZE, 2.5);
  
}
