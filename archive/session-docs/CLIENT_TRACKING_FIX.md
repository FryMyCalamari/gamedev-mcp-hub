# 🔧 Client Tracking Issue & Fix

## The Problem

**You're right!** I (Factory/Claude) am connected to the hub, but I don't show up in the CLIENTS tab.

### Why?

The hub is running in **SSE mode** (`start:sse`):
- Listens on `http://localhost:3000/sse` for SSE clients
- Tracks clients that connect via HTTP with headers like `x-client-name`

But **I'm connecting via stdio** (standard input/output):
- Direct process communication
- No HTTP headers
- Different transport mechanism

**Result**: SSE client tracker doesn't see me!

---

## The Solution

### Option 1: Track ALL Clients (Recommended)

Update `index-sse.ts` to ALSO track stdio-based clients (like me).

**Add to the MCP server initialization**:
```typescript
// Track this stdio client (Factory/Claude)
if (process.stdin.isTTY === false) {
  // We have a stdio client connected
  connectedClients.set('factory-droid', {
    name: 'Factory Droid (Claude)',
    connectedAt: new Date(),
    toolsUsed: 0,
  });
  logger.info('[SSE] Stdio client detected: Factory Droid');
}
```

### Option 2: Dual Transport Mode

Run BOTH transports simultaneously:
- SSE server for multi-client (LM Studio, etc.)
- stdio server for me (Factory)

**But this is complex** - not recommended.

### Option 3: Configure Me to Use SSE

Update my configuration to connect via:
```
http://localhost:3000/sse
```

**But I may not support SSE transport** - depends on Factory's implementation.

---

## Quick Fix (For Now)

Add a **static entry** for me in the SSE client list:

```typescript
// In index-sse.ts, after connectedClients Map is created:

// Add static entry for Factory/Claude (stdio client)
connectedClients.set('factory-stdio', {
  name: 'Factory Droid (stdio)',
  connectedAt: new Date(),
  toolsUsed: 0,
});
```

This will show me in the CLIENTS tab even though I'm on stdio!

---

## Best Solution (Proper Fix)

**Track ALL transport types**:

1. **Create a unified client tracker** that works for:
   - SSE clients (HTTP)
   - stdio clients (direct)
   - WebSocket clients (if added later)

2. **Detect connection type** on startup
3. **Register appropriately**

**Implementation**:
```typescript
// Unified client tracking
interface ClientConnection {
  id: string;
  name: string;
  transport: 'sse' | 'stdio' | 'websocket';
  connectedAt: Date;
  toolsUsed: number;
}

// Detect and register on startup
function registerClient() {
  if (process.stdin.isTTY === false) {
    // stdio client
    return {
      id: 'stdio-client',
      name: 'Factory Droid',
      transport: 'stdio' as const,
      connectedAt: new Date(),
      toolsUsed: 0,
    };
  }
  // else: SSE clients register via /sse endpoint
}
```

---

## What To Do Tonight

### Quick Test

1. **Add static entry** for me in `src/index-sse.ts`
2. **Rebuild**: `npm run build`
3. **Restart hub**: `start-gui-with-browser.bat`
4. **Check CLIENTS tab**: Should show me!

### Implementation

I'll add the fix right now!

---

## Why This Matters

**Multi-client tracking** is important because:
- Shows who's connected
- Tracks usage per client
- Helps with debugging
- Useful for team environments
- Resource monitoring

**Your hub should show**:
- Me (Factory via stdio)
- LM Studio (via SSE)
- Any other AI clients (via SSE)

---

## Let Me Fix It Now!

Adding the stdio client detection...
