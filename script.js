const PREFIX = "subtitles-for-your-voice";
const LANG = 'ja-JP';

function setupRecognition(lang) {
  const recognition = new webkitSpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onstart = function() {
    console.log('recognition start');
  }

  recognition.onerror = function() {
    console.log(event.error);
  }

  recognition.onend = function() {
    console.log('recognition end');

    if (state === 'start') {
      recognition.start();
    }
  }

  recognition.onresult = function(event) {
    const root = getActiveElementRoot();

    for (const container of root.getElementsByClassName(`${PREFIX}-container`)) {
      let finalSpan = container.childNodes[0];
      let interimSpan = container.childNodes[1];
      let interimTranscript = '';
      let finalTranscript = finalSpan.innerHTML;

      for (var i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      finalSpan.innerHTML = linebreak(finalTranscript);
      interimSpan.innerHTML = linebreak(interimTranscript);

      container.scrollTop = container.scrollHeight;
    };
  }

  return recognition;
}

const TWO_LINE = /\n\n/g;
const ONE_LINE = /\n/g;

function linebreak(s) {
  return s.replace(TWO_LINE, '<p></p>').replace(ONE_LINE, '<br>');
}

function getActiveElementRoot() {
  if (document.webkitFullscreenElement) {
    return document.webkitFullscreenElement;
  } else {
    return document.body;
  }
}

function createSubtitleElement() {
  const container = document.createElement("div");
  const finalSpan = document.createElement("span");
  const interimSpan = document.createElement("span");

  container.className = `${PREFIX}-container`;
  finalSpan.className = `${PREFIX}-final-span`;
  interimSpan.className = `${PREFIX}-interim-span`;

  container.appendChild(finalSpan);
  container.appendChild(interimSpan);

  return container;
}

function removeSubtitleElement() {
  const root = getActiveElementRoot();

  for (const container of root.getElementsByClassName(`${PREFIX}-container`)) {
    container.parentNode.removeChild(container);
  }
}

let recognition = null;
let state = "stop";

function start(lang) {
  if (document.body.getElementsByClassName(`${PREFIX}-container`).length === 0) {
    document.body.appendChild(createSubtitleElement());

    console.log("Append subtitles to body.");
  }

  if (!recognition) {
    recognition = setupRecognition(lang);
  }

  state = "start";
  recognition.start();
}

function stop() {
  state = "stop";

  if (!recognition) {
    recognition.stop();
  }

  removeSubtitleElement();
}

document.onwebkitfullscreenchange = function(event) {
  console.log('onfullscreenchange');

  if (state === 'start' && document.webkitFullscreenElement && document.webkitFullscreenElement.getElementsByClassName(`${PREFIX}-container`).length === 0) {
    document.webkitFullscreenElement.appendChild(createSubtitleElement());
    console.log("Append subtitles to webkitFullscreenElement.");
  }
};

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.key) {
    case "state":
      sendResponse(state);
      return true;

    case "start":
      start(request.lang);
      sendResponse(state);
      return true;

    case "stop":
      stop();
      sendResponse(state);
      return true;

    default:
      sendResponse('failed');
      return true;
  }
});
