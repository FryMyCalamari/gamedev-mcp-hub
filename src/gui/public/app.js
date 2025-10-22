/**
 * GameDev MCP Hub - Frontend Application
 */

// ============================================
// State Management
// ============================================
const state = {
  servers: [],
  clients: [],
  logs: [],
  analytics: {},
  wsConnected: false,
  autoScroll: true,
  currentTab: 'servers',
  currentDocsServer: null,
  intentionalDisconnect: false,
  clientsRefreshInterval: null,
  filters: {
    logLevel: 'all',
    logServer: 'all',
    logSearch: '',
  },
};

// ============================================
// WebSocket Connection
// ============================================
let ws = null;

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[WebSocket] Connected');
    state.wsConnected = true;
    updateConnectionStatus(true);
    fetchInitialData();
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleWebSocketMessage(message);
  };

  ws.onclose = (event) => {
    console.log('[WebSocket] Disconnected', event.code);
    state.wsConnected = false;
    updateConnectionStatus(false);
    
    // Only reconnect if it wasn't a clean close (code 1000 = normal closure)
    // and not a "disconnect all" action
    if (event.code !== 1000 && !state.intentionalDisconnect) {
      console.log('[WebSocket] Will attempt reconnect in 5 seconds...');
      setTimeout(connectWebSocket, 5000);
    } else {
      console.log('[WebSocket] Clean shutdown - not reconnecting');
    }
  };

  ws.onerror = (error) => {
    console.error('[WebSocket] Error:', error);
  };
}

function handleWebSocketMessage(message) {
  const { type, data } = message;

  switch (type) {
    case 'initial-data':
      state.servers = data.servers || [];
      state.analytics = data.analytics || {};
      renderServers();
      renderAnalytics();
      break;

    case 'server-status-update':
      state.servers = data.servers || [];
      renderServers();
      break;

    case 'server-status-changed':
      updateServerStatus(data.serverName, data.status);
      break;

    case 'log-entry':
      addLogEntry(data);
      break;

    case 'analytics-update':
      state.analytics = data;
      renderAnalytics();
      break;

    case 'pong':
      console.log('[WebSocket] Pong received');
      break;

    default:
      console.log('[WebSocket] Unknown message type:', type);
  }
}

function updateConnectionStatus(connected) {
  const dot = document.getElementById('wsStatus');
  const text = document.getElementById('wsStatusText');

  if (connected) {
    dot.classList.add('connected');
    text.textContent = 'CONNECTED';
    text.style.color = 'var(--status-connected)';
  } else {
    dot.classList.remove('connected');
    text.textContent = 'DISCONNECTED';
    text.style.color = 'var(--status-disconnected)';
  }
}

// ============================================
// API Functions
// ============================================
async function fetchInitialData() {
  try {
    const [serversRes, analyticsRes] = await Promise.all([
      fetch('/api/servers'),
      fetch('/api/analytics'),
    ]);

    const serversData = await serversRes.json();
    const analyticsData = await analyticsRes.json();

    state.servers = serversData.servers || [];
    state.analytics = analyticsData.analytics || {};

    renderServers();
    renderAnalytics();
  } catch (error) {
    console.error('[API] Failed to fetch initial data:', error);
  }
}

