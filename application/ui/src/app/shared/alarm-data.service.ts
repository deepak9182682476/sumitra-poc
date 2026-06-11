import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlarmDataService {

  private alarmsSource = new BehaviorSubject<any[]>([]);
  alarms$ = this.alarmsSource.asObservable();

  setAlarms(data: any[]) {
    this.alarmsSource.next(data);
  }

  getAlarms() {
    return this.alarmsSource.value;
  }
}
