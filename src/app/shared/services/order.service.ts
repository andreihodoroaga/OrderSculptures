import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order } from '../models/order';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersData$ = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersData$.asObservable();

  constructor(private readonly dataService: DataService) {}

  getOrders() {
    this.dataService.sendSignal('get-orders');
    this.dataService.getData('orders-data').subscribe(data => {
      this.ordersData$.next(data as Order[]);
    });
  }

  addOrder(order: Order) {
    this.dataService.sendData('add-order', order);
  }
}
