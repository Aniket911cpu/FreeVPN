document.addEventListener('DOMContentLoaded', () => {
    const powerBtn = document.getElementById('power-btn');
    const locationSelect = document.getElementById('location-select');
    const statusIndicator = document.getElementById('status-indicator');
  
    // 1. Load saved state from storage when popup opens
    chrome.storage.local.get(['isConnected', 'selectedLocation'], (data) => {
      const isConnected = data.isConnected ?? false;
      const savedLocation = data.selectedLocation ?? 'us';
  
      // Update UI elements to match state
      powerBtn.checked = isConnected;
      locationSelect.value = savedLocation;
      updateStatusUI(isConnected);
    });
  
    // 2. Handle Power Button Toggle
    powerBtn.addEventListener('change', () => {
      const isConnected = powerBtn.checked;
      updateStatusUI(isConnected);
      
      // Save state to storage (Background script will see this change and act)
      chrome.storage.local.set({ isConnected: isConnected });
    });
  
    // 3. Handle Location Change
    locationSelect.addEventListener('change', () => {
      const newLocation = locationSelect.value;
      
      // Save new location (Background script will update proxy if currently connected)
      chrome.storage.local.set({ selectedLocation: newLocation });
    });
  
    // Helper to update text/colors
    function updateStatusUI(isConnected) {
      if (isConnected) {
        statusIndicator.textContent = "Protected";
        statusIndicator.classList.add('protected');
      } else {
        statusIndicator.textContent = "Unprotected";
        statusIndicator.classList.remove('protected');
      }
    }
  });