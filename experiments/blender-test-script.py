"""
Blender Test Script - GameDev MCP Hub
Creates interesting 3D models for testing
"""

import bpy
import math

# Clear existing scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# ============================================
# Scene 1: Geometric Crystal Structure
# ============================================

def create_crystal():
    """Create a crystalline structure"""
    
    # Base crystal
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1, location=(0, 0, 2))
    crystal = bpy.context.active_object
    crystal.name = "Crystal_Core"
    
    # Add modifier for faceted look
    bpy.ops.object.modifier_add(type='DECIMATE')
    crystal.modifiers["Decimate"].decimate_type = 'DISSOLVE'
    crystal.modifiers["Decimate"].angle_limit = 0.174533  # 10 degrees
    
    # Material - glowing crystal
    mat = bpy.data.materials.new(name="Crystal_Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    # Emission shader
    node_emission = nodes.new(type='ShaderNodeEmission')
    node_emission.inputs[0].default_value = (0.2, 0.8, 1.0, 1.0)  # Cyan
    node_emission.inputs[1].default_value = 5.0  # Strength
    
    node_output = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(node_emission.outputs[0], node_output.inputs[0])
    
    crystal.data.materials.append(mat)
    
    # Surrounding spikes
    for i in range(8):
        angle = (i / 8) * 2 * math.pi
        x = math.cos(angle) * 2
        y = math.sin(angle) * 2
        z = 1 + (i % 3) * 0.5
        
        bpy.ops.mesh.primitive_cone_add(
            radius1=0.2,
            radius2=0,
            depth=1.5,
            location=(x, y, z)
        )
        spike = bpy.context.active_object
        spike.name = f"Spike_{i}"
        spike.rotation_euler = (0, math.radians(45), angle)
        
        # Same crystal material
        spike.data.materials.append(mat)

# ============================================
# Scene 2: Procedural Spaceship
# ============================================

def create_spaceship():
    """Create a simple spaceship model"""
    
    # Main hull
    bpy.ops.mesh.primitive_cube_add(size=2, location=(5, 0, 2))
    hull = bpy.context.active_object
    hull.name = "Ship_Hull"
    hull.scale = (2, 0.8, 0.5)
    
    # Cockpit
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.6, location=(6.5, 0, 2.3))
    cockpit = bpy.context.active_object
    cockpit.name = "Ship_Cockpit"
    cockpit.scale = (1.2, 1, 0.8)
    
    # Wings
    bpy.ops.mesh.primitive_cube_add(size=1, location=(5, 2, 2))
    wing_left = bpy.context.active_object
    wing_left.name = "Wing_Left"
    wing_left.scale = (1.5, 2, 0.1)
    
    bpy.ops.mesh.primitive_cube_add(size=1, location=(5, -2, 2))
    wing_right = bpy.context.active_object
    wing_right.name = "Wing_Right"
    wing_right.scale = (1.5, 2, 0.1)
    
    # Engines
    for y_pos in [1.5, -1.5]:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.3,
            depth=1.5,
            location=(3.5, y_pos, 2)
        )
        engine = bpy.context.active_object
        engine.name = f"Engine_{'Left' if y_pos > 0 else 'Right'}"
        engine.rotation_euler = (0, math.radians(90), 0)
        
        # Engine glow material
        eng_mat = bpy.data.materials.new(name="Engine_Glow")
        eng_mat.use_nodes = True
        nodes = eng_mat.node_tree.nodes
        nodes.clear()
        
        node_emission = nodes.new(type='ShaderNodeEmission')
        node_emission.inputs[0].default_value = (1.0, 0.5, 0.0, 1.0)  # Orange
        node_emission.inputs[1].default_value = 10.0
        
        node_output = nodes.new(type='ShaderNodeOutputMaterial')
        eng_mat.node_tree.links.new(node_emission.outputs[0], node_output.inputs[0])
        
        engine.data.materials.append(eng_mat)
    
    # Metallic material for hull
    metal_mat = bpy.data.materials.new(name="Ship_Metal")
    metal_mat.use_nodes = True
    nodes = metal_mat.node_tree.nodes
    bsdf = nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (0.3, 0.3, 0.4, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.9
    bsdf.inputs['Roughness'].default_value = 0.2
    
    for obj in [hull, cockpit, wing_left, wing_right]:
        obj.data.materials.append(metal_mat)

# ============================================
# Scene 3: Abstract Sculpture
# ============================================

def create_sculpture():
    """Create an abstract geometric sculpture"""
    
    # Twisted tower
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-5, 0, 0.5))
    base = bpy.context.active_object
    base.name = "Sculpture_Base"
    base.scale = (1.5, 1.5, 0.2)
    
    for i in range(1, 8):
        z = 0.5 + (i * 0.7)
        rotation = math.radians(i * 15)
        scale_factor = 1 - (i * 0.08)
        
        bpy.ops.mesh.primitive_cube_add(size=0.8, location=(-5, 0, z))
        cube = bpy.context.active_object
        cube.name = f"Sculpture_Level_{i}"
        cube.scale = (scale_factor, scale_factor, 0.4)
        cube.rotation_euler = (0, 0, rotation)
        
        # Gradient material
        mat = bpy.data.materials.new(name=f"Sculpture_Mat_{i}")
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        bsdf = nodes.get('Principled BSDF')
        
        # Color gradient from purple to cyan
        hue = 0.7 - (i * 0.08)
        bsdf.inputs['Base Color'].default_value = (hue, 0.3, 1.0, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.7
        bsdf.inputs['Roughness'].default_value = 0.3
        
        cube.data.materials.append(mat)

# ============================================
# Lighting Setup
# ============================================

def setup_lighting():
    """Add dramatic lighting to the scene"""
    
    # Remove default light
    bpy.data.objects.remove(bpy.data.objects['Light'], do_unlink=True)
    
    # Key light (cyan)
    bpy.ops.object.light_add(type='AREA', location=(5, -5, 8))
    key_light = bpy.context.active_object
    key_light.name = "Key_Light"
    key_light.data.energy = 500
    key_light.data.color = (0.7, 0.9, 1.0)
    key_light.data.size = 5
    
    # Fill light (warm)
    bpy.ops.object.light_add(type='AREA', location=(-5, 5, 6))
    fill_light = bpy.context.active_object
    fill_light.name = "Fill_Light"
    fill_light.data.energy = 300
    fill_light.data.color = (1.0, 0.8, 0.6)
    fill_light.data.size = 4
    
    # Rim light (purple)
    bpy.ops.object.light_add(type='SPOT', location=(0, 0, 10))
    rim_light = bpy.context.active_object
    rim_light.name = "Rim_Light"
    rim_light.data.energy = 800
    rim_light.data.color = (0.8, 0.4, 1.0)
    rim_light.rotation_euler = (0, 0, 0)

# ============================================
# Camera Setup
# ============================================

def setup_camera():
    """Position camera for good view"""
    
    camera = bpy.data.objects['Camera']
    camera.location = (10, -10, 8)
    camera.rotation_euler = (math.radians(60), 0, math.radians(45))
    
    # Camera settings
    camera.data.lens = 50
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = 12
    camera.data.dof.aperture_fstop = 2.8

# ============================================
# World Setup
# ============================================

def setup_world():
    """Configure world environment"""
    
    world = bpy.data.worlds['World']
    world.use_nodes = True
    nodes = world.node_tree.nodes
    nodes.clear()
    
    # Background gradient
    node_bg = nodes.new(type='ShaderNodeBackground')
    node_bg.inputs[0].default_value = (0.05, 0.05, 0.1, 1.0)  # Dark blue
    node_bg.inputs[1].default_value = 0.5
    
    node_output = nodes.new(type='ShaderNodeOutputWorld')
    world.node_tree.links.new(node_bg.outputs[0], node_output.inputs[0])

# ============================================
# Execute Scene Creation
# ============================================

print("Creating test scene...")
create_crystal()
print("✓ Crystal structure created")

create_spaceship()
print("✓ Spaceship created")

create_sculpture()
print("✓ Abstract sculpture created")

setup_lighting()
print("✓ Lighting configured")

setup_camera()
print("✓ Camera positioned")

setup_world()
print("✓ World environment set")

print("\n=== SCENE COMPLETE ===")
print("Objects created:")
print("- Crystal structure with 8 spikes")
print("- Procedural spaceship with engines")
print("- Twisted geometric sculpture")
print("- Professional lighting setup")
print("\nReady for render or further editing!")
