chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { key: "state" }, function(response) {
    const button = document.getElementById('button');

    if (response === 'start') {
      button.innerHTML = 'Stop';
      button.addEventListener("click", function() {
        // TODO: Refactoring
        chrome.tabs.sendMessage(tabs[0].id, { key: 'stop' }, function(response) {
          if (response != "failed") {
            button.innerHTML = 'Start';
            window.close();
          } else {
            button.innerHTML = 'Error';
          }

          return true;
        });
      });
    }

    if (response === 'stop') {
      button.innerHTML = 'Start';
      button.addEventListener("click", function() {
        chrome.tabs.sendMessage(tabs[0].id, { key: 'start', lang: 'ja-JP' }, function(response) {
          if (response != "failed") {
            button.innerHTML = 'Stop';
            window.close();
          } else {
            button.innerHTML = 'Error';
          }

          return true;
        });
      });
    }
  });
});
