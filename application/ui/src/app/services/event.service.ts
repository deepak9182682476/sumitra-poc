import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EventService {
  public emitter: EventEmitter<object | null>;
  constructor() {
    this.emitter = new EventEmitter<{ type: string, message: any }>(null);
  }
  broadcastMessage(type: string, message: any): void {
    this.emitter.emit({ type, message });
  }
}