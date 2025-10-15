import { Capacitor } from '@capacitor/core';

interface WebSocketConfig {
  url: string;
  port?: number;
  protocols?: string[];
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

export class AndroidWebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionalClose = false;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      port: 81,
      reconnect: true,
      maxReconnectAttempts: 10,
      reconnectInterval: 3000,
      ...config,
    };
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL
        let wsUrl = this.config.url;
        
        // Ensure proper protocol
        if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
          // Extract IP if URL contains it
          const ipMatch = wsUrl.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) {
            wsUrl = `ws://${ipMatch[1]}:${this.config.port}`;
          } else {
            wsUrl = `ws://${wsUrl}:${this.config.port}`;
          }
        }

        console.log(`[WebSocket] Connecting to: ${wsUrl}`);
        console.log(`[WebSocket] Platform: ${Capacitor.getPlatform()}`);
        console.log(`[WebSocket] Is Native: ${Capacitor.isNativePlatform()}`);

        // Create WebSocket with protocols
        this.ws = new WebSocket(wsUrl, this.config.protocols);

        // Connection timeout
        const connectTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.error('[WebSocket] Connection timeout');
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = (event) => {
          clearTimeout(connectTimeout);
          console.log('[WebSocket] Connected successfully');
          this.reconnectAttempts = 0;
          this.emit('open', event);
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] Message received:', data);
            this.emit('message', data);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
            this.emit('message', event.data);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          console.error('[WebSocket] Error:', error);
          this.emit('error', error);
          
          // Don't reject on error, let onclose handle it
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout);
          console.log('[WebSocket] Closed:', event.code, event.reason);
          this.emit('close', event);
          
          if (!this.isIntentionalClose && this.config.reconnect) {
            this.scheduleReconnect();
          }
          
          if (this.reconnectAttempts === 0) {
            reject(new Error(`Connection closed: ${event.reason || 'Unknown reason'}`));
          }
        };

      } catch (error) {
        console.error('[WebSocket] Connection error:', error);
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      console.error('[WebSocket] Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached', null);
      return;
    }

    const delay = Math.min(
      this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts),
      30000
    );

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, delay);
  }

  send(data: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.ws.send(message);
        console.log('[WebSocket] Sent:', message);
        return true;
      } catch (error) {
        console.error('[WebSocket] Send error:', error);
        return false;
      }
    }
    console.warn('[WebSocket] Cannot send - connection not open');
    return false;
  }

  close(): void {
    this.isIntentionalClose = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.reconnectAttempts = 0;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[WebSocket] Event handler error for '${event}':`, error);
      }
    });
  }

  getState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
