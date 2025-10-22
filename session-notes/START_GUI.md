# 🚀 Quick Start - Web GUI

Get the GameDev MCP Hub GUI running in under 2 minutes!

## ⚡ Fast Start

```bash
# 1. Build the project (first time only)
npm run build

# 2. Start the hub
npm start

# 3. Open your browser
# Navigate to: http://localhost:3100
```

## ✅ What You'll See

### Upon Successful Start
You should see console output similar to:
```
[INFO ] Starting GameDev MCP Hub...
[INFO ] Configuration loaded: gamedev-mcp-hub v0.1.0
[INFO ] Hub initialized with X connected servers
[INFO ] Total tools available: XXX
[GUI  ] Server running on http://127.0.0.1:3100
[GUI  ] Access dashboard at http://localhost:3100
[GUI  ] SECURITY: Server bound to localhost only - not accessible from network
[GUI  ] WebSocket server initialized
[INFO ] GameDev MCP Hub is running on stdio transport
```

### Dashboard Features
Once the browser opens, you'll have access to:

1. **🔌 SERVERS Tab** (Default)
   - View all MCP server connections
   - See real-time status (Connected/Disconnected/Error)
   - Connect/disconnect individual servers with buttons
   - Monitor tool counts per server

2. **📝 LOGS Tab**
   - Live streaming logs from all servers
   - Filter by log level (DEBUG/INFO/WARN/ERROR)
   - Search through log messages
   - Export logs to file

3. **📊 ANALYTICS Tab**
   - Total calls and average latency
   - Token usage tracking
   - Error rate monitoring
   - Top tools by usage

4. **📖 DOCS Tab**
   - Browse MCP server documentation
   - View available tools per server
   - Links to repositories and official docs

## 🎨 Interface Features

### Theme Toggle
Click the 🌙/☀️ button in the header to switch between:
- **Dark Theme**: Hacker-inspired with neon green accents
- **Light Theme**: Clean high-contrast design

Your preference is saved automatically!

### Real-time Updates
- Server status updates every 2 seconds
- Logs stream in real-time
- Analytics refresh automatically
- WebSocket connection status shown in header

## 🔧 Troubleshooting

### GUI won't start?
**Check config**: Ensure `config/hub-config.json` has:
```json
{
  "features": {
    "rest_api": true,
    "websocket": true
  }
}
```

### Port already in use?
If port 3100 is occupied, change it in `src/gui/gui-server.ts`:
```typescript
const guiServer = new GuiServer(hubServer, 3100); // Change this number
```

### Can't connect from other devices?
**By design!** The GUI is bound to localhost (127.0.0.1) only for security.

To access from network (NOT RECOMMENDED without security):
1. See production security requirements in `docs/GUI.md`
2. Implement authentication and HTTPS
3. Change bind address in `src/gui/gui-server.ts`

### WebSocket connection failing?
1. Check browser console for errors
2. Ensure no firewall blocking localhost connections
3. Try disabling browser extensions
4. Refresh the page

### Logs not showing?
1. Verify logs are being generated (check `logs/hub.log`)
2. Check log level filter (set to "ALL LEVELS")
3. Clear filters and refresh

## 🎮 First Steps

### 1. Check Server Status
- Look at the SERVERS tab
- Note which servers are connected
- Try disconnecting and reconnecting a server

### 2. Monitor Logs
- Switch to LOGS tab
- Watch real-time log entries
- Try different filters (INFO, ERROR, etc.)
- Search for specific terms

### 3. View Analytics
- Go to ANALYTICS tab
- See which servers are being used
- Check error rates
- Review top tools

### 4. Browse Documentation
- Open DOCS tab
- Click on a server name
- View available tools
- Check links to repositories

## 📚 Learn More

- **Full GUI Documentation**: [docs/GUI.md](docs/GUI.md)
- **API Reference**: See REST API endpoints in GUI docs
- **WebSocket Protocol**: Real-time event specifications
- **Security Notes**: Important for production use

## 🎯 Common Use Cases

### Development Workflow
1. Start hub with GUI
2. Open dashboard in browser
3. Connect needed MCP servers
4. Monitor connections while coding
5. View logs for debugging

### Server Testing
1. Use SERVERS tab to manually connect/disconnect
2. Watch LOGS for connection issues
3. Check ANALYTICS for performance
4. Verify tool availability in DOCS

### Demonstration
1. Open GUI in presentation mode
2. Show real-time server management
3. Display live logs and analytics
4. Browse server capabilities

## 💡 Pro Tips

### Keyboard Shortcuts
- `Ctrl/Cmd + F`: Search in logs (when focused)
- `Ctrl/Cmd + R`: Refresh page (reconnects WebSocket)

### Multi-Monitor Setup
- Keep GUI open on second monitor
- Monitor logs while developing
- Quick glance at server status

### Log Management
- Use log level filters to reduce noise
- Export logs before clearing for records
- Toggle auto-scroll off to review past logs

### Theme Customization
- Dark theme: Better for long sessions
- Light theme: Better in bright environments
- Theme preference is saved per browser

## 🐛 Known Issues

### None Yet!
The GUI is newly released. If you encounter issues:
1. Check `logs/hub.log` for errors
2. Review browser console (F12)
3. Verify configuration
4. See troubleshooting section above

## 🔄 Updates

Check for updates regularly:
```bash
git pull origin main
npm install
npm run build
npm start
```

## 🤝 Feedback

Found a bug? Have a feature request?
- Open an issue on GitHub
- Include browser version and console errors
- Screenshots are helpful!

---

**Enjoy the GUI!** 🎮✨

For detailed documentation, see [docs/GUI.md](docs/GUI.md)
