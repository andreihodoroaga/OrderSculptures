import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, Subject, first, map, takeUntil } from 'rxjs';
import { Order } from '../models/order';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService implements OnDestroy {
  private ordersData$ = new ReplaySubject<Order[]>(1);
  orders$ = this.ordersData$.asObservable();
  private destroyed$ = new Subject<void>();

  constructor(private readonly dataService: DataService) {
    this.dataService.refresh$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.fetchOrders();
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  fetchOrders() {
    this.dataService.getData('get-orders').pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      this.ordersData$.next(data as Order[]);
    });
  }

  async addOrder(order: Order) {
    try {
      await this.dataService.sendSignal('add-order', order);
      this.fetchOrders();
      return 'Success';
    } catch (error) {
      return "Error adding the order";
    }
  }

  async deleteOrder(order: Order) {
    try {
      await this.dataService.sendSignal('delete-order', order.id);
      this.fetchOrders();
      return 'Success';
    } catch (error) {
      return 'Error deleting the order!';
    }
  }

  getNextOrderId(order: Order, direction: number) {
    return this.ordersData$.pipe(
      first(),
      map((orders) => {
        const index = orders.findIndex((ord) => ord.id === order.id);
        let nextIndex = index + direction;
        if (nextIndex === -1) {
          nextIndex = orders.length - 1;
        } else if (nextIndex === orders.length) {
          nextIndex = 0;
        }
        return orders[nextIndex].id;
      })
    );
  }
}
