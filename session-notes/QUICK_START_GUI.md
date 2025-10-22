# 🚀 Quick Start - GUI Dashboard

Get your GameDev MCP Hub GUI running in **30 seconds!**

## ⚡ Three Ways to Start

### Option 1: Double-Click Batch File (Easiest!)

**Windows users - just double-click one of these:**

1. **`start-gui.bat`** - Builds and starts the hub (console stays open)
2. **`start-gui-with-browser.bat`** - Builds, starts, AND opens browser automatically! ✨

That's it! The browser will open to `http://localhost:3100` automatically.

---

### Option 2: PowerShell Script (Recommended)

Right-click **`start-gui.ps1`** → "Run with PowerShell"

Or in PowerShell terminal:
```powershell
.\start-gui.ps1
```

This will:
- ✅ Build the project (if needed)
- ✅ Start the hub
- ✅ Open your browser automatically
- ✅ Clean shutdown when you press Ctrl+C

---

### Option 3: NPM Commands (For developers)

In your terminal:

```bash
# Build and start (simple)
npm run gui

# Or just start if already built
npm start

# Then open browser to:
# http://localhost:3100
```

---

## 📋 First Time Setup

**Only needed once:**

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

After that, just use any of the startup methods above!

---

## 🎮 What You'll See

### Terminal Output:
```
[INFO ] Starting GameDev MCP Hub...
[INFO ] Configuration loaded: gamedev-mcp-hub v0.1.0
[INFO ] Hub initialized with X connected servers
[GUI  ] Server running on http://127.0.0.1:3100
[GUI  ] Access dashboard at http://localhost:3100
[GUI  ] WebSocket server initialized
```

### Browser Dashboard:
- 🔌 **SERVERS** - View and control all MCP server connections
- 📝 **LOGS** - Live streaming logs with filters
- 📊 **ANALYTICS** - Usage statistics and performance
- 📖 **DOCS** - Browse documentation for each server

---

## 🛑 How to Stop

Press **`Ctrl + C`** in the terminal window

Or just close the terminal/command prompt window.

---

## ❓ Troubleshooting

### "Site can't be reached"
**Solution:** The hub isn't started yet. Use one of the startup scripts above!

### "Port 3100 is already in use"
**Solution:** 
1. Close any other instance of the hub
2. Or change the port in `src/gui/gui-server.ts` (line 31)

### "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/ (v20 or higher)

### Scripts won't run / Permission denied
**Solution (PowerShell):**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Build fails
**Solution:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

---

## 🎨 Tips

### Keep GUI Open While Working
- Start the hub in one terminal
- Keep browser tab open on second monitor
- Monitor logs and server status in real-time

### Theme Toggle
- Click the 🌙/☀️ button in header
- Dark theme = Hacker aesthetic
- Light theme = Clean design

### Auto-Scroll Logs
- Enable "AUTO-SCROLL" in Logs tab
- Logs will follow new entries automatically

### Export Logs
- Go to LOGS tab
- Click "EXPORT" button
- Saves to `.txt` file

---

## 📁 File Guide

| File | Purpose |
|------|---------|
| `start-gui.bat` | Simple batch launcher (console) |
| `start-gui-with-browser.bat` | Batch launcher + auto-open browser |
| `start-gui.ps1` | PowerShell launcher (best experience) |
| `package.json` | Contains `npm run gui` script |

---

## 🎯 Next Steps

1. ✅ **Start the hub** using any method above
2. ✅ **Open browser** to http://localhost:3100
3. ✅ **Explore the tabs** - Servers, Logs, Analytics, Docs
4. ✅ **Try connecting/disconnecting** servers
5. ✅ **Switch themes** - dark/light toggle
6. ✅ **Read full guide** - See [docs/GUI.md](docs/GUI.md)

---

## 🔗 Documentation Links

- **Full GUI Guide**: [docs/GUI.md](docs/GUI.md)
- **Implementation Details**: [docs/GUI_IMPLEMENTATION_SUMMARY.md](docs/GUI_IMPLEMENTATION_SUMMARY.md)
- **Main README**: [README.md](README.md)

---

## 💡 Quick Commands Reference

```bash
# Build project
npm run build

# Start hub
npm start

# Build + Start
npm run gui

# Development mode (watch for changes)
npm run dev

# Clean build
npm run clean && npm run build
```

---

**🎮 Ready to go! Double-click `start-gui-with-browser.bat` and enjoy! ✨**
