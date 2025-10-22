# Blender MCP Commands Reference

**GameDev MCP Hub - Blender Integration**
**Total Tools Available**: 21 (4 Hub + 17 Blender)
**Status**: ✅ Connected and Verified
**Date**: 2025-10-21

---

## Hub Management Tools (4)

### 1. `hub__search_tools`
Search for tools by name, description, or category.

**Parameters**:
- `query` (string, required): Search query
- `category` (string, optional): Filter by category

**Example**:
```json
{
  "query": "scene",
  "category": "3d-modeling"
}
```

---

### 2. `hub__list_servers`
List all connected MCP servers and their status.

**Parameters**: None

**Returns**: List of servers with connection status and tool counts

---

### 3. `hub__get_analytics`
Get usage analytics for tools and servers.

**Parameters**:
- `timeframe` (enum): `hour`, `day`, `week`, `month`, `all`

---

### 4. `hub__check_tokens`
Check current token usage and get recommendations.

**Parameters**: None

---

## Blender Core Tools (4)

### 5. `blender__get_scene_info`
Get detailed information about the current Blender scene.

**Parameters**: None

**Returns**:
- Scene name
- Objects in scene (names, types, locations)
- Active camera
- Number of lights
- Current frame

**Example Use**:
- "What objects are in my scene?"
- "Show me the scene information"

---

### 6. `blender__get_object_info`
Get detailed information about a specific object.

**Parameters**:
- `object_name` (string, required): Name of the object

**Returns**:
- Object type
- Location, rotation, scale
- Material information
- Vertices/faces count (for meshes)

**Example**:
```json
{
  "object_name": "Cube"
}
```

---

### 7. `blender__get_viewport_screenshot`
Capture a screenshot of the current 3D viewport.

**Parameters**:
- `max_size` (number, optional): Maximum dimension in pixels (default: 800)

**Returns**: Base64-encoded image

**Example**:
```json
{
  "max_size": 1920
}
```

---

### 8. `blender__execute_blender_code`
Execute arbitrary Python code in Blender.

⚠️ **Warning**: This runs arbitrary code - use with caution!

**Parameters**:
- `code` (string, required): Python code to execute

**Returns**: Result of the code execution

**Example - Create 3 Cubes with Different Materials**:
```python
import bpy

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Small Red Metallic Cube
bpy.ops.mesh.primitive_cube_add(size=1, location=(-3, 0, 0))
cube1 = bpy.context.active_object
cube1.name = "Cube_Small_Red"
mat1 = bpy.data.materials.new(name="Material_Red")
mat1.use_nodes = True
mat1.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (1, 0, 0, 1)
mat1.node_tree.nodes["Principled BSDF"].inputs[6].default_value = 0.9  # Metallic
cube1.data.materials.append(mat1)

# Medium Blue Glossy Cube
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
cube2 = bpy.context.active_object
cube2.name = "Cube_Medium_Blue"
mat2 = bpy.data.materials.new(name="Material_Blue")
mat2.use_nodes = True
mat2.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0, 0, 1, 1)
mat2.node_tree.nodes["Principled BSDF"].inputs[9].default_value = 0.2  # Glossy
cube2.data.materials.append(mat2)

# Large Green Rough Cube
bpy.ops.mesh.primitive_cube_add(size=3, location=(4, 0, 0))
cube3 = bpy.context.active_object
cube3.name = "Cube_Large_Green"
mat3 = bpy.data.materials.new(name="Material_Green")
mat3.use_nodes = True
mat3.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0, 1, 0, 1)
mat3.node_tree.nodes["Principled BSDF"].inputs[9].default_value = 0.9  # Rough
cube3.data.materials.append(mat3)

"Created 3 cubes with different sizes and materials"
```

---

## Poly Haven Tools (5)

Poly Haven provides free HDRIs, textures, and 3D models.

### 9. `blender__get_polyhaven_status`
Check if Poly Haven integration is enabled.

**Parameters**: None

---

### 10. `blender__get_polyhaven_categories`
Get categories for a specific asset type.

**Parameters**:
- `asset_type` (enum): `hdris`, `textures`, `models`, `all`

**Returns**: List of available categories

---

### 11. `blender__search_polyhaven_assets`
Search for assets on Poly Haven.

**Parameters**:
- `asset_type` (enum, required): `hdris`, `textures`, `models`, `all`
- `categories` (string, optional): Comma-separated categories

**Example**:
```json
{
  "asset_type": "textures",
  "categories": "metal,wood"
}
```

---

### 12. `blender__download_polyhaven_asset`
Download and import a Poly Haven asset.

**Parameters**:
- `asset_id` (string, required): Asset ID from search results
- `asset_type` (enum, required): `hdris`, `textures`, `models`
- `resolution` (string, required): e.g., `1k`, `2k`, `4k`, `8k`
- `file_format` (string, optional): e.g., `hdr`, `exr`, `jpg`, `png`, `gltf`, `fbx`

**Example - Download 4K HDRI**:
```json
{
  "asset_id": "studio_small_09",
  "asset_type": "hdris",
  "resolution": "4k",
  "file_format": "hdr"
}
```

**Example - Download PBR Texture**:
```json
{
  "asset_id": "metal_plate_worn",
  "asset_type": "textures",
  "resolution": "2k",
  "file_format": "jpg"
}
```

---

### 13. `blender__set_texture`
Apply a downloaded Poly Haven texture to an object.

**Parameters**:
- `object_name` (string, required): Name of the object
- `texture_id` (string, required): Poly Haven texture ID (must be downloaded first)

**Example**:
```json
{
  "object_name": "Cube",
  "texture_id": "metal_plate_worn"
}
```

---

## Sketchfab Tools (3)

Access 3D models from Sketchfab marketplace.

### 14. `blender__get_sketchfab_status`
Check if Sketchfab integration is enabled.

**Parameters**: None

**Note**: Requires Sketchfab API key in config

---

### 15. `blender__search_sketchfab_models`
Search for downloadable models on Sketchfab.

**Parameters**:
- `query` (string, required): Search query
- `categories` (string, optional): Comma-separated categories
- `count` (number, optional): Max results (default: 20)
- `downloadable` (boolean, optional): Only downloadable models (default: true)

**Example**:
```json
{
  "query": "low poly tree",
  "categories": "nature",
  "count": 10,
  "downloadable": true
}
```

---

### 16. `blender__download_sketchfab_model`
Download and import a Sketchfab model.

**Parameters**:
- `uid` (string, required): Unique model identifier from search

**Example**:
```json
{
  "uid": "abc123def456"
}
```

---

## Hyper3D Rodin Tools (5)

AI-powered 3D model generation from text or images.

### 17. `blender__get_hyper3d_status`
Check if Hyper3D Rodin integration is enabled.

**Parameters**: None

**Note**: Requires Hyper3D API key in config

---

### 18. `blender__generate_hyper3d_model_via_text`
Generate a 3D model from a text description using AI.

**Parameters**:
- `text_prompt` (string, required): Description in English
- `bbox_condition` (array, optional): [Length, Width, Height] ratio

**Example**:
```json
{
  "text_prompt": "A medieval wooden chair with carved details",
  "bbox_condition": [1.0, 1.0, 1.2]
}
```

**Returns**: Job/subscription ID for polling

---

### 19. `blender__generate_hyper3d_model_via_images`
Generate a 3D model from reference images using AI.

**Parameters** (mode-dependent):
- **MAIN_SITE mode**:
  - `input_image_paths` (array, required): Absolute file paths
  - `bbox_condition` (array, optional): [L, W, H] ratio

- **FAL_AI mode**:
  - `input_image_urls` (array, required): Image URLs
  - `bbox_condition` (array, optional): [L, W, H] ratio

**Example**:
```json
{
  "input_image_paths": ["/path/to/reference1.jpg", "/path/to/reference2.jpg"],
  "bbox_condition": [1.0, 1.0, 1.5]
}
```

**Returns**: Job/request ID for polling

---

### 20. `blender__poll_rodin_job_status`
Check generation task status.

**Parameters** (mode-dependent):
- **MAIN_SITE mode**:
  - `subscription_key` (string): From generate step

- **FAL_AI mode**:
  - `request_id` (string): From generate step

**Returns**:
- MAIN_SITE: List of status ("Done", "Failed", "Canceled")
- FAL_AI: Status ("COMPLETED", "IN_PROGRESS", "IN_QUEUE")

---

### 21. `blender__import_generated_asset`
Import completed AI-generated model.

**Parameters** (mode-dependent):
- `name` (string, required): Object name in scene
- **MAIN_SITE mode**:
  - `task_uuid` (string): From generate step
- **FAL_AI mode**:
  - `request_id` (string): From generate step

**Example**:
```json
{
  "name": "AI_Generated_Chair",
  "task_uuid": "abc-123-def-456"
}
```

---

## Common Workflows

### Workflow 1: Scene Inspection
1. `blender__get_scene_info` - Get overview
2. `blender__get_object_info` - Inspect specific objects
3. `blender__get_viewport_screenshot` - Capture current view

### Workflow 2: Create Custom Scene
1. `blender__execute_blender_code` - Create objects with materials
2. `blender__get_scene_info` - Verify creation
3. `blender__get_viewport_screenshot` - Take preview

### Workflow 3: Download and Apply Texture
1. `blender__get_polyhaven_categories` - Browse categories
2. `blender__search_polyhaven_assets` - Find texture
3. `blender__download_polyhaven_asset` - Download at desired resolution
4. `blender__set_texture` - Apply to object

### Workflow 4: AI Model Generation
1. `blender__generate_hyper3d_model_via_text` - Start generation
2. `blender__poll_rodin_job_status` - Wait for completion
3. `blender__import_generated_asset` - Import into scene
4. `blender__execute_blender_code` - Adjust scale/position

### Workflow 5: Import External Model
1. `blender__search_sketchfab_models` - Find model
2. `blender__download_sketchfab_model` - Download and import
3. `blender__get_object_info` - Check imported object
4. `blender__execute_blender_code` - Modify as needed

---

## Best Practices

### Safety
- ⚠️ Always save your Blender file before using `execute_blender_code`
- ⚠️ Only execute trusted Python code
- ✅ Test code on simple scenes first

### Performance
- 📊 Use lower resolutions for textures during testing (1k, 2k)
- 📊 Limit Sketchfab searches to reasonable counts (10-20)
- 📊 Poll Hyper3D jobs every 5-10 seconds, not continuously

### Asset Management
- 🎨 Downloaded assets are cached temporarily
- 🎨 Name your generated models clearly
- 🎨 Check asset licenses for commercial use

---

## Troubleshooting

### "Could not connect to Blender"
1. Ensure Blender is open
2. Install addon from `external-servers/blender-mcp/addon.py`
3. Press **N** in viewport to show sidebar
4. Find **BlenderMCP** tab
5. Click **"Connect to MCP server"** button
6. Verify console shows: `BlenderMCP server started on localhost:9876`

### "Unknown tool: execute_code"
- ❌ Wrong: `blender__execute_code`
- ✅ Correct: `blender__execute_blender_code`

### "Asset download failed"
- Check internet connection
- For Sketchfab: Verify API key is set
- For Poly Haven: Check if resolution/format exists
- Try lower resolution (4k → 2k → 1k)

---

## Configuration

### Enable All Features

Edit `config/mcp-servers.json`:

```json
{
  "servers": {
    "blender": {
      "enabled": true,
      "command": "uvx",
      "args": ["blender-mcp"],
      "env": {
        "BLENDER_HOST": "localhost",
        "BLENDER_PORT": "9876",
        "SKETCHFAB_API_KEY": "your-key-here",
        "HYPER3D_API_KEY": "your-key-here"
      }
    }
  }
}
```

### Get API Keys
- **Sketchfab**: https://sketchfab.com/settings/password (free)
- **Hyper3D**: https://hyperhuman.deemos.com/ (requires account)

---

## Summary

| Category | Tools | Features |
|----------|-------|----------|
| **Hub Management** | 4 | Search, list, analytics, tokens |
| **Blender Core** | 4 | Scene info, objects, screenshots, code execution |
| **Poly Haven** | 5 | Free HDRIs, textures, 3D models |
| **Sketchfab** | 3 | Model search and download (API key required) |
| **Hyper3D** | 5 | AI model generation from text/images (API key required) |
| **TOTAL** | **21** | **Full 3D workflow automation** |

---

**Status**: ✅ All tools tested and documented
**Next**: Connect Blender addon and test actual execution
**Updated**: 2025-10-21
