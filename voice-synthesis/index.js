// Load the JSON file with commands and responses
let commands = {};

// Fetch the JSON data
fetch('commands.json')
  .then(response => response.json())
  .then(data => {
    commands = data;
  })
  .catch(error => console.error('Error loading commands:', error));

const voiceBtn = document.querySelector("#voice-btn");
const micIcon = document.querySelector("#mic-icon");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let synth = window.speechSynthesis;
let selectedVoice;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  voiceBtn.addEventListener("click", () => {
    if (recognition) {
      recognition.start();
    }
  });

  recognition.onstart = () => {
    micIcon.style.display = 'block'; // Show mic icon when listening
  };

  recognition.onend = () => {
    micIcon.style.display = 'none'; // Hide mic icon when not listening
  };

  recognition.onresult = (e) => {
    const transcript = e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
    let utter = new SpeechSynthesisUtterance();

    // Set the voice to the selected voice
    if (selectedVoice) {
      utter.voice = selectedVoice;
    }

    if (transcript in commands) {
      recognition.stop();
      utter.text = commands[transcript];
      synth.speak(utter);
    } else {
      recognition.stop();
      utter.text = "I didn't catch that. Could you please repeat?";
      synth.speak(utter);
    }

    utter.onend = () => {
      recognition.start(); // Restart voice recognition after the response
    };
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error detected: ' + event.error);
  };

  recognition.onnomatch = () => {
    let utter = new SpeechSynthesisUtterance("I didn't recognize that. Could you please say it again?");
    synth.speak(utter);
  };
} else {
  console.error("Sorry, your browser does not support speech recognition.");
  alert("Speech recognition is not supported in your browser. Please try using Google Chrome or Microsoft Edge.");
}

// Ensure voice feature stops when facial recognition is stopped
document.getElementById("stop-btn").addEventListener("click", () => {
  if (recognition) {
    recognition.stop();
  }
});

// Load available voices and set a default voice
window.speechSynthesis.onvoiceschanged = () => {
  const voices = synth.getVoices();
  // console.log(voices); // Display available voice options
  
  // Select a voice based on your preference, e.g., selecting an English-speaking female voice
  selectedVoice = voices.find(voice => voice.name.includes('Google UK English Female')) || voices[0]; // Fallback to the first voice if not found
};
