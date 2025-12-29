import { Injectable } from '@angular/core';
import { every, Subject } from 'rxjs';

export interface SensorData {
  sensor_id: string;
  temperatura: number;
  vlaznost: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})

export class SensorService {
  private socket!: WebSocket;

  public sensorData$ = new Subject<SensorData>();

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = new WebSocket('ws://localhost:8000/ws');

    this.socket.onopen = () => {
      console.log('WebSocket spojen na Angular');
    }

    this.socket.onmessage = (event) => {
      try {
        const data: SensorData = JSON.parse(event.data);

        this.sensorData$.next(data);
      } catch (e) {
        console.error('Greška pri parsiranju poruke:', e);
      }
    };

    this.socket.onclose = (event) => {
      console.warn('WebSocket zatvoren. Pokušavam ponovno spajanje za 3 sekunde...', event);

      setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket greška:', error);
    };
  }
}
