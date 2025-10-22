extends Node2D

# Rain World x Celeste Style - 2D Platformer Asset Generator
# Procedural pixel art generation for atmospheric platformer

# Color Palettes (Rain World inspired - muted, atmospheric)
const PALETTE_RAIN_WORLD = {
	"bg_dark": Color("#1a1c2c"),
	"bg_mid": Color("#3e3546"),
	"platform": Color("#5a4a78"),
	"accent_cold": Color("#5fcde4"),
	"accent_warm": Color("#ef7d57"),
	"highlight": Color("#f4f4f4"),
	"shadow": Color("#0f0f1b"),
}

# Celeste inspired - clean, vibrant
const PALETTE_CELESTE = {
	"bg_sky": Color("#64b6f7"),
	"bg_mountain": Color("#2d3b57"),
	"platform": Color("#8b4e6f"),
	"crystal": Color("#ff77a8"),
	"snow": Color("#fff1e8"),
	"shadow": Color("#1a1c2c"),
}

var tile_size = 16  # Standard pixel art tile size
var current_palette = PALETTE_RAIN_WORLD

func _ready():
	print("🎮 Generating 2D Platformer Assets...")
	
	# Generate different asset types
	generate_platform_tiles()
	generate_character_sprite()
	generate_background_layers()
	generate_collectibles()
	generate_hazards()
	
	print("✓ Assets generated! Check the scene tree.")

# ============================================
# PLATFORM TILES (Rain World style - organic, eroded)
# ============================================

func generate_platform_tiles():
	print("→ Generating platform tiles...")
	
	var platforms_node = Node2D.new()
	platforms_node.name = "PlatformTiles"
	add_child(platforms_node)
	
	# Solid platform
	var solid = create_platform_tile(Vector2(0, 0), "solid")
	platforms_node.add_child(solid)
	
	# Eroded left edge
	var edge_left = create_platform_tile(Vector2(tile_size, 0), "edge_left")
	platforms_node.add_child(edge_left)
	
	# Eroded right edge
	var edge_right = create_platform_tile(Vector2(tile_size * 2, 0), "edge_right")
	platforms_node.add_child(edge_right)
	
	# Moss covered
	var moss = create_platform_tile(Vector2(tile_size * 3, 0), "moss")
	platforms_node.add_child(moss)
	
	# Hanging platform (celeste style)
	var hanging = create_hanging_platform(Vector2(tile_size * 4, 0))
	platforms_node.add_child(hanging)

func create_platform_tile(pos: Vector2, type: String) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.position = pos
	sprite.texture = generate_platform_texture(type)
	return sprite

func generate_platform_texture(type: String) -> ImageTexture:
	var img = Image.create(tile_size, tile_size, false, Image.FORMAT_RGBA8)
	
	match type:
		"solid":
			# Solid block with subtle texture
			for y in range(tile_size):
				for x in range(tile_size):
					var noise = randf_range(-0.1, 0.1)
					var color = current_palette.platform
					color.r += noise
					color.g += noise
					color.b += noise
					img.set_pixel(x, y, color)
			
			# Add highlights (top edge)
			for x in range(tile_size):
				img.set_pixel(x, 0, current_palette.highlight.lerp(current_palette.platform, 0.7))
				img.set_pixel(x, 1, current_palette.highlight.lerp(current_palette.platform, 0.85))
			
			# Add shadows (bottom edge)
			for x in range(tile_size):
				img.set_pixel(x, tile_size - 1, current_palette.shadow)
				img.set_pixel(x, tile_size - 2, current_palette.shadow.lerp(current_palette.platform, 0.5))
		
		"edge_left":
			# Eroded left edge
			for y in range(tile_size):
				var erosion = int(randf_range(0, 3) if y > 2 and y < tile_size - 2 else 0)
				for x in range(erosion, tile_size):
					var color = current_palette.platform
					if x == erosion:  # Edge highlight
						color = color.lerp(current_palette.highlight, 0.3)
					img.set_pixel(x, y, color)
		
		"moss":
			# Base platform
			for y in range(tile_size):
				for x in range(tile_size):
					img.set_pixel(x, y, current_palette.platform)
			
			# Add moss on top (Rain World style)
			var moss_color = Color("#4ecca3")
			for x in range(tile_size):
				if randf() > 0.3:  # Randomize moss coverage
					img.set_pixel(x, 0, moss_color)
					if randf() > 0.5:
						img.set_pixel(x, 1, moss_color.darkened(0.2))
	
	return ImageTexture.create_from_image(img)

func create_hanging_platform(pos: Vector2) -> Node2D:
	var platform = Node2D.new()
	platform.position = pos
	
	# Chain/rope segments
	for i in range(4):
		var chain = Sprite2D.new()
		chain.position = Vector2(tile_size / 2, i * 4)
		chain.texture = generate_chain_texture()
		platform.add_child(chain)
	
	# Platform sprite
	var plat = Sprite2D.new()
	plat.position = Vector2(tile_size / 2, 20)
	plat.texture = generate_platform_texture("solid")
	platform.add_child(plat)
	
	return platform

func generate_chain_texture() -> ImageTexture:
	var img = Image.create(2, 4, false, Image.FORMAT_RGBA8)
	var chain_color = current_palette.shadow.lerp(current_palette.platform, 0.3)
	
	img.set_pixel(0, 1, chain_color)
	img.set_pixel(1, 1, chain_color)
	img.set_pixel(0, 2, chain_color)
	img.set_pixel(1, 2, chain_color)
	
	return ImageTexture.create_from_image(img)

# ============================================
# CHARACTER SPRITE (Celeste-style clean pixel art)
# ============================================

func generate_character_sprite():
	print("→ Generating character sprite...")
	
	var char_node = Node2D.new()
	char_node.name = "Character"
	char_node.position = Vector2(100, 100)
	add_child(char_node)
	
	# Create animated sprite frames
	var idle = create_character_texture("idle")
	var sprite = Sprite2D.new()
	sprite.texture = idle
	sprite.scale = Vector2(2, 2)  # Scale up for visibility
	char_node.add_child(sprite)

func create_character_texture(anim: String) -> ImageTexture:
	var img = Image.create(16, 16, false, Image.FORMAT_RGBA8)
	
	match anim:
		"idle":
			# Character silhouette (Celeste-inspired)
			var body_color = Color("#ff77a8")  # Pink/red
			var hair_color = Color("#ff004d")  # Brighter red
			
			# Body (8x10 pixels)
			for y in range(4, 14):
				for x in range(4, 12):
					img.set_pixel(x, y, body_color)
			
			# Hair (messy, flowing)
			for x in range(3, 13):
				if randf() > 0.4:
					img.set_pixel(x, 3, hair_color)
					if randf() > 0.6:
						img.set_pixel(x, 2, hair_color)
			
			# Eyes (white dots)
			img.set_pixel(5, 6, Color.WHITE)
			img.set_pixel(10, 6, Color.WHITE)
			
			# Outline (dark)
			for y in range(2, 14):
				img.set_pixel(3, y, current_palette.shadow)
				img.set_pixel(12, y, current_palette.shadow)
			for x in range(3, 13):
				img.set_pixel(x, 2, current_palette.shadow)
				img.set_pixel(x, 14, current_palette.shadow)
	
	return ImageTexture.create_from_image(img)

# ============================================
# BACKGROUND LAYERS (Parallax, atmospheric)
# ============================================

func generate_background_layers():
	print("→ Generating background layers...")
	
	var bg_node = Node2D.new()
	bg_node.name = "Background"
	bg_node.z_index = -10
	add_child(bg_node)
	
	# Far mountains (Rain World style)
	var mountains = create_mountain_layer(Vector2(0, 0), 3)
	bg_node.add_child(mountains)
	
	# Mid fog layer
	var fog = create_fog_layer(Vector2(0, 100))
	bg_node.add_child(fog)
	
	# Foreground pipes/ruins
	var ruins = create_ruins_layer(Vector2(0, 150))
	bg_node.add_child(ruins)

func create_mountain_layer(pos: Vector2, depth: int) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.position = pos
	
	var width = 256
	var height = 128
	var img = Image.create(width, height, false, Image.FORMAT_RGBA8)
	
	# Generate mountain silhouette
	var mountain_color = current_palette.bg_mid.darkened(0.2 * depth)
	var heights = []
	
	# Create mountain peaks
	for x in range(width):
		var noise = sin(x * 0.05) * 30 + cos(x * 0.03) * 20
		var height_val = int(height * 0.5 + noise)
		heights.append(height_val)
	
	# Fill mountain shape
	for x in range(width):
		for y in range(heights[x], height):
			img.set_pixel(x, y, mountain_color)
	
	sprite.texture = ImageTexture.create_from_image(img)
	return sprite

func create_fog_layer(pos: Vector2) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.position = pos
	sprite.modulate = Color(1, 1, 1, 0.3)  # Transparent
	
	var width = 256
	var height = 64
	var img = Image.create(width, height, false, Image.FORMAT_RGBA8)
	
	# Soft fog gradient
	for y in range(height):
		var alpha = 1.0 - (float(y) / height)
		var fog_color = Color(0.8, 0.85, 0.9, alpha * 0.5)
		for x in range(width):
			if randf() > 0.3:  # Sparse fog
				img.set_pixel(x, y, fog_color)
	
	sprite.texture = ImageTexture.create_from_image(img)
	return sprite

func create_ruins_layer(pos: Vector2) -> Node2D:
	var layer = Node2D.new()
	layer.position = pos
	
	# Add pipes/structural elements (Rain World style)
	for i in range(5):
		var pipe = create_pipe_sprite(Vector2(i * 50, randf_range(-20, 20)))
		layer.add_child(pipe)
	
	return layer

func create_pipe_sprite(pos: Vector2) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.position = pos
	
	var img = Image.create(8, 32, false, Image.FORMAT_RGBA8)
	var pipe_color = current_palette.shadow.lerp(current_palette.platform, 0.4)
	
	# Vertical pipe
	for y in range(32):
		for x in range(2, 6):
			img.set_pixel(x, y, pipe_color)
	
	# Highlights
	for y in range(32):
		img.set_pixel(2, y, pipe_color.lightened(0.3))
	
	sprite.texture = ImageTexture.create_from_image(img)
	return sprite

# ============================================
# COLLECTIBLES (Celeste-style crystals)
# ============================================

func generate_collectibles():
	print("→ Generating collectibles...")
	
	var collectibles = Node2D.new()
	collectibles.name = "Collectibles"
	collectibles.position = Vector2(200, 100)
	add_child(collectibles)
	
	# Create crystal collectible
	var crystal = create_crystal_sprite(Vector2(0, 0))
	collectibles.add_child(crystal)
	
	# Add glow/particle effect
	var glow = create_glow_effect(Vector2(0, 0))
	collectibles.add_child(glow)

func create_crystal_sprite(pos: Vector2) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.position = pos
	sprite.scale = Vector2(2, 2)
	
	var img = Image.create(8, 8, false, Image.FORMAT_RGBA8)
	var crystal_color = PALETTE_CELESTE.crystal
	
	# Diamond shape
	var shape = [
		[0, 0, 0, 1, 1, 0, 0, 0],
		[0, 0, 1, 1, 1, 1, 0, 0],
		[0, 1, 1, 1, 1, 1, 1, 0],
		[1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 0],
		[0, 0, 1, 1, 1, 1, 0, 0],
		[0, 0, 0, 1, 1, 0, 0, 0],
	]
	
	for y in range(7):
		for x in range(8):
			if shape[y][x] == 1:
				var color = crystal_color
				if x < 4:  # Add highlight on left
					color = color.lightened(0.3)
				img.set_pixel(x, y + 1, color)
	
	sprite.texture = ImageTexture.create_from_image(img)
	return sprite

func create_glow_effect(pos: Vector2) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.position = pos
	sprite.modulate = Color(1, 1, 1, 0.5)
	sprite.scale = Vector2(3, 3)
	
	var img = Image.create(12, 12, false, Image.FORMAT_RGBA8)
	var glow_color = PALETTE_CELESTE.crystal
	
	# Radial glow
	var center = Vector2(6, 6)
	for y in range(12):
		for x in range(12):
			var dist = Vector2(x, y).distance_to(center)
			if dist < 6:
				var alpha = 1.0 - (dist / 6.0)
				var color = Color(glow_color.r, glow_color.g, glow_color.b, alpha * 0.3)
				img.set_pixel(x, y, color)
	
	sprite.texture = ImageTexture.create_from_image(img)
	return sprite

# ============================================
# HAZARDS (Spikes, moving platforms, etc.)
# ============================================

func generate_hazards():
	print("→ Generating hazards...")
	
	var hazards = Node2D.new()
	hazards.name = "Hazards"
	hazards.position = Vector2(300, 100)
	add_child(hazards)
	
	# Spikes (Celeste style)
	var spikes = create_spikes_sprite(Vector2(0, 0))
	hazards.add_child(spikes)

func create_spikes_sprite(pos: Vector2) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.position = pos
	sprite.scale = Vector2(2, 2)
	
	var img = Image.create(16, 8, false, Image.FORMAT_RGBA8)
	var spike_color = Color("#ff004d")
	var base_color = current_palette.shadow
	
	# Three spikes
	for spike_idx in range(3):
		var base_x = spike_idx * 5
		# Triangle spike
		for y in range(6):
			var width = 6 - y
			for x in range(width):
				var px = base_x + (y / 2) + x
				img.set_pixel(int(px), 7 - y, spike_color)
		
		# Base
		for x in range(5):
			img.set_pixel(base_x + x, 7, base_color)
	
	sprite.texture = ImageTexture.create_from_image(img)
	return sprite

# ============================================
# EXPORT TEXTURES (Save for use in game)
# ============================================

func export_all_textures():
	# This would save all generated textures to files
	# For use in actual game development
	print("💾 Export functionality - implement based on your needs")
	# Example: texture.get_image().save_png("res://assets/platform_tile.png")
