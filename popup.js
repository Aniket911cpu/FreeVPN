document.addEventListener("DOMContentLoaded", () => {
  const powerBtn = document.querySelector(".power-btn");
  const statusText = document.querySelector(".status h2");
  const statusDot = document.querySelector(".dot");

  let isConnected = false;

  // Load saved state
  chrome.storage.local.get(["isConnected"], (data) => {
    isConnected = data.isConnected ?? false;
    updateUI(isConnected);
  });

  // Power button click
  powerBtn.addEventListener("click", () => {
    isConnected = !isConnected;

    chrome.storage.local.set({ isConnected });
    updateUI(isConnected);
  });

  function updateUI(connected) {
    if (connected) {
      statusText.textContent = "PROTECTED";
      statusDot.style.background = "#30e87a";
      statusDot.style.boxShadow = "0 0 10px #30e87a";
      powerBtn.style.boxShadow = "0 0 50px rgba(48,232,122,0.6)";
    } else {
      statusText.textContent = "UNPROTECTED";
      statusDot.style.background = "#ff4d4d";
      statusDot.style.boxShadow = "0 0 10px #ff4d4d";
      powerBtn.style.boxShadow = "0 0 40px rgba(48,232,122,0.3)";
    }
  }
});
