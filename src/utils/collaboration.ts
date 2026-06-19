import type { SyncEvent, SyncEventType } from '@/types/sync';
import { generateId } from './date';

type EventListener = (event: SyncEvent) => void;

class CollaborationMiddleware {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<SyncEventType, Set<EventListener>> = new Map();
  private sentEventIds: Set<string> = new Set();
  private memberId: string = '';
  private initialized = false;

  init(memberId: string): void {
    if (this.initialized || typeof window === 'undefined') return;

    this.memberId = memberId;
    this.channel = new BroadcastChannel('family-meal-planner');

    this.channel.onmessage = (event) => {
      const syncEvent = event.data as SyncEvent;

      if (!syncEvent || !syncEvent.eventId) return;

      if (this.sentEventIds.has(syncEvent.eventId)) {
        return;
      }

      const listeners = this.listeners.get(syncEvent.type);
      if (listeners) {
        listeners.forEach((listener) => listener(syncEvent));
      }

      const allListeners = this.listeners.get('*' as SyncEventType);
      if (allListeners) {
        allListeners.forEach((listener) => listener(syncEvent));
      }
    };

    this.initialized = true;
  }

  broadcast(type: SyncEventType, payload: unknown): void {
    if (!this.channel) return;

    const event: SyncEvent = {
      type,
      eventId: generateId(),
      memberId: this.memberId,
      timestamp: Date.now(),
      payload,
    };

    this.sentEventIds.add(event.eventId);
    setTimeout(() => {
      this.sentEventIds.delete(event.eventId);
    }, 5000);

    this.channel.postMessage(event);
  }

  on(type: SyncEventType | '*', listener: EventListener): () => void {
    const eventType = type as SyncEventType;
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  off(type: SyncEventType | '*', listener: EventListener): void {
    const eventType = type as SyncEventType;
    this.listeners.get(eventType)?.delete(listener);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getChannel(): BroadcastChannel | null {
    return this.channel;
  }

  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.initialized = false;
    this.listeners.clear();
  }
}

export const collaboration = new CollaborationMiddleware();
