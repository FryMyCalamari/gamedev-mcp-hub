#!/usr/bin/env node

/**
 * Test script to interact with the GameDev MCP Hub
 * Tests Blender integration
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Start the hub server
const hub = spawn('node', ['dist/index.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;
const pendingRequests = new Map();

// Handle stdout (responses from hub)
const rl = createInterface({
  input: hub.stdout,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const response = JSON.parse(line);
    console.log('\n📥 Response:', JSON.stringify(response, null, 2));

    if (response.id && pendingRequests.has(response.id)) {
      const resolve = pendingRequests.get(response.id);
      pendingRequests.delete(response.id);
      resolve(response.result);
    }
  } catch (error) {
    // Not JSON, probably a log line
    console.log('📝 Log:', line);
  }
});

// Handle stderr (errors)
hub.stderr.on('data', (data) => {
  console.error('❌ Error:', data.toString());
});

// Helper to send JSON-RPC requests
function sendRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    console.log('\n📤 Request:', JSON.stringify(request, null, 2));

    pendingRequests.set(id, resolve);
    hub.stdin.write(JSON.stringify(request) + '\n');

    // Timeout after 30 seconds
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }
    }, 30000);
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Blender MCP Hub Tests...\n');

  try {
    // Wait for hub to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 1. Initialize the connection
    console.log('\n=== 1. Initializing MCP Connection ===');
    await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });

    // 2. List available tools
    console.log('\n=== 2. Listing Available Tools ===');
    const toolsList = await sendRequest('tools/list', {});
    console.log(`\n✅ Found ${toolsList.tools.length} tools:`);
    toolsList.tools.forEach((tool, i) => {
      console.log(`${i + 1}. ${tool.name} - ${tool.description}`);
    });

    // 3. Get scene info
    console.log('\n=== 3. Getting Blender Scene Info ===');
    const sceneInfo = await sendRequest('tools/call', {
      name: 'blender__get_scene_info',
      arguments: {}
    });
    console.log('Scene info:', sceneInfo);

    // 4. Execute Python code to create 3 different cubes
    console.log('\n=== 4. Creating 3 Cubes with Different Sizes and Materials ===');
    const createResult = await sendRequest('tools/call', {
      name: 'blender__execute_blender_code',
      arguments: {
        code: `
import bpy
import random

# Clear existing mesh objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create 3 cubes with different sizes and materials
cubes = []

# Cube 1: Small, Red metallic
bpy.ops.mesh.primitive_cube_add(size=1, location=(-3, 0, 0))
cube1 = bpy.context.active_object
cube1.name = "Cube_Small_Red"
mat1 = bpy.data.materials.new(name="Material_Red")
mat1.use_nodes = True
mat1.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (1, 0, 0, 1)  # Red
mat1.node_tree.nodes["Principled BSDF"].inputs[6].default_value = 0.9  # Metallic
cube1.data.materials.append(mat1)
cubes.append(cube1)

# Cube 2: Medium, Blue glossy
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
cube2 = bpy.context.active_object
cube2.name = "Cube_Medium_Blue"
mat2 = bpy.data.materials.new(name="Material_Blue")
mat2.use_nodes = True
mat2.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0, 0, 1, 1)  # Blue
mat2.node_tree.nodes["Principled BSDF"].inputs[9].default_value = 0.2  # Roughness (glossy)
cube2.data.materials.append(mat2)
cubes.append(cube2)

# Cube 3: Large, Green rough
bpy.ops.mesh.primitive_cube_add(size=3, location=(4, 0, 0))
cube3 = bpy.context.active_object
cube3.name = "Cube_Large_Green"
mat3 = bpy.data.materials.new(name="Material_Green")
mat3.use_nodes = True
mat3.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0, 1, 0, 1)  # Green
mat3.node_tree.nodes["Principled BSDF"].inputs[9].default_value = 0.9  # Roughness
cube3.data.materials.append(mat3)
cubes.append(cube3)

# Add a camera
bpy.ops.object.camera_add(location=(0, -10, 5))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0)
bpy.context.scene.camera = camera

# Add a light
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))

result = {
    "cubes_created": len(cubes),
    "cube_names": [c.name for c in cubes],
    "cube_locations": [list(c.location) for c in cubes],
    "cube_sizes": [c.scale[0] for c in cubes]
}
result
`
      }
    });
    console.log('✅ Cubes created:', createResult);

    // 5. Get updated scene info
    console.log('\n=== 5. Getting Updated Scene Info ===');
    const updatedScene = await sendRequest('tools/call', {
      name: 'blender__get_scene_info',
      arguments: {}
    });
    console.log('Updated scene:', updatedScene);

    // 6. Take a screenshot
    console.log('\n=== 6. Taking Viewport Screenshot ===');
    const screenshot = await sendRequest('tools/call', {
      name: 'blender__get_viewport_screenshot',
      arguments: {
        max_size: 1920
      }
    });
    console.log('✅ Screenshot captured (base64 length:', screenshot?.content?.[0]?.text?.length || 0, 'chars)');

    console.log('\n\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    // Cleanup
    setTimeout(() => {
      hub.kill();
      process.exit(0);
    }, 1000);
  }
}

// Start tests after a delay
setTimeout(runTests, 2000);

// Handle process termination
process.on('SIGINT', () => {
  hub.kill();
  process.exit(0);
});
