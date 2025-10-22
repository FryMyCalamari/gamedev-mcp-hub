#!/usr/bin/env node

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
    // Not JSON
  }
});

function sendRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    pendingRequests.set(id, resolve);
    hub.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Timeout'));
      }
    }, 30000);
  });
}

async function run() {
  console.log('🎨 Creating 3 Cubes with Different Colors and Materials...\n');

  try {
    await new Promise(resolve => setTimeout(resolve, 3000));

    await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'three-cubes', version: '1.0.0' }
    });

    const result = await sendRequest('tools/call', {
      name: 'blender__execute_blender_code',
      arguments: {
        code: `
import bpy

# Clear everything
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

print("Creating three cubes...")

# CUBE 1: SMALL RED METALLIC
bpy.ops.mesh.primitive_cube_add(size=1, location=(-4, 0, 0))
cube1 = bpy.context.active_object
cube1.name = "Cube_Small_Red"

mat1 = bpy.data.materials.new(name="Material_Red")
mat1.use_nodes = True
bsdf1 = mat1.node_tree.nodes["Principled BSDF"]
bsdf1.inputs['Base Color'].default_value = (1.0, 0.0, 0.0, 1.0)  # RED
bsdf1.inputs['Metallic'].default_value = 0.95
bsdf1.inputs['Roughness'].default_value = 0.05
cube1.data.materials.append(mat1)

print(f"✓ Created {cube1.name} at {cube1.location}")

# CUBE 2: MEDIUM BLUE GLOSSY
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
cube2 = bpy.context.active_object
cube2.name = "Cube_Medium_Blue"

mat2 = bpy.data.materials.new(name="Material_Blue")
mat2.use_nodes = True
bsdf2 = mat2.node_tree.nodes["Principled BSDF"]
bsdf2.inputs['Base Color'].default_value = (0.0, 0.0, 1.0, 1.0)  # BLUE
bsdf2.inputs['Metallic'].default_value = 0.3
bsdf2.inputs['Roughness'].default_value = 0.15
cube2.data.materials.append(mat2)

print(f"✓ Created {cube2.name} at {cube2.location}")

# CUBE 3: LARGE GREEN ROUGH
bpy.ops.mesh.primitive_cube_add(size=3, location=(5, 0, 0))
cube3 = bpy.context.active_object
cube3.name = "Cube_Large_Green"

mat3 = bpy.data.materials.new(name="Material_Green")
mat3.use_nodes = True
bsdf3 = mat3.node_tree.nodes["Principled BSDF"]
bsdf3.inputs['Base Color'].default_value = (0.0, 1.0, 0.0, 1.0)  # GREEN
bsdf3.inputs['Metallic'].default_value = 0.0
bsdf3.inputs['Roughness'].default_value = 0.95
cube3.data.materials.append(mat3)

print(f"✓ Created {cube3.name} at {cube3.location}")

# Setup camera to view all 3 cubes
bpy.ops.object.camera_add(location=(0.5, -18, 9))
camera = bpy.context.active_object
camera.rotation_euler = (1.05, 0, 0)
bpy.context.scene.camera = camera

# Add lighting
bpy.ops.object.light_add(type='SUN', location=(5, -5, 12))
sun = bpy.context.active_object
sun.data.energy = 2.5
sun.rotation_euler = (0.8, 0.3, 0)

# Add another light for better visibility
bpy.ops.object.light_add(type='AREA', location=(-5, -5, 8))
area_light = bpy.context.active_object
area_light.data.energy = 150
area_light.data.size = 5

"✅ THREE CUBES CREATED: Small Red (metallic), Medium Blue (glossy), Large Green (rough)"
`
      }
    });

    console.log('Result:', result.content[0].text);

    // Get scene info
    const scene = await sendRequest('tools/call', {
      name: 'blender__get_scene_info',
      arguments: {}
    });

    console.log('\nScene Info:');
    try {
      const sceneData = JSON.parse(scene.content[0].text);
      console.log(`  Objects: ${sceneData.object_count}`);
      sceneData.objects.forEach(obj => {
        console.log(`    - ${obj.name} (${obj.type}) at [${obj.location}]`);
      });
      console.log(`  Materials: ${sceneData.materials_count}`);
    } catch {
      console.log(scene.content[0].text);
    }

    // Take screenshot
    const screenshot = await sendRequest('tools/call', {
      name: 'blender__get_viewport_screenshot',
      arguments: { max_size: 1920 }
    });

    if (screenshot.content[0].type === 'image') {
      const buffer = Buffer.from(screenshot.content[0].data, 'base64');
      writeFileSync('D:/Power/gamedev-mcp-hub/screenshots/THREE-CUBES-FINAL.png', buffer);
      console.log('\n✅ Screenshot saved: screenshots/THREE-CUBES-FINAL.png');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Check Blender - you should see:');
    console.log('   🔴 Small Red Metallic Cube (left, size 1)');
    console.log('   🔵 Medium Blue Glossy Cube (center, size 2)');
    console.log('   🟢 Large Green Rough Cube (right, size 3)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    setTimeout(() => {
      hub.kill();
      process.exit(0);
    }, 1000);
  }
}

setTimeout(run, 2000);
