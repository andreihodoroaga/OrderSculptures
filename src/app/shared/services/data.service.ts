import { Injectable, NgZone } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private ipcRenderer: IpcRenderer | undefined;
  private refreshContent$ = new BehaviorSubject<string>('');
  refresh$ = this.refreshContent$.asObservable();

  constructor(private readonly ngZone: NgZone) {
    if (window.require) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.ipcRenderer.on('reload-content', () => {
        this.ngZone.run(() => {
          this.refreshContent$.next("refresh");
        });
      })
    }
  }

  getData(signal: string) {
    return new Observable((subscriber) => {
      this.ipcRenderer?.invoke(signal).then((data) => {
        this.ngZone.run(() => {
          subscriber.next(data);
          subscriber.complete();
        });
      });
    });
  }

  sendSignal(signal: string, data: any) {
    return this.ipcRenderer!.invoke(signal, data);
  }
}
