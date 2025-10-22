# Blender MCP Integration Guide

## Overview

This guide explains how to integrate the **blender-mcp** server with the GameDev MCP Hub, enabling AI assistants to control Blender for 3D modeling, scene creation, and rendering.

## Architecture

```
┌────────────────────────────────────────┐
│  Claude / AI Assistant                  │
└──────────────┬─────────────────────────┘
               │ stdio
┌──────────────▼─────────────────────────┐
│  GameDev MCP Hub                        │
│  (D:\Power\gamedev-mcp-hub)            │
└──────────────┬─────────────────────────┘
               │ stdio
┌──────────────▼─────────────────────────┐
│  blender-mcp server                     │
│  (via uvx blender-mcp)                 │
└──────────────┬─────────────────────────┘
               │ TCP Socket (port 9876)
┌──────────────▼─────────────────────────┐
│  Blender + MCP Addon                    │
│  (D:\Program Files (x86)\blender.exe)  │
└────────────────────────────────────────┘
```

## Prerequisites

- ✅ **Blender 3.0+** - Found at `D:\Program Files (x86)\blender.exe`
- ✅ **Python 3.10+** - Required for blender-mcp server
- ✅ **uv package manager** - Already installed (v0.8.23)
- ✅ **blender-mcp server** - Installed via `uvx blender-mcp`

## Installation Steps

### 1. Install the Blender Addon

The addon file is located at:
```
D:\Power\gamedev-mcp-hub\external-servers\blender-mcp\addon.py
```

**Installation in Blender:**

1. Open Blender
2. Go to **Edit → Preferences → Add-ons**
3. Click **"Install..."** button
4. Navigate to and select `addon.py`
5. Enable the checkbox next to **"Interface: Blender MCP"**
6. The addon is now installed!

### 2. Configure the Blender Addon

After installation:

1. In the 3D Viewport, press **N** to show the sidebar (if hidden)
2. Find the **"BlenderMCP"** tab
3. Configure settings:
   - **Port**: 9876 (default - matches blender-mcp server)
   - **Use assets from Poly Haven**: ☐ (optional - free 3D assets)
   - **Use Hyper3D Rodin**: ☐ (optional - AI-generated 3D models)
   - **Use assets from Sketchfab**: ☐ (optional - requires API key)

### 3. Start the Blender Socket Server

In the BlenderMCP panel:

1. Click **"Connect to MCP server"** button
2. Blender console should show: `BlenderMCP server started on localhost:9876`
3. The addon creates a TCP socket server that listens for commands

**IMPORTANT**: Keep Blender running with this connection active!

### 4. Configure the GameDev MCP Hub

Create production config at `config/mcp-servers.json`:

```json
{
  "servers": {
    "blender": {
      "enabled": true,
      "command": "uvx",
      "args": ["blender-mcp"],
      "category": "3d-modeling",
      "priority": "high",
      "auto_reconnect": true,
      "retry_attempts": 3,
      "timeout": 30000,
      "description": "Blender 3D modeling and animation integration",
      "env": {
        "BLENDER_HOST": "localhost",
        "BLENDER_PORT": "9876"
      }
    }
  }
}
```

### 5. Test the Integration

1. **Start Blender** and enable the addon connection
2. **Run the GameDev MCP Hub**:
   ```bash
   cd D:\Power\gamedev-mcp-hub
   npm start
   ```
3. **Check logs** - should show:
   - Hub: "Connected to 1 servers"
   - blender-mcp: "Connected to Blender on localhost:9876"
4. **Test with Claude**:
   - "List the objects in my Blender scene"
   - "Create a cube in Blender"
   - "Get scene information from Blender"

## Available Features

### Base Features (Always Available)

- **Scene Inspection**: Get information about the current scene
- **Object Information**: Query specific objects
- **Viewport Screenshots**: Capture 3D viewport images
- **Execute Code**: Run arbitrary Python code in Blender

### Optional Features

#### Poly Haven Integration
Free assets (HDRIs, textures, 3D models):
- Search for assets by category
- Download HDRIs for lighting
- Download PBR textures
- Import 3D models
- Apply textures to objects

#### Hyper3D Rodin
AI-generated 3D models:
- Create 3D models from text prompts
- Generate models from images
- Poll job status
- Import generated assets

