// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning'
}

export interface Notification {
  type: NotificationType;
  message: string;
  id?: string;
  timeout?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notifications$ = this.notificationSubject.asObservable();

  show(notification: Notification) {
    const id = Math.random().toString(36).substring(2, 9);
    this.notificationSubject.next({
      ...notification,
      id,
      timeout: notification.timeout || 5000
    });
    
    return id;
  }

  success(message: string, timeout?: number) {
    return this.show({
      type: NotificationType.Success,
      message,
      timeout
    });
  }

  error(message: string, timeout?: number) {
    return this.show({
      type: NotificationType.Error,
      message,
      timeout
    });
  }

  info(message: string, timeout?: number) {
    return this.show({
      type: NotificationType.Info,
      message,
      timeout
    });
  }

  warning(message: string, timeout?: number) {
    return this.show({
      type: NotificationType.Warning,
      message,
      timeout
    });
  }
}