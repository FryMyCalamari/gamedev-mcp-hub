# 🔷 How to Run the Blender Script

**Script Location**: `D:\Power\gamedev-mcp-hub\experiments\blender-test-script.py`

---

## Method 1: Using Blender's UI (Easiest)

### Step 1: Open Scripting Workspace
- At the top of Blender, click **"Scripting"** tab
- (It's next to Layout, Modeling, Sculpting, etc.)

### Step 2: Load the Script
- In the scripting area, click **"Open"** button (folder icon)
- Navigate to: `D:\Power\gamedev-mcp-hub\experiments\`
- Select `blender-test-script.py`
- Click **"Open"**

### Step 3: Run the Script
- Click the **▶ "Run Script"** button (top of text editor)
- OR press **Alt + P**

### Step 4: View Results
- Click **"Layout"** tab at the top
- You should see:
  - ✨ Crystal with spikes
  - 🚀 Spaceship
  - 🗿 Abstract sculpture
- Press **Numpad 0** to view from camera
- Press **Z** → **Rendered** to see with lighting

---

## Method 2: From Blender Console

### If Blender is Already Open:
1. Go to **Window** → **Toggle System Console**
2. In Blender, open **Scripting** tab
3. In the console at bottom, type:
```python
import bpy
filename = r"D:\Power\gamedev-mcp-hub\experiments\blender-test-script.py"
exec(compile(open(filename).read(), filename, 'exec'))
```
4. Press **Enter**

---

## Method 3: Command Line (New Blender Instance)

### Fresh Start with Script:
```powershell
cd "C:\Program Files\Blender Foundation\Blender 4.0"
.\blender.exe --python "D:\Power\gamedev-mcp-hub\experiments\blender-test-script.py"
```

**Note**: Adjust Blender path if your version is different

---

## Method 4: Quick Copy-Paste

### Just Copy the Code:
1. Open `blender-test-script.py` in any text editor
2. **Select All** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. In Blender:
   - Go to **Scripting** tab
   - Click **+ New** (if needed)
   - **Paste** code (Ctrl+V)
   - Click **▶ Run Script**

---

## Troubleshooting

### "No module named bpy"
- You're running Python outside Blender
- Use Blender's built-in Python (methods 1-3)

### Script Runs But Nothing Happens
- Switch to **Layout** tab to see objects
- Press **Home** key to frame all objects
- Check **Outliner** (top right) for created objects

### Can't Find the Script
- Make sure path is correct:
  ```
  D:\Power\gamedev-mcp-hub\experiments\blender-test-script.py
  ```
- Use File Explorer to verify file exists

### Blender Crashes
- Script is complex - might take 10-15 seconds
- Check system console for errors
- Try Method 4 (copy-paste) instead

---

## What the Script Creates

### 1. Crystal Structure
- Central glowing crystal (cyan)
- 8 radiating spikes
- Emission material

### 2. Spaceship
- Hull, cockpit, wings
- Two engine modules
- Orange engine glow
- Metallic materials

### 3. Abstract Sculpture
- 8-level twisted tower
- Gradient materials (purple → cyan)
- Metallic finish

### 4. Lighting
- 3-point lighting setup
- Cyan key light
- Warm fill light
- Purple rim light

### 5. Camera
- Positioned for optimal view
- Depth of field enabled
- 50mm lens

---

## After Running Script

### To Render:
1. Press **F12** (render current frame)
2. Or: **Render** menu → **Render Image**

### To Adjust:
- Select objects in viewport
- Press **G** to move, **R** to rotate, **S** to scale
- Modify materials in **Shading** workspace

### To Export:
- **File** → **Export** → Choose format (FBX, OBJ, etc.)
- Save to your game project folder

---

## Quick Reference

**Keyboard Shortcuts**:
- **Alt + P**: Run script (in Scripting tab)
- **Numpad 0**: Camera view
- **Z**: Viewport shading menu
- **Home**: Frame all objects
- **F12**: Render
- **Shift + A**: Add object

**Workspace Tabs** (top):
- **Layout**: General view/edit
- **Modeling**: Mesh editing
- **Scripting**: Run Python scripts
- **Shading**: Material editing
- **Rendering**: Render settings

---

## Need Help?

- Check Blender console: **Window** → **Toggle System Console**
- See error messages there
- Script prints progress: "✓ Crystal created" etc.

**Ready to create 3D magic!** 🎨✨
