// Get references to DOM elements
const video = document.getElementById("video"); // Video element where the stream will be displayed
const startBtn = document.getElementById("start-btn"); // Start button to begin video recording
const stopBtn = document.getElementById("stop-btn"); // Stop button to end video recording
let stream = null; // Variable to hold the media stream
let canvas = null; // Variable to hold the canvas for drawing face detections

// Load face-api.js models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"), // Load Tiny Face Detector model
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"), // Load Face Landmark 68 model
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"), // Load Face Recognition model
  faceapi.nets.faceExpressionNet.loadFromUri("/models"), // Load Face Expression model
  faceapi.nets.ageGenderNet.loadFromUri("/models"), // Load Age and Gender model
]).then(() => {
  // Add event listeners to buttons after models are loaded
  startBtn.addEventListener('click', startRecording); // Start recording when start button is clicked
  stopBtn.addEventListener('click', stopRecording); // Stop recording when stop button is clicked
});

// Function to start video recording
function startRecording() {
  // Prevent starting a new stream if one is already active
  if (stream) {
    return;
  }

  // Request access to the user's camera
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((newStream) => {
      // Set the video element's source to the new stream
      stream = newStream;
      video.srcObject = stream;

      // Event listener to handle when the video starts playing
      video.addEventListener("play", () => {
        // Create and append canvas to the body if it doesn't exist
        if (!canvas) {
          canvas = faceapi.createCanvasFromMedia(video);
          document.body.append(canvas);
          faceapi.matchDimensions(canvas, { height: video.height, width: video.width });
        }

        // Set up a periodic function to run face detection
        setInterval(async () => {
          // Perform face detection, landmarks, expressions, age, and gender detection
          const detection = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions().withAgeAndGender();
          // Clear previous canvas content
          canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

          // Resize detection results to match video dimensions
          const resizedWindow = faceapi.resizeResults(detection, {
            height: video.height,
            width: video.width,
          });

          // Draw detections, landmarks, and expressions on the canvas
          faceapi.draw.drawDetections(canvas, resizedWindow);
          faceapi.draw.drawFaceLandmarks(canvas, resizedWindow);
          faceapi.draw.drawFaceExpressions(canvas, resizedWindow);

          // Draw labels with age and gender information
          resizedWindow.forEach((detection) => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: Math.round(detection.age) + " year old " + detection.gender,
            });
            drawBox.draw(canvas);
          });

          console.log(detection); // Log detection results to the console
        }, 100); // Run detection every 100 milliseconds
      });
    })
    .catch((error) => {
      console.log(error); // Log any errors that occur during media access
    });
}

// Function to stop video recording
function stopRecording() {
  // Check if there's an active stream
  if (stream) {
    // Stop all tracks in the media stream
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null; // Clear the video source
    stream = null; // Reset the stream variable
    if (canvas) {
      canvas.remove(); // Remove the canvas from the DOM
      canvas = null; // Reset the canvas variable
    }
  }
}
