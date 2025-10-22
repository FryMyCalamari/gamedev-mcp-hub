# Blender MCP Adapter

**Complete Blender 3D integration for GameDev MCP Hub**

## Overview

The Blender adapter provides full control over Blender 3D through the Model Context Protocol, enabling AI-powered 3D modeling, scene creation, rendering, and asset management.

## Features

### ✅ Core Features (Always Available)

- **Scene Inspection** - Get complete information about the current Blender scene
- **Object Manipulation** - Query and inspect specific objects in detail
- **Python Code Execution** - Run arbitrary Python code in Blender for unlimited possibilities
- **Viewport Screenshots** - Capture high-resolution screenshots of the 3D viewport

### 🎨 Asset Integration (Optional - Enable in Blender addon)

#### Poly Haven Integration ✅ FREE
- **704+ Free Textures** across 50+ categories
- **HDRIs** for realistic lighting
- **3D Models** - PBR-ready assets
- **Material Application** - One-click texture assignment

#### Hyper3D Rodin 🤖 AI-POWERED
- **Text-to-3D** - Generate 3D models from text descriptions
- **Image-to-3D** - Convert images to 3D models
- **Built-in Materials** - Generated models come with materials
- **Job Polling** - Track generation progress

#### Sketchfab 📦 MARKETPLACE
- **Search Models** - Access vast model library
- **Downloadable Content** - Import directly into Blender
- **API Key Required** - Free API key from Sketchfab

## Installation

### 1. Install Blender Addon

```bash
# Addon location
external-servers/blender-mcp/addon.py
```

**In Blender**:
1. Edit → Preferences → Add-ons
2. Click "Install..."
3. Select `addon.py`
4. Enable "Interface: Blender MCP"
5. Press **N** in viewport to show sidebar
6. Find "BlenderMCP" tab
7. Click **"Connect to MCP server"**

### 2. Configure Hub

Edit `config/mcp-servers.json`:

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

### 3. Optional: Enable Advanced Features

In Blender BlenderMCP panel:
- ☑ **Use assets from Poly Haven** - Free textures/models/HDRIs
- ☑ **Use Hyper3D Rodin** - AI 3D generation (requires API key)
- ☑ **Use assets from Sketchfab** - Model marketplace (requires API key)

## Available Commands (17 Tools)

### Core Tools (4)

#### `blender__get_scene_info`
Get detailed information about the current scene.

**Returns**:
- Scene name
- Object count and list (name, type, location)
- Materials count
- Active camera

**Example**:
```javascript
{
  "name": "Scene",
  "object_count": 5,
  "objects": [
    {"name": "Cube", "type": "MESH", "location": [0, 0, 0]}
  ],
  "materials_count": 3
}
```

---

#### `blender__get_object_info`
Get detailed information about a specific object.

**Parameters**:
- `object_name` (string, required) - Name of the object

**Returns**:
- Object type
- Location, rotation, scale
- Material information
- Vertex/face counts (for meshes)

---

#### `blender__get_viewport_screenshot`
Capture a screenshot of the 3D viewport.

**Parameters**:
- `max_size` (number, optional) - Maximum dimension in pixels (default: 800)

**Returns**: Base64-encoded PNG image

**Example**:
```json
{
  "max_size": 1920
}
```

---

#### `blender__execute_blender_code`
Execute arbitrary Python code in Blender.

⚠️ **Warning**: Runs arbitrary code - save your work first!

**Parameters**:
- `code` (string, required) - Python code to execute

**Example** - Create 3 Cubes:
```python
import bpy

# Small Red Metallic Cube
bpy.ops.mesh.primitive_cube_add(size=1, location=(-4, 0, 0))
cube = bpy.context.active_object
cube.name = "Cube_Red"
mat = bpy.data.materials.new(name="Material_Red")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs['Base Color'].default_value = (1, 0, 0, 1)
bsdf.inputs['Metallic'].default_value = 0.9
cube.data.materials.append(mat)
```

---

### Poly Haven Tools (5)

#### `blender__get_polyhaven_status`
Check if Poly Haven integration is enabled.

---

#### `blender__get_polyhaven_categories`
Get categories for an asset type.

**Parameters**:
- `asset_type` (enum) - `hdris`, `textures`, `models`, `all`

**Returns**: List of categories with asset counts

---

#### `blender__search_polyhaven_assets`
Search for assets.

**Parameters**:
- `asset_type` (enum, required) - `hdris`, `textures`, `models`, `all`
- `categories` (string, optional) - Comma-separated categories

---

#### `blender__download_polyhaven_asset`
Download and import an asset.

**Parameters**:
- `asset_id` (string, required)
- `asset_type` (enum, required)
- `resolution` (string, required) - `1k`, `2k`, `4k`, `8k`
- `file_format` (string, optional) - `hdr`, `exr`, `jpg`, `png`, `gltf`, `fbx`

---

#### `blender__set_texture`
Apply a texture to an object.

**Parameters**:
- `object_name` (string, required)
- `texture_id` (string, required) - Must be downloaded first

---

### Sketchfab Tools (3)

#### `blender__get_sketchfab_status`
Check if Sketchfab integration is enabled.

---

#### `blender__search_sketchfab_models`
Search for models.

**Parameters**:
- `query` (string, required)
- `categories` (string, optional)
- `count` (number, optional) - Default: 20
- `downloadable` (boolean, optional) - Default: true

---

#### `blender__download_sketchfab_model`
Download and import a model.

**Parameters**:
- `uid` (string, required) - Model UID from search

---

### Hyper3D Tools (5)

#### `blender__get_hyper3d_status`
Check if Hyper3D integration is enabled.

---

