# ⚡ HOW TO START THE HUB

## 🎯 The ONLY Way You Should Start It

### Quick Start (Recommended)

**Double-click this file**:
```
start-gui-with-browser.bat
```

**That's it!** The hub starts and browser opens automatically.

---

## What This Does

1. ✅ Checks if Node.js is installed
2. ✅ Installs dependencies if needed
3. ✅ Builds project if needed
4. ✅ Starts hub with **SSE transport** (multi-client)
5. ✅ Opens browser to http://localhost:3100
6. ✅ All 7 servers connect automatically

---

## Alternative (No Browser)

**If you don't want browser to open**:
```
start-gui.bat
```

Then manually go to http://localhost:3100

---

## ❌ DON'T Use These

~~`npm start`~~ - Uses old single-client mode  
~~`npm run start:sse`~~ - No auto-browser open  
~~Random commands from AI~~ - Just use the .bat files!

---

## After First Rube Authentication

**Rube will open browser for OAuth** (one-time):
1. Let it open Composio page
2. Sign in and authorize apps
3. Return to hub
4. Done! Never asks again

---

## If Something Breaks

1. **Close terminal** (Ctrl+C or close window)
2. **Re-run** `start-gui-with-browser.bat`
3. Everything reconnects automatically

---

## 📊 What You'll See

**Terminal**:
```
GameDev MCP Hub - GUI Launcher
Building project...
Starting hub...
Opening browser in 5 seconds...
```

**Browser** (http://localhost:3100):
- SERVERS tab → All 7 servers listed
- CLIENTS tab → Connected AI clients
- TOOLS tab → Available tools
- SETTINGS tab → Configuration

---

## 🎮 Accessing the Hub

**From LM Studio**:
- Use SSE endpoint: `http://localhost:3000/sse`
- The .bat file already starts SSE mode!

**From Claude Desktop**:
- Add custom MCP server: `http://localhost:3000/sse`

**From any AI client**:
- SSE URL: `http://localhost:3000/sse`
- GUI URL: `http://localhost:3100`

---

## 🔄 Memory Management

**The hub includes automatic cleanup**:
- Stale clients removed every 5 minutes
- All timers cleared on shutdown
- No memory leaks!

**Typical usage**: 150-250 MB (hub process)

**See**: `docs/MEMORY_MANAGEMENT.md` for details

---

## 🎯 Summary

**Single source of truth**: `start-gui-with-browser.bat`

**That's the ONLY command you need to remember!**

Double-click it, wait 5 seconds, start coding! 🚀
