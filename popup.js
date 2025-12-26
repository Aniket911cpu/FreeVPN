document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const powerBtn = document.getElementById('power-btn');
  const locationSelect = document.getElementById('location-select');
  const statusText = document.getElementById('status-text');
  const statusSubtext = document.getElementById('status-subtext');
  const statusDot = document.querySelector('.status-dot');
  const timerDisplay = document.getElementById('timer');
  const ipDisplay = document.getElementById('ip-address');

  // Sidebar Elements
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const closeSidebarBtn = document.getElementById('close-sidebar');

  // Speed Elements
  const speedDown = document.getElementById('speed-down');
  const speedUp = document.getElementById('speed-up');

  // State Variables
  let timerInterval;
  let speedInterval;
  let startTime;

  // --- 1. Initialization ---
  chrome.storage.local.get(['isConnected', 'selectedLocation', 'startTime'], (data) => {
    const isConnected = data.isConnected ?? false;
    const savedLocation = data.selectedLocation ?? 'us';

    locationSelect.value = savedLocation;
    updateUI(isConnected);

    if (isConnected && data.startTime) {
      startTime = data.startTime;
      startTimer();
      startSpeedMonitor();
    }

    // Setup initial side state
    sidebar.classList.add('closed');
  });

  fetchIP();

  // --- 2. Sidebar Logic ---
  function toggleSidebar(show) {
    if (show) {
      sidebar.classList.remove('closed');
      overlay.classList.remove('hidden');
    } else {
      sidebar.classList.add('closed');
      overlay.classList.add('hidden');
    }
  }

  menuBtn.addEventListener('click', () => toggleSidebar(true));
  closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
  overlay.addEventListener('click', () => toggleSidebar(false));

  // --- 3. Power Button Logic ---
  powerBtn.addEventListener('click', () => {
    chrome.storage.local.get(['isConnected'], (data) => {
      const newState = !data.isConnected;
      chrome.storage.local.set({ isConnected: newState });

      if (newState) {
        // Connect
        const now = Date.now();
        chrome.storage.local.set({ startTime: now });
        startTime = now;
        startTimer();
        startSpeedMonitor(); // Start simulating speed
      } else {
        // Disconnect
        stopTimer();
        stopSpeedMonitor();
        chrome.storage.local.remove('startTime');
        timerDisplay.textContent = "00:00:00";
      }
      updateUI(newState);
    });
  });

  // --- 4. Location Logic ---
  locationSelect.addEventListener('change', () => {
    const newLocation = locationSelect.value;
    chrome.storage.local.set({ selectedLocation: newLocation });
    // Optional: Update flag icon here based on selection
  });

  // --- 5. Helper Functions ---

  function updateUI(isConnected) {
    if (isConnected) {
      powerBtn.classList.add('active');
      statusText.textContent = "PROTECTED";
      statusSubtext.textContent = "Your connection is secure";
      statusDot.classList.add('active');
    } else {
      powerBtn.classList.remove('active');
      statusText.textContent = "UNPROTECTED";
      statusSubtext.textContent = "Your IP is visible to websites";
      statusDot.classList.remove('active');
      speedDown.textContent = "0.0 MB/s";
      speedUp.textContent = "0.0 MB/s";
    }
  }

  // Timer Logic
  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      timerDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }, 1000);
  }
  function stopTimer() { clearInterval(timerInterval); }
  function pad(num) { return num.toString().padStart(2, '0'); }

  // Speed Simulation Logic (Realtime feel)
  function startSpeedMonitor() {
    clearInterval(speedInterval);
    // Update speed every 1.5 seconds to simulate traffic fluctuations
    speedInterval = setInterval(() => {
      // Generate random "traffic" between 0.5 MB/s and 15.0 MB/s
      const down = (Math.random() * 15 + 0.5).toFixed(1);
      const up = (Math.random() * 5 + 0.1).toFixed(1);

      speedDown.textContent = `${down} MB/s`;
      speedUp.textContent = `${up} MB/s`;
    }, 1500);
  }
  function stopSpeedMonitor() { clearInterval(speedInterval); }

  // IP Fetcher
  function fetchIP() {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => { ipDisplay.textContent = data.ip; })
      .catch(() => { ipDisplay.textContent = "Offline"; });
  }
});