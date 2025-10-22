---
name: algorithmic-art
description: Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.
license: MIT - Adapted for GameDev MCP Hub
hub_integration: true
hub_tools: []
---

# Algorithmic Art Skill - GameDev MCP Hub

Algorithmic philosophies are computational aesthetic movements expressed through code. Output .md files (philosophy), .html files (interactive viewer), and .js files (generative algorithms).

This skill works in two steps:
1. **Algorithmic Philosophy Creation** (.md file)
2. **Express by creating p5.js generative art** (.html + .js files)

---

## ALGORITHMIC PHILOSOPHY CREATION

To begin, create an ALGORITHMIC PHILOSOPHY (not static images or templates) that will be interpreted through:
- Computational processes, emergent behavior, mathematical beauty
- Seeded randomness, noise fields, organic systems
- Particles, flows, fields, forces
- Parametric variation and controlled chaos

### THE CRITICAL UNDERSTANDING
- **What is received**: User input as foundation (doesn't constrain creative freedom)
- **What is created**: An algorithmic philosophy/generative aesthetic movement
- **What happens next**: Express it in CODE - creating p5.js sketches that are 90% algorithmic generation, 10% essential parameters

### HOW TO GENERATE AN ALGORITHMIC PHILOSOPHY

**Name the movement** (1-2 words): "Organic Turbulence" / "Quantum Harmonics" / "Emergent Stillness"

**Articulate the philosophy** (4-6 paragraphs - concise but complete):

Capture the ALGORITHMIC essence by expressing how this philosophy manifests through:
- Computational processes and mathematical relationships
- Noise functions and randomness patterns
- Particle behaviors and field dynamics
- Temporal evolution and system states
- Parametric variation and emergent complexity

**CRITICAL GUIDELINES:**
- **Avoid redundancy**: Each algorithmic aspect mentioned once
- **Emphasize craftsmanship REPEATEDLY**: The final algorithm should appear as though it took countless hours to develop, was refined with care, and comes from someone at the absolute top of their field
- **Leave creative space**: Be specific about algorithmic direction, but concise enough that implementation has room for interpretive choices at extremely high level of craftsmanship

The philosophy must guide implementation to express ideas ALGORITHMICALLY, not through static images. Beauty lives in the process, not the final frame.

### PHILOSOPHY EXAMPLES

**"Organic Turbulence"**
Philosophy: Chaos constrained by natural law, order emerging from disorder.
Algorithmic expression: Flow fields driven by layered Perlin noise. Thousands of particles following vector forces, their trails accumulating into organic density maps. Multiple noise octaves create turbulent regions and calm zones. Color emerges from velocity and density. The algorithm runs until equilibrium - a meticulously tuned balance where every parameter was refined through countless iterations.

**"Quantum Harmonics"**
Philosophy: Discrete entities exhibiting wave-like interference patterns.
Algorithmic expression: Particles initialized on a grid, each carrying a phase value that evolves through sine waves. When particles are near, their phases interfere - constructive interference creates bright nodes, destructive creates voids. Simple harmonic motion generates complex emergent mandalas.

**The algorithmic philosophy should be 4-6 paragraphs long.** Fill it with poetic computational philosophy that brings together the intended vision.

---

## P5.JS IMPLEMENTATION

With the philosophy established, express it through code.

### TECHNICAL REQUIREMENTS

**Seeded Randomness (Art Blocks Pattern)**:
```javascript
// ALWAYS use a seed for reproducibility
let seed = 12345; // or hash from user input
randomSeed(seed);
noiseSeed(seed);
```

**Parameter Structure**:
```javascript
let params = {
  seed: 12345,  // Always include seed for reproducibility
  // Add parameters that control YOUR algorithm:
  // - Quantities (how many?)
  // - Scales (how big? how fast?)
  // - Probabilities (how likely?)
  // - Ratios (what proportions?)
  // - Angles (what direction?)
  // - Thresholds (when does behavior change?)
};
```

**Canvas Setup**: Standard p5.js structure:
```javascript
function setup() {
  createCanvas(1200, 1200);
  // Initialize your system
}

function draw() {
  // Your generative algorithm
  // Can be static (noLoop) or animated
}
```

### CRAFTSMANSHIP REQUIREMENTS

**CRITICAL**: Create algorithms that feel like they emerged through countless iterations by a master generative artist. Tune every parameter carefully. Ensure every pattern emerges with purpose. This is NOT random noise - this is CONTROLLED CHAOS refined through deep expertise.

- **Balance**: Complexity without visual noise, order without rigidity
- **Color Harmony**: Thoughtful palettes, not random RGB values
- **Composition**: Even in randomness, maintain visual hierarchy and flow
- **Performance**: Smooth execution, optimized for real-time if animated
- **Reproducibility**: Same seed ALWAYS produces identical output

### OUTPUT FORMAT

Output:
1. **Algorithmic Philosophy** - As markdown explaining the generative aesthetic
2. **Single HTML Artifact** - Self-contained interactive generative art

The HTML artifact contains everything: p5.js (from CDN), the algorithm, parameter controls, and UI - all in one file that works immediately.

---

## INTERACTIVE ARTIFACT CREATION

Create a single, self-contained HTML artifact. Ensure this artifact works immediately in any browser - no setup required. Embed everything inline.

### REQUIRED FEATURES

**1. Parameter Controls**
- Sliders for numeric parameters (particle count, noise scale, speed, etc.)
- Color pickers for palette colors
- Real-time updates when parameters change
- Reset button to restore defaults

**2. Seed Navigation**
- Display current seed number
- "Previous" and "Next" buttons to cycle through seeds
- "Random" button for random seed
- Input field to jump to specific seed

**3. Single Artifact Structure**
```html
<!DOCTYPE html>
<html>
<head>
  <!-- p5.js from CDN - always available -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
  <style>
    /* All styling inline - clean, minimal */
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="controls">
    <!-- All parameter controls -->
  </div>
  <script>
    // ALL p5.js code inline here
  </script>
</body>
</html>
```

**CRITICAL**: This is a single artifact. No external files, no imports (except p5.js CDN). Everything inline.

---

## GAMEDEV MCP HUB INTEGRATION

### Available Hub Tools

When creating art for game development, you can save generated assets using hub tools:

- **Save to project**: Can reference project file paths
- **Version control**: Can integrate with GitHub tools
- **Asset management**: Can organize in project structure

### Example Workflow

1. Generate algorithmic art visualization
2. User likes seed #42
3. Can save as PNG for game asset
4. Can create variations by tweaking parameters
5. Can document algorithm for procedural generation in game

---

## THE CREATIVE PROCESS

**User request** → **Algorithmic philosophy** → **Implementation**

Each request is unique. The process involves:

1. **Interpret the user's intent** - What aesthetic is being sought?
2. **Create an algorithmic philosophy** (4-6 paragraphs)
3. **Implement it in code** - Build the algorithm that expresses this philosophy
4. **Design appropriate parameters** - What should be tunable?
5. **Build matching UI controls** - Sliders/inputs for those parameters

Trust creativity and let the philosophy guide the implementation.

---

## USAGE EXAMPLES

**Example 1**: "Create a flow field visualization"
- Philosophy: Emergent currents in invisible forces
- Implementation: Vector fields + particle system
- Output: Interactive HTML with seed navigation

**Example 2**: "Generate abstract patterns for game backgrounds"
- Philosophy: Computational symmetry with organic variation
- Implementation: Recursive subdivision with noise
- Output: HTML artifact, saveable as PNG

**Example 3**: "Make generative art for loading screens"
- Philosophy: Endless variation, hypnotic motion
- Implementation: Animated particle systems
- Output: HTML with animation controls

---

**This skill enables AI-powered generative art creation for game development through computational aesthetics and p5.js visualization.**