#### Sketchfab Integration
Access 3D model marketplace:
- Search for downloadable models
- Download and import models
- Requires free Sketchfab API key

## Tools Available (37 total)

### Scene Management
- `get_scene_info` - Get current scene information
- `get_object_info` - Get specific object details
- `get_viewport_screenshot` - Capture viewport image
- `execute_code` - Run Python code in Blender

### Poly Haven (if enabled)
- `get_polyhaven_status` - Check if enabled
- `get_polyhaven_categories` - List asset categories
- `search_polyhaven_assets` - Search for assets
- `download_polyhaven_asset` - Download HDRI/texture/model
- `set_texture` - Apply texture to object

### Hyper3D (if enabled)
- `get_hyper3d_status` - Check if enabled
- `create_rodin_job` - Generate 3D model from prompt/image
- `poll_rodin_job_status` - Check generation status
- `import_generated_asset` - Import generated model

### Sketchfab (if enabled)
- `get_sketchfab_status` - Check if enabled
- `search_sketchfab_models` - Search models
- `download_sketchfab_model` - Download and import model

## Environment Variables

Configure in hub config or system:

```env
# Blender MCP Server
BLENDER_HOST=localhost
BLENDER_PORT=9876

# Optional: Blender executable path
BLENDER_EXECUTABLE=D:\Program Files (x86)\blender.exe
```

## Best Practices

### Performance
- **Limit object queries**: Scene info returns max 10 objects
- **Use categories**: Filter Poly Haven searches by category
- **Close unused connections**: Stop addon when not in use

### Security
- **Code execution**: The `execute_code` tool runs arbitrary Python
  - Save your work before using
  - Only use with trusted prompts
- **Asset downloads**: Poly Haven/Sketchfab downloads temporary files
  - Files are cleaned up automatically
  - Check disk space for large models

### Workflow
1. **Start Blender first**: Addon must be running
2. **Then start hub**: Hub connects to blender-mcp
3. **Then use Claude**: AI can now control Blender
4. **Keep Blender open**: Connection stays active

## Troubleshooting

### "Failed to connect to Blender"
- ✓ Is Blender running?
- ✓ Is the addon installed and enabled?
- ✓ Did you click "Connect to MCP server" in Blender?
- ✓ Is port 9876 available (not blocked by firewall)?

### "No tools available from blender"
- ✓ Check blender-mcp server logs
- ✓ Restart Blender addon connection
- ✓ Verify hub config has correct command/args

### "Asset download failed"
- ✓ Check internet connection
- ✓ For Sketchfab: Verify API key is correct
- ✓ For Poly Haven: Check if asset exists and resolution available

### Port Already in Use
If port 9876 is taken:
1. Change port in Blender addon settings
2. Update `BLENDER_PORT` in hub config
3. Restart both Blender and hub

## Advanced Configuration

### Custom Port
```json
{
  "env": {
    "BLENDER_HOST": "localhost",
    "BLENDER_PORT": "9999"
  }
}
```

Then change port in Blender addon to match.

### Enable All Features
```json
{
  "env": {
    "BLENDER_HOST": "localhost",
    "BLENDER_PORT": "9876",
    "SKETCHFAB_API_KEY": "your_key_here",
    "HYPER3D_API_KEY": "your_key_here"
  }
}
```

## File Locations

- **Addon**: `D:\Power\gamedev-mcp-hub\external-servers\blender-mcp\addon.py`
- **Blender**: `D:\Program Files (x86)\blender.exe`
- **Hub Config**: `D:\Power\gamedev-mcp-hub\config\mcp-servers.json`
- **Server**: Installed via `uvx` (managed by uv package manager)

## References

- **Blender MCP Repository**: https://github.com/ahujasid/blender-mcp
- **Poly Haven API**: https://polyhaven.com/
- **Sketchfab API**: https://sketchfab.com/developers
- **Hyper3D Rodin**: https://hyperhuman.deemos.com/

## Next Steps

After setup:
1. Test with simple scene queries
2. Try downloading a Poly Haven texture
3. Apply texture to a cube
4. Take a viewport screenshot
5. Share results with the team!

---

**Created**: 2025-10-21
**Status**: Production Ready
**Testing**: Required before first use
