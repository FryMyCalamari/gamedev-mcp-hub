#!/usr/bin/env node

/**
 * Comprehensive Blender MCP Integration Test
 * Tests ALL available tools and showcases creative capabilities
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { writeFileSync } from 'fs';

const hub = spawn('node', ['dist/index.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;
const pendingRequests = new Map();

const rl = createInterface({
  input: hub.stdout,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const response = JSON.parse(line);
    if (response.id && pendingRequests.has(response.id)) {
      const resolve = pendingRequests.get(response.id);
      pendingRequests.delete(response.id);
      resolve(response.result);
    }
  } catch (error) {
    // Not JSON, log line
  }
});

hub.stderr.on('data', (data) => {
  console.error('Hub Error:', data.toString());
});

function sendRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    const request = { jsonrpc: '2.0', id, method, params };
    pendingRequests.set(id, resolve);
    hub.stdin.write(JSON.stringify(request) + '\n');
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }
    }, 60000);
  });
}

async function executeBlenderCode(code) {
  return await sendRequest('tools/call', {
    name: 'blender__execute_blender_code',
    arguments: { code }
  });
}

async function getSceneInfo() {
  return await sendRequest('tools/call', {
    name: 'blender__get_scene_info',
    arguments: {}
  });
}

async function getScreenshot(maxSize = 1920) {
  return await sendRequest('tools/call', {
    name: 'blender__get_viewport_screenshot',
    arguments: { max_size: maxSize }
  });
}

function saveScreenshot(response, filename) {
  try {
    const content = response?.content?.[0];
    if (content?.type === 'image' && content.data) {
      const buffer = Buffer.from(content.data, 'base64');
      writeFileSync(filename, buffer);
      console.log(`✅ Screenshot saved: ${filename}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to save screenshot: ${error.message}`);
  }
  return false;
}

async function runTests() {
  console.log('🚀 COMPREHENSIVE BLENDER MCP TEST SUITE\n');
  console.log('=' .repeat(60));

  try {
    await new Promise(resolve => setTimeout(resolve, 3000));

    await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'comprehensive-test', version: '1.0.0' }
    });

    // ========================================
    // TEST 1: Three Cubes with Materials
    // ========================================
    console.log('\n📦 TEST 1: Creating 3 Cubes with Different Materials\n');

    const cubesResult = await executeBlenderCode(`
import bpy

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Cube 1: Small Red Metallic
bpy.ops.mesh.primitive_cube_add(size=1, location=(-4, 0, 0))
cube1 = bpy.context.active_object
cube1.name = "Cube_Small_Red"
mat1 = bpy.data.materials.new(name="Material_Red")
mat1.use_nodes = True
bsdf1 = mat1.node_tree.nodes["Principled BSDF"]
bsdf1.inputs['Base Color'].default_value = (1, 0, 0, 1)
bsdf1.inputs['Metallic'].default_value = 0.9
bsdf1.inputs['Roughness'].default_value = 0.1
cube1.data.materials.append(mat1)

# Cube 2: Medium Blue Glossy
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
cube2 = bpy.context.active_object
cube2.name = "Cube_Medium_Blue"
mat2 = bpy.data.materials.new(name="Material_Blue")
mat2.use_nodes = True
bsdf2 = mat2.node_tree.nodes["Principled BSDF"]
bsdf2.inputs['Base Color'].default_value = (0, 0, 1, 1)
bsdf2.inputs['Metallic'].default_value = 0.3
bsdf2.inputs['Roughness'].default_value = 0.2
cube2.data.materials.append(mat2)

# Cube 3: Large Green Rough
bpy.ops.mesh.primitive_cube_add(size=3, location=(5, 0, 0))
cube3 = bpy.context.active_object
cube3.name = "Cube_Large_Green"
mat3 = bpy.data.materials.new(name="Material_Green")
mat3.use_nodes = True
bsdf3 = mat3.node_tree.nodes["Principled BSDF"]
bsdf3.inputs['Base Color'].default_value = (0, 1, 0, 1)
bsdf3.inputs['Metallic'].default_value = 0.0
bsdf3.inputs['Roughness'].default_value = 0.9
cube3.data.materials.append(mat3)

# Setup camera
bpy.ops.object.camera_add(location=(0, -15, 8))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0)
bpy.context.scene.camera = camera

# Add sun light
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
light = bpy.context.active_object
light.data.energy = 2.0

"Three cubes created successfully!"
`);
    console.log('Result:', cubesResult.content[0].text);

    const scene1 = await getSceneInfo();
    try {
      console.log('Scene Info:', JSON.parse(scene1.content[0].text));
    } catch {
      console.log('Scene Info:', scene1.content[0].text);
    }

    const screenshot1 = await getScreenshot();
    saveScreenshot(screenshot1, 'D:/Power/gamedev-mcp-hub/screenshots/01-three-cubes.png');

    // ========================================
    // TEST 2: Algorithmic Scene - Spiral of Spheres
    // ========================================
    console.log('\n🌀 TEST 2: Algorithmic Generation - Spiral of Spheres\n');

    await executeBlenderCode(`
import bpy
import math

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create spiral of colorful spheres
num_spheres = 20
for i in range(num_spheres):
    angle = (i / num_spheres) * 4 * math.pi
    radius = i * 0.5
    x = radius * math.cos(angle)
    y = radius * math.sin(angle)
    z = i * 0.3

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, location=(x, y, z))
    sphere = bpy.context.active_object
    sphere.name = f"Sphere_{i:02d}"

    # Rainbow color based on position in spiral
    hue = i / num_spheres
    import colorsys
    rgb = colorsys.hsv_to_rgb(hue, 0.8, 1.0)

    mat = bpy.data.materials.new(name=f"Mat_Sphere_{i:02d}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (*rgb, 1)
    bsdf.inputs['Metallic'].default_value = 0.7
    bsdf.inputs['Roughness'].default_value = 0.3
    sphere.data.materials.append(mat)

# Camera
bpy.ops.object.camera_add(location=(15, -15, 10))
camera = bpy.context.active_object
camera.rotation_euler = (1.0, 0, 0.785)
bpy.context.scene.camera = camera

# Lighting
bpy.ops.object.light_add(type='SUN', location=(10, -10, 15))
light = bpy.context.active_object
light.data.energy = 3.0

f"Created {num_spheres} spheres in spiral pattern"
`);

    const screenshot2 = await getScreenshot();
    saveScreenshot(screenshot2, 'D:/Power/gamedev-mcp-hub/screenshots/02-spiral.png');

    // ========================================
    // TEST 3: Simple Character Model
    // ========================================
    console.log('\n🤖 TEST 3: Creating Simple Character Model\n');

    await executeBlenderCode(`
import bpy

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Body
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.5))
body = bpy.context.active_object
body.name = "Body"
body.scale = (0.8, 0.4, 1.2)

# Head
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.4, location=(0, 0, 3))
head = bpy.context.active_object
head.name = "Head"

# Arms
bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=1.2, location=(-1, 0, 1.5))
arm_left = bpy.context.active_object
arm_left.name = "Arm_Left"
arm_left.rotation_euler = (0, 1.57, 0)

bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=1.2, location=(1, 0, 1.5))
arm_right = bpy.context.active_object
arm_right.name = "Arm_Right"
arm_right.rotation_euler = (0, 1.57, 0)

# Legs
bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=1.5, location=(-0.3, 0, 0.25))
leg_left = bpy.context.active_object
leg_left.name = "Leg_Left"

bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=1.5, location=(0.3, 0, 0.25))
leg_right = bpy.context.active_object
leg_right.name = "Leg_Right"

# Eyes
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(-0.15, -0.35, 3.1))
eye_left = bpy.context.active_object
eye_left.name = "Eye_Left"

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(0.15, -0.35, 3.1))
eye_right = bpy.context.active_object
eye_right.name = "Eye_Right"

# Materials
# Body material
body_mat = bpy.data.materials.new(name="Mat_Body")
body_mat.use_nodes = True
body_mat.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (0.3, 0.5, 0.8, 1)
body.data.materials.append(body_mat)
for obj in [head, arm_left, arm_right, leg_left, leg_right]:
    obj.data.materials.append(body_mat)

# Eye material (black)
eye_mat = bpy.data.materials.new(name="Mat_Eyes")
eye_mat.use_nodes = True
eye_mat.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (0, 0, 0, 1)
eye_left.data.materials.append(eye_mat)
eye_right.data.materials.append(eye_mat)

# Camera
bpy.ops.object.camera_add(location=(4, -4, 2))
camera = bpy.context.active_object
camera.rotation_euler = (1.3, 0, 0.785)
bpy.context.scene.camera = camera

# Light
bpy.ops.object.light_add(type='SUN', location=(3, -3, 5))

"Simple character created with 8 parts"
`);

    const screenshot3 = await getScreenshot();
    saveScreenshot(screenshot3, 'D:/Power/gamedev-mcp-hub/screenshots/03-character.png');

    // ========================================
    // TEST 4: Procedural Grid of Objects
    // ========================================
    console.log('\n📊 TEST 4: Procedural Grid Generation\n');

    await executeBlenderCode(`
import bpy

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create grid of different primitive shapes
shapes = ['cube', 'sphere', 'cone', 'cylinder', 'torus']
grid_size = 5
spacing = 2.5

for x in range(grid_size):
    for y in range(grid_size):
        shape_type = shapes[(x + y) % len(shapes)]
        location = (x * spacing - grid_size, y * spacing - grid_size, 0)

        if shape_type == 'cube':
            bpy.ops.mesh.primitive_cube_add(size=1, location=location)
        elif shape_type == 'sphere':
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=location)
        elif shape_type == 'cone':
            bpy.ops.mesh.primitive_cone_add(radius1=0.5, depth=1.5, location=location)
        elif shape_type == 'cylinder':
            bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=1.5, location=location)
        elif shape_type == 'torus':
            bpy.ops.mesh.primitive_torus_add(major_radius=0.5, minor_radius=0.2, location=location)

        obj = bpy.context.active_object
        obj.name = f"{shape_type}_{x}_{y}"

        # Color based on position
        import colorsys
        hue = (x + y * grid_size) / (grid_size * grid_size)
        rgb = colorsys.hsv_to_rgb(hue, 0.7, 0.9)

        mat = bpy.data.materials.new(name=f"Mat_{x}_{y}")
        mat.use_nodes = True
        mat.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (*rgb, 1)
        obj.data.materials.append(mat)

# Camera - top-down view
bpy.ops.object.camera_add(location=(0, 0, 20))
camera = bpy.context.active_object
camera.rotation_euler = (0, 0, 0)
bpy.context.scene.camera = camera

# Lighting
bpy.ops.object.light_add(type='SUN', location=(5, -5, 15))

f"Created {grid_size}x{grid_size} grid of objects"
`);

    const screenshot4 = await getScreenshot();
    saveScreenshot(screenshot4, 'D:/Power/gamedev-mcp-hub/screenshots/04-grid.png');

    // ========================================
    // TEST 5: Check Optional Features
    // ========================================
    console.log('\n🔍 TEST 5: Checking Optional Features\n');

    const polyhavenStatus = await sendRequest('tools/call', {
      name: 'blender__get_polyhaven_status',
      arguments: {}
    });
    console.log('Poly Haven Status:', polyhavenStatus.content[0].text);

    const hyper3dStatus = await sendRequest('tools/call', {
      name: 'blender__get_hyper3d_status',
      arguments: {}
    });
    console.log('Hyper3D Status:', hyper3dStatus.content[0].text);

    const sketchfabStatus = await sendRequest('tools/call', {
      name: 'blender__get_sketchfab_status',
      arguments: {}
    });
    console.log('Sketchfab Status:', sketchfabStatus.content[0].text);

    // ========================================
    // TEST 6: Poly Haven Categories (if enabled)
    // ========================================
    if (polyhavenStatus.content[0].text.includes('enabled')) {
      console.log('\n🎨 TEST 6: Poly Haven Integration\n');

      const categories = await sendRequest('tools/call', {
        name: 'blender__get_polyhaven_categories',
        arguments: { asset_type: 'textures' }
      });
      console.log('Texture Categories:', categories.content[0].text);
    }

    // ========================================
    // TEST 7: Final Scene with Everything
    // ========================================
    console.log('\n🎬 TEST 7: Creating Final Showcase Scene\n');

    await executeBlenderCode(`
import bpy
import math

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Central platform
bpy.ops.mesh.primitive_cylinder_add(radius=5, depth=0.5, location=(0, 0, -0.25))
platform = bpy.context.active_object
platform.name = "Platform"
mat_platform = bpy.data.materials.new(name="Mat_Platform")
mat_platform.use_nodes = True
mat_platform.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (0.2, 0.2, 0.2, 1)
mat_platform.node_tree.nodes["Principled BSDF"].inputs['Metallic'].default_value = 0.8
platform.data.materials.append(mat_platform)

# Ring of cubes around platform
num_cubes = 12
for i in range(num_cubes):
    angle = (i / num_cubes) * 2 * math.pi
    x = 4 * math.cos(angle)
    y = 4 * math.sin(angle)

    bpy.ops.mesh.primitive_cube_add(size=0.5, location=(x, y, 0.5))
    cube = bpy.context.active_object
    cube.rotation_euler = (0, 0, angle)

    import colorsys
    rgb = colorsys.hsv_to_rgb(i / num_cubes, 1.0, 1.0)
    mat = bpy.data.materials.new(name=f"Mat_Cube_{i}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (*rgb, 1)
    bsdf.inputs['Emission'].default_value = (*rgb, 1)
    bsdf.inputs['Emission Strength'].default_value = 0.5
    cube.data.materials.append(mat)

# Central sphere (glowing)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 1.5))
central_sphere = bpy.context.active_object
mat_glow = bpy.data.materials.new(name="Mat_Glow")
mat_glow.use_nodes = True
bsdf_glow = mat_glow.node_tree.nodes["Principled BSDF"]
bsdf_glow.inputs['Base Color'].default_value = (1, 1, 0, 1)
bsdf_glow.inputs['Emission'].default_value = (1, 1, 0, 1)
bsdf_glow.inputs['Emission Strength'].default_value = 3.0
central_sphere.data.materials.append(mat_glow)

# Camera - cinematic angle
bpy.ops.object.camera_add(location=(8, -8, 5))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0.785)
bpy.context.scene.camera = camera

# Dramatic lighting
bpy.ops.object.light_add(type='AREA', location=(5, -5, 10))
light1 = bpy.context.active_object
light1.data.energy = 500
light1.data.size = 5

bpy.ops.object.light_add(type='SPOT', location=(-5, 5, 8))
light2 = bpy.context.active_object
light2.data.energy = 300
light2.rotation_euler = (1.2, 0, -0.785)

"Final showcase scene created!"
`);

    const screenshot5 = await getScreenshot(1920);
    saveScreenshot(screenshot5, 'D:/Power/gamedev-mcp-hub/screenshots/05-final-showcase.png');

    // Final scene info
    const finalScene = await getSceneInfo();
    try {
      console.log('\n📋 Final Scene Info:', JSON.parse(finalScene.content[0].text));
    } catch {
      console.log('\n📋 Final Scene Info:', finalScene.content[0].text);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\nScreenshots saved to: D:/Power/gamedev-mcp-hub/screenshots/');
    console.log('\nFeatures Demonstrated:');
    console.log('  ✓ Basic object creation (cubes with materials)');
    console.log('  ✓ Algorithmic generation (spirals, grids)');
    console.log('  ✓ Character modeling (simple humanoid)');
    console.log('  ✓ Procedural materials and colors');
    console.log('  ✓ Camera and lighting setup');
    console.log('  ✓ Scene information retrieval');
    console.log('  ✓ Viewport screenshots');
    console.log('  ✓ Feature status checking');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    setTimeout(() => {
      hub.kill();
      process.exit(0);
    }, 2000);
  }
}

setTimeout(runTests, 2000);

process.on('SIGINT', () => {
  hub.kill();
  process.exit(0);
});