#### `blender__generate_hyper3d_model_via_text`
Generate 3D model from text description.

**Parameters**:
- `text_prompt` (string, required) - English description
- `bbox_condition` (array, optional) - `[Length, Width, Height]` ratio

**Returns**: Job ID for polling

---

#### `blender__generate_hyper3d_model_via_images`
Generate 3D model from images.

**Parameters** (mode-dependent):
- **MAIN_SITE**: `input_image_paths` (array)
- **FAL_AI**: `input_image_urls` (array)
- `bbox_condition` (array, optional)

---

#### `blender__poll_rodin_job_status`
Check generation job status.

**Parameters** (mode-dependent):
- **MAIN_SITE**: `subscription_key`
- **FAL_AI**: `request_id`

---

#### `blender__import_generated_asset`
Import completed AI-generated model.

**Parameters**:
- `name` (string, required)
- **MAIN_SITE**: `task_uuid`
- **FAL_AI**: `request_id`

---

## Creative Examples

### Example 1: Algorithmic Spiral
```python
import bpy
import math

num_spheres = 20
for i in range(num_spheres):
    angle = (i / num_spheres) * 4 * math.pi
    radius = i * 0.5
    x = radius * math.cos(angle)
    y = radius * math.sin(angle)
    z = i * 0.3

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, location=(x, y, z))
    sphere = bpy.context.active_object

    # Rainbow coloring
    import colorsys
    rgb = colorsys.hsv_to_rgb(i / num_spheres, 0.8, 1.0)
    mat = bpy.data.materials.new(name=f"Mat_{i}")
    mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (*rgb, 1)
    sphere.data.materials.append(mat)
```

### Example 2: Simple Character
```python
import bpy

# Body
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.5))
body = bpy.context.active_object
body.scale = (0.8, 0.4, 1.2)

# Head
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.4, location=(0, 0, 3))

# Arms (cylinders at sides)
bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=1.2, location=(-1, 0, 1.5))
arm_left = bpy.context.active_object
arm_left.rotation_euler = (0, 1.57, 0)

# ... continue for legs, eyes, etc.
```

### Example 3: Procedural Grid
```python
import bpy

shapes = ['cube', 'sphere', 'cone', 'cylinder', 'torus']
grid_size = 5

for x in range(grid_size):
    for y in range(grid_size):
        shape_type = shapes[(x + y) % len(shapes)]
        location = (x * 2.5, y * 2.5, 0)

        if shape_type == 'cube':
            bpy.ops.mesh.primitive_cube_add(location=location)
        elif shape_type == 'sphere':
            bpy.ops.mesh.primitive_uv_sphere_add(location=location)
        # ... etc
```

## Workflows

### Workflow 1: Scene Creation
1. `execute_blender_code` - Create objects
2. `get_scene_info` - Verify creation
3. `get_viewport_screenshot` - Capture result

### Workflow 2: Texture Application
1. `get_polyhaven_categories` - Browse textures
2. `search_polyhaven_assets` - Find specific texture
3. `download_polyhaven_asset` - Download at resolution
4. `set_texture` - Apply to object

### Workflow 3: AI Model Generation
1. `generate_hyper3d_model_via_text` - Start job
2. `poll_rodin_job_status` - Wait for completion
3. `import_generated_asset` - Import model
4. `execute_blender_code` - Adjust position/scale

## Best Practices

### Safety
- ⚠️ **Save before executing code** - Always save your Blender file first
- ⚠️ **Test code incrementally** - Run small chunks, not large scripts
- ✅ **Use try/except blocks** - Handle errors gracefully

### Performance
- 📊 **Start with low resolutions** - Test with 1k/2k before 4k/8k
- 📊 **Limit search results** - Don't request 100+ models at once
- 📊 **Poll reasonably** - Check job status every 5-10 seconds

### Organization
- 🎨 **Name objects clearly** - Use descriptive names
- 🎨 **Group related objects** - Use collections
- 🎨 **Clean up materials** - Remove unused materials

## Troubleshooting

### "Could not connect to Blender"
1. ✓ Is Blender running?
2. ✓ Is addon installed and enabled?
3. ✓ Did you click "Connect to MCP server"?
4. ✓ Check port 9876 is not blocked

### "Unknown tool: execute_code"
- Use `blender__execute_blender_code` (not `execute_code`)

### Asset download fails
- Check internet connection
- Verify API keys (Sketchfab, Hyper3D)
- Try lower resolution
- Check asset exists

### Port already in use
1. Change port in Blender addon settings
2. Update `BLENDER_PORT` in hub config
3. Restart Blender and hub

## Technical Details

### Architecture
```
Claude / AI
    ↓ stdio
GameDev MCP Hub
    ↓ stdio
blender-mcp server (uvx)
    ↓ TCP:9876
Blender + Addon
```

### Communication
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: stdio (Hub ↔ blender-mcp), TCP (blender-mcp ↔ Blender)
- **Port**: 9876 (default, configurable)

### Requirements
- Blender 3.0+
- Python 3.10+
- uv package manager
- Internet (for asset downloads)

## References

- **Blender MCP Repository**: https://github.com/ahujasid/blender-mcp
- **Poly Haven**: https://polyhaven.com/
- **Sketchfab API**: https://sketchfab.com/developers
- **Hyper3D Rodin**: https://hyperhuman.deemos.com/
- **Full Integration Guide**: `/docs/BLENDER_INTEGRATION.md`
- **Command Reference**: `/docs/BLENDER_COMMANDS.md`

---

**Status**: ✅ Production Ready
**Tools**: 17
**Asset Libraries**: 3 (Poly Haven, Hyper3D, Sketchfab)
**Last Updated**: 2025-10-21
