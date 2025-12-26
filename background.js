// Server Configuration - REPLACE these with real, active proxy IPs
const VPN_SERVERS = {
  us: {
    name: "United States",
    host: "192.168.1.101", // PLACEHOLDER IP
    port: 1080,
    scheme: "socks5"
  },
  uk: {
    name: "United Kingdom",
    host: "192.168.1.102", // PLACEHOLDER IP
    port: 8080,
    scheme: "http"
  },
  de: {
    name: "Germany",
    host: "192.168.1.103", // PLACEHOLDER IP
    port: 443,
    scheme: "https"
  }
};

// Listen for changes in storage (triggered by the Popup UI)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // If connection status or location changed, update the proxy
    if (changes.isConnected || changes.selectedLocation) {
      updateProxySettings();
    }
  }
});

// Function to read state and apply settings
function updateProxySettings() {
  chrome.storage.local.get(['isConnected', 'selectedLocation'], (data) => {
    const isConnected = data.isConnected ?? false;
    const locationKey = data.selectedLocation ?? 'us';
    
    if (isConnected) {
      const server = VPN_SERVERS[locationKey];
      enableProxy(server);
    } else {
      disableProxy();
    }
  });
}

// Enable Proxy Mode
function enableProxy(server) {
  const config = {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: server.scheme,
        host: server.host,
        port: parseInt(server.port)
      },
      // Direct connection for localhost to avoid breaking local dev work
      bypassList: ["localhost", "127.0.0.1", "::1"]
    }
  };

  chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
    console.log(`VPN Enabled: Connected to ${server.name} via ${server.scheme}`);
    setIconState(true);
  });
}

// Disable Proxy (Direct Connection)
function disableProxy() {
  const config = { mode: "system" }; // Reverts to system/browser default
  
  chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
    console.log("VPN Disabled: Direct Connection");
    setIconState(false);
  });
}

// Helper to visually change the badge on the browser icon
function setIconState(active) {
  const text = active ? "ON" : "OFF";
  const color = active ? "#4CAF50" : "#666666";
  
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color });
}

// Initialize on install/startup
chrome.runtime.onStartup.addListener(updateProxySettings);
chrome.runtime.onInstalled.addListener(() => {
    // Set default state on install
    chrome.storage.local.set({ isConnected: false, selectedLocation: 'us' });
});