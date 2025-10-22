# Meshy AI MCP Server Integration

## Overview
AI-powered 3D model generation service that creates 3D models from text descriptions and images, applies textures, and optimizes meshes through the Model Context Protocol.

## Features
- **Text-to-3D**: Generate 3D models from text prompts
- **Image-to-3D**: Create 3D models from reference images
- **Text-to-Texture**: Apply textures using text descriptions
- **Remeshing**: Optimize and clean up 3D models
- **Streaming**: Real-time progress updates for long tasks
- **Balance Check**: Monitor API credit usage

## Use Cases
- Rapid prototyping of game assets
- Concept visualization from descriptions
- AI-assisted 3D modeling workflow
- Texture generation for existing models
- Mesh optimization pipeline

## Current Status
**Status**: ✅ Configured - Requires Meshy API key  
**Tool Count**: ~20+ tools (when connected)  
**Package**: Python-based MCP server  
**Repository**: https://github.com/pasie15/meshy-ai-mcp-server  
**Last Updated**: 2025-10-21

## Quick Start

**Prerequisites**: 
- Python 3.9+
- Meshy AI API key (from https://meshy.ai)
- Clone meshy-ai-mcp-server repository

See [SETUP.md](./SETUP.md) for detailed installation instructions.

## Available Tools

### Creation Tools
- `create_text_to_3d_task` - Generate model from text
- `create_image_to_3d_task` - Generate model from image
- `create_text_to_texture_task` - Apply textures via text
- `create_remesh_task` - Optimize 3D mesh

### Retrieval Tools
- `retrieve_text_to_3d_task` - Get task details
- `retrieve_image_to_3d_task` - Get task status
- `retrieve_text_to_texture_task` - Check texture task
- `retrieve_remesh_task` - Check remesh progress

### Listing Tools
- `list_text_to_3d_tasks` - List all text-to-3D tasks
- `list_image_to_3d_tasks` - List image-to-3D tasks
- `list_text_to_texture_tasks` - List texture tasks
- `list_remesh_tasks` - List remesh tasks

### Streaming Tools
- `stream_text_to_3d_task` - Stream generation progress
- `stream_image_to_3d_task` - Stream conversion progress
- `stream_text_to_texture_task` - Stream texturing
- `stream_remesh_task` - Stream optimization

### Utility Tools
- `get_balance` - Check API credits remaining

## Example Workflows

### Game Asset Generation
```
1. Use create_text_to_3d_task: "medieval sword with ornate handle"
2. Stream progress with stream_text_to_3d_task
3. Download generated GLB/FBX model
4. Import into game engine (Godot/Unity/Unreal)
```

### Texture Enhancement
```
1. Have existing 3D model
2. Use create_text_to_texture_task: "weathered metal texture"
3. Apply generated texture map
4. Export for game use
```

### Rapid Prototyping
```
1. Generate multiple variations with different prompts
2. Compare results
3. Select best candidate
4. Optimize with remesh tool
5. Integrate into project
```

## Links
- **Official Site**: https://meshy.ai
- **API Docs**: https://docs.meshy.ai
- **MCP Server Repo**: https://github.com/pasie15/meshy-ai-mcp-server
- **Hub Configuration**: `config/mcp-servers.json` → `meshy`

## Troubleshooting

### Server won't connect
**Problem**: Python module not found  
**Solution**: 
1. Clone repository: `git clone https://github.com/pasie15/meshy-ai-mcp-server`
2. Install dependencies: `cd meshy-ai-mcp-server && pip install -r requirements.txt`
3. Update `workingDirectory` in hub config

### API key invalid
**Problem**: Authentication failed  
**Solution**: Get valid API key from https://meshy.ai/dashboard

### Task timeout
**Problem**: 3D generation takes too long  
**Solution**: Increase `timeout` in config or use streaming to monitor progress

## Security Notes
- Store Meshy API key in environment variables only
- Never commit API keys to git
- Monitor credit usage with `get_balance` tool
- API keys can be rotated in Meshy dashboard

## Cost Considerations
- Meshy AI is a paid service (credit-based)
- Text-to-3D: ~1-5 credits per generation
- Image-to-3D: ~2-10 credits depending on quality
- Monitor balance regularly
- Preview mode uses fewer credits than full quality