async function connectServer(name) {
  try {
    const response = await fetch(`/api/servers/${name}/connect`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log('[API] Connect server result:', data);
  } catch (error) {
    console.error(`[API] Failed to connect server ${name}:`, error);
  }
}

async function disconnectServer(name) {
  try {
    const response = await fetch(`/api/servers/${name}/disconnect`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log('[API] Disconnect server result:', data);
  } catch (error) {
    console.error(`[API] Failed to disconnect server ${name}:`, error);
  }
}

async function connectAllServers() {
  try {
    const response = await fetch('/api/servers/connect-all', {
      method: 'POST',
    });
    const data = await response.json();
    console.log('[API] Connect all result:', data);
  } catch (error) {
    console.error('[API] Failed to connect all servers:', error);
  }
}

async function disconnectAllServers() {
  try {
    // Mark as intentional disconnect to prevent reconnection
    state.intentionalDisconnect = true;
    
    const response = await fetch('/api/servers/disconnect-all', {
      method: 'POST',
    });
    const data = await response.json();
    console.log('[API] Disconnect all result:', data);
    
    // Show message to user
    alert('All servers disconnected. You can now safely close the terminal window.\n\nTo reconnect, restart the hub.');
  } catch (error) {
    console.error('[API] Failed to disconnect all servers:', error);
    state.intentionalDisconnect = false;
  }
}

async function fetchServerDocs(serverName) {
  try {
    const response = await fetch(`/api/docs/${serverName}`);
    const data = await response.json();
    return data.docs;
  } catch (error) {
    console.error(`[API] Failed to fetch docs for ${serverName}:`, error);
    return null;
  }
}

async function fetchLogs() {
  try {
    const response = await fetch('/api/logs?limit=100');
    const data = await response.json();
    state.logs = data.logs || [];
    renderLogs();
  } catch (error) {
    console.error('[API] Failed to fetch logs:', error);
  }
}

// ============================================
// Render Functions
// ============================================
function renderServers() {
  const grid = document.getElementById('serversGrid');
  
  if (!state.servers || state.servers.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">NO SERVERS CONFIGURED</p>';
    updateConnectionSummary(0, 0);
    return;
  }

  const connectedCount = state.servers.filter(s => s.status === 'connected').length;
  updateConnectionSummary(connectedCount, state.servers.length);

  grid.innerHTML = state.servers.map(server => {
    const statusClass = server.status === 'connected' ? 'connected' : 
                       server.status === 'error' ? 'error' : 'disconnected';
    
    return `
      <div class="server-card ${statusClass}">
        <div class="server-header">
          <h3 class="server-name">${server.name}</h3>
          <span class="server-status ${statusClass}">${server.status.toUpperCase()}</span>
        </div>
        <div class="server-info">
          <div class="info-row">
            <span class="info-label">TOOLS:</span>
            <span class="info-value">${server.toolCount || 0}</span>
          </div>
          <div class="info-row">
            <span class="info-label">STATUS:</span>
            <span class="info-value">${server.status.toUpperCase()}</span>
          </div>
        </div>
        <div class="server-actions">
          ${server.status === 'connected' 
            ? `<button class="btn btn-secondary btn-small" onclick="disconnectServer('${server.name}')">DISCONNECT</button>`
            : `<button class="btn btn-primary btn-small" onclick="connectServer('${server.name}')">CONNECT</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

function updateConnectionSummary(connected, total) {
  const summary = document.getElementById('connectionSummary');
  summary.textContent = `${connected}/${total} CONNECTED`;
}

// ============================================
// Client Management Functions
// ============================================

async function fetchClients() {
  try {
    const response = await fetch('http://localhost:3000/api/clients');
    const data = await response.json();
    state.clients = data.clients || [];
    renderClients();
  } catch (error) {
    console.error('[API] Failed to fetch clients:', error);
    // Show empty state instead of error
    state.clients = [];
    renderClients();
  }
}

function renderClients() {
  const grid = document.getElementById('clientsGrid');
  
  if (!grid) return; // Grid not in DOM yet
  
  if (!state.clients || state.clients.length === 0) {
    grid.innerHTML = `
      <div class="info-card" style="grid-column: 1/-1; padding: 40px; text-align: center;">
        <h3 style="color: var(--text-muted); margin-bottom: 10px;">No AI clients connected yet</h3>
        <p style="color: var(--text-muted); font-size: 14px;">
          To connect clients, use the SSE endpoint: <code style="background: var(--bg); padding: 4px 8px; border-radius: 4px;">http://localhost:3000/sse</code>
        </p>
        <p style="color: var(--text-muted); font-size: 12px; margin-top: 20px;">
          See <strong>docs/LM_STUDIO_SETUP.md</strong> or <strong>docs/MULTI_CLIENT_SETUP.md</strong> for setup guides.
        </p>
      </div>
    `;
    return;
  }

  function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds/60)}m ${seconds%60}s`;
    const hours = Math.floor(seconds/3600);
    const mins = Math.floor((seconds%3600)/60);
    return `${hours}h ${mins}m`;
  }

  grid.innerHTML = state.clients.map(client => `
    <div class="server-card connected">
      <div class="server-header">
        <h3 class="server-name">🤖 ${escapeHtml(client.name)}</h3>
        <span class="server-status connected">ACTIVE</span>
      </div>
      <div class="server-info">
        <div class="info-row">
          <span class="info-label">CLIENT ID:</span>
          <span class="info-value">${escapeHtml(client.id.substring(0, 16))}...</span>
        </div>
        <div class="info-row">
          <span class="info-label">CONNECTED:</span>
          <span class="info-value">${formatDuration(client.duration)} ago</span>
        </div>
        <div class="info-row">
          <span class="info-label">TOOLS USED:</span>
          <span class="info-value">${client.toolsUsed || 0}</span>
        </div>
        <div class="info-row">
          <span class="info-label">SINCE:</span>
          <span class="info-value">${new Date(client.connectedAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function refreshClients() {
  fetchClients();
}

function startClientsRefresh() {
  // Refresh clients every 5 seconds when on clients tab
  if (state.clientsRefreshInterval) {
    clearInterval(state.clientsRefreshInterval);
  }
  state.clientsRefreshInterval = setInterval(() => {
    if (state.currentTab === 'clients') {
      fetchClients();
    }
  }, 5000);
}

function stopClientsRefresh() {
  if (state.clientsRefreshInterval) {
    clearInterval(state.clientsRefreshInterval);
    state.clientsRefreshInterval = null;
  }
}

function updateServerStatus(serverName, status) {
  const server = state.servers.find(s => s.name === serverName);
  if (server) {
    server.status = status;
    renderServers();
  }
}

function renderLogs() {
  const container = document.getElementById('logsContainer');
  
  const filteredLogs = state.logs.filter(log => {
    const levelMatch = state.filters.logLevel === 'all' || log.level === state.filters.logLevel;
    const searchMatch = !state.filters.logSearch || 
                        log.message.toLowerCase().includes(state.filters.logSearch.toLowerCase());
    return levelMatch && searchMatch;
  });

  if (filteredLogs.length === 0) {
    container.innerHTML = '<div class="log-entry"><span class="log-message" style="color: var(--text-muted);">NO LOGS TO DISPLAY</span></div>';
    return;
  }

  container.innerHTML = filteredLogs.map(log => `
    <div class="log-entry">
      <span class="log-timestamp">${formatTimestamp(log.timestamp)}</span>
      <span class="log-level ${log.level}">[${log.level.toUpperCase()}]</span>
      <span class="log-message">${escapeHtml(log.message)}</span>
    </div>
  `).join('');

  if (state.autoScroll) {
    container.scrollTop = container.scrollHeight;
  }
}

function addLogEntry(log) {
  state.logs.push(log);
  
  // Keep only last 500 logs
  if (state.logs.length > 500) {
    state.logs = state.logs.slice(-500);
  }

  if (state.currentTab === 'logs') {
    renderLogs();
  }
}

function renderAnalytics() {
  const analytics = state.analytics;

  // Update stat cards
  document.getElementById('totalCalls').textContent = analytics.totalCalls || 0;
  document.getElementById('avgLatency').textContent = `${Math.round(analytics.averageLatency || 0)}ms`;
  document.getElementById('totalTokens').textContent = analytics.totalTokens || 0;
  
  const errorRate = analytics.totalCalls > 0 
    ? ((analytics.errors || 0) / analytics.totalCalls * 100).toFixed(2)
    : 0;
  document.getElementById('errorRate').textContent = `${errorRate}%`;

  // Render calls by server bar chart
  renderBarChart('callsByServer', analytics.callsByServer || {});

  // Render top tools table
  renderTopToolsTable(analytics.callsByTool || {});
}

function renderBarChart(containerId, data) {
  const container = document.getElementById(containerId);
  
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  
  if (entries.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted);">NO DATA</p>';
    return;
  }

  const max = Math.max(...entries.map(([_, value]) => value));

  container.innerHTML = entries.map(([label, value]) => {
    const percentage = max > 0 ? (value / max * 100) : 0;
    return `
      <div class="bar-item">
        <span class="bar-label">${label}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="bar-value">${value}</span>
      </div>
    `;
  }).join('');
}

function renderTopToolsTable(callsByTool) {
  const tbody = document.getElementById('topToolsBody');
  
  const entries = Object.entries(callsByTool)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">NO DATA</td></tr>';
    return;
  }

  tbody.innerHTML = entries.map(([tool, calls]) => {
    const serverName = tool.split('__')[0] || 'unknown';
    return `
      <tr>
        <td>${escapeHtml(tool)}</td>
        <td>${calls}</td>
        <td>${serverName}</td>
      </tr>
    `;
  }).join('');
}

async function renderDocs() {
  const menu = document.getElementById('docsMenu');
  
  // Populate server list
  menu.innerHTML = state.servers.map(server => `
    <li data-server="${server.name}" onclick="loadServerDocs('${server.name}')">${server.name}</li>
  `).join('');
}

async function loadServerDocs(serverName) {
  state.currentDocsServer = serverName;
  
  // Update menu selection
  const menuItems = document.querySelectorAll('.docs-menu li');
  menuItems.forEach(item => {
    if (item.dataset.server === serverName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Show loading
  document.getElementById('docsPlaceholder').style.display = 'flex';
  document.getElementById('docsDetail').style.display = 'none';

  // Fetch docs
  const docs = await fetchServerDocs(serverName);
  
  if (!docs) {
    return;
  }

  // Hide placeholder, show details
  document.getElementById('docsPlaceholder').style.display = 'none';
  document.getElementById('docsDetail').style.display = 'block';

  // Populate docs
  document.getElementById('docsServerName').textContent = docs.name || serverName;
  document.getElementById('docsDescription').textContent = docs.description || 'No description available';
  
  const repoLink = document.getElementById('docsRepoLink');
  const docLink = document.getElementById('docsDocLink');
  
  repoLink.href = docs.repository || '#';
  docLink.href = docs.documentation || '#';
  
  if (!docs.repository) repoLink.style.display = 'none';
  else repoLink.style.display = 'inline-block';
  
  if (!docs.documentation) docLink.style.display = 'none';
  else docLink.style.display = 'inline-block';

  // Render tools
  const toolsList = document.getElementById('docsToolsList');
  
  if (!docs.tools || docs.tools.length === 0) {
    toolsList.innerHTML = '<p style="color: var(--text-muted);">NO TOOLS AVAILABLE</p>';
    return;
  }

  toolsList.innerHTML = docs.tools.map(tool => `
    <div class="tool-item">
      <div class="tool-name">${escapeHtml(tool.name)}</div>
      <div class="tool-description">${escapeHtml(tool.description || 'No description')}</div>
    </div>
  `).join('');
}

// ============================================
// Event Handlers
// ============================================
function initializeEventListeners() {
  // Settings toggle
  document.getElementById('settingsToggle').addEventListener('click', openSettings);
  document.getElementById('closeSettings').addEventListener('click', closeSettings);
  
  // Settings sliders
  document.getElementById('headingSize').addEventListener('input', updateHeadingSize);
  document.getElementById('smallTextSize').addEventListener('input', updateSmallTextSize);
  document.getElementById('mediumTextSize').addEventListener('input', updateMediumTextSize);
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
  
  // Close modal on background click
  document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target.id === 'settingsModal') {
      closeSettings();
    }
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Control panel buttons
  document.getElementById('connectAllBtn').addEventListener('click', connectAllServers);
  document.getElementById('disconnectAllBtn').addEventListener('click', disconnectAllServers);

  // Tab navigation
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });

  // Log controls
  document.getElementById('logLevelFilter').addEventListener('change', (e) => {
    state.filters.logLevel = e.target.value;
    renderLogs();
  });

  document.getElementById('logSearchInput').addEventListener('input', (e) => {
    state.filters.logSearch = e.target.value;
    renderLogs();
  });

  document.getElementById('autoScrollCheckbox').addEventListener('change', (e) => {
    state.autoScroll = e.target.checked;
  });

  document.getElementById('clearLogsBtn').addEventListener('click', () => {
    state.logs = [];
    renderLogs();
  });

  document.getElementById('exportLogsBtn').addEventListener('click', exportLogs);
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  
  const icon = document.querySelector('.theme-icon');
  icon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
  
  localStorage.setItem('theme', newTheme);
}

// ============================================
// Settings Functions
// ============================================
function openSettings() {
  document.getElementById('settingsModal').classList.add('active');
  loadSavedSettings();
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('active');
}

function updateHeadingSize(e) {
  const size = e.target.value + 'px';
  document.documentElement.style.setProperty('--heading-size', size);
  document.getElementById('headingSizeValue').textContent = size;
  localStorage.setItem('headingSize', e.target.value);
}

function updateSmallTextSize(e) {
  const size = e.target.value + 'px';
  document.documentElement.style.setProperty('--small-text-size', size);
  document.getElementById('smallTextSizeValue').textContent = size;
  localStorage.setItem('smallTextSize', e.target.value);
}

function updateMediumTextSize(e) {
  const size = e.target.value + 'px';
  document.documentElement.style.setProperty('--medium-text-size', size);
  document.getElementById('mediumTextSizeValue').textContent = size;
  localStorage.setItem('mediumTextSize', e.target.value);
}

function resetSettings() {
  // Reset to defaults
  const defaults = {
    headingSize: 30,
    mediumTextSize: 20,
    smallTextSize: 16
  };
  
  // Update sliders
  document.getElementById('headingSize').value = defaults.headingSize;
  document.getElementById('mediumTextSize').value = defaults.mediumTextSize;
  document.getElementById('smallTextSize').value = defaults.smallTextSize;
  
  // Update CSS variables
  document.documentElement.style.setProperty('--heading-size', defaults.headingSize + 'px');
  document.documentElement.style.setProperty('--medium-text-size', defaults.mediumTextSize + 'px');
  document.documentElement.style.setProperty('--small-text-size', defaults.smallTextSize + 'px');
  
  // Update display values
  document.getElementById('headingSizeValue').textContent = defaults.headingSize + 'px';
  document.getElementById('mediumTextSizeValue').textContent = defaults.mediumTextSize + 'px';
  document.getElementById('smallTextSizeValue').textContent = defaults.smallTextSize + 'px';
  
  // Save to localStorage
  localStorage.setItem('headingSize', defaults.headingSize);
  localStorage.setItem('mediumTextSize', defaults.mediumTextSize);
  localStorage.setItem('smallTextSize', defaults.smallTextSize);
}

function loadSavedSettings() {
  const headingSize = localStorage.getItem('headingSize') || 30;
  const mediumTextSize = localStorage.getItem('mediumTextSize') || 20;
  const smallTextSize = localStorage.getItem('smallTextSize') || 16;
  
  // Update sliders
  document.getElementById('headingSize').value = headingSize;
  document.getElementById('mediumTextSize').value = mediumTextSize;
  document.getElementById('smallTextSize').value = smallTextSize;
  
  // Update display values
  document.getElementById('headingSizeValue').textContent = headingSize + 'px';
  document.getElementById('mediumTextSizeValue').textContent = mediumTextSize + 'px';
  document.getElementById('smallTextSizeValue').textContent = smallTextSize + 'px';
  
  // Apply CSS variables
  document.documentElement.style.setProperty('--heading-size', headingSize + 'px');
  document.documentElement.style.setProperty('--medium-text-size', mediumTextSize + 'px');
  document.documentElement.style.setProperty('--small-text-size', smallTextSize + 'px');
}

function switchTab(tabName) {
  state.currentTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    if (content.id === `${tabName}Tab`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Load data for specific tabs
  if (tabName === 'logs' && state.logs.length === 0) {
    fetchLogs();
  } else if (tabName === 'docs') {
    renderDocs();
  }
}

function exportLogs() {
  const logsText = state.logs.map(log => 
    `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}`
  ).join('\n');

  const blob = new Blob([logsText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mcp-hub-logs-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// Utility Functions
// ============================================
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour12: false });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// Initialization
// ============================================
function init() {
  console.log('[App] Initializing GameDev MCP Hub GUI');

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const icon = document.querySelector('.theme-icon');
  icon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

  // Load saved settings
  loadSavedSettings();

  // Initialize event listeners
  initializeEventListeners();

  // Connect WebSocket
  connectWebSocket();

  // Send periodic ping to keep connection alive
  setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000); // Every 30 seconds
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
