// src/app/components/notifications/notifications.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification, NotificationType } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();
  
  // Para usar no template
  notificationType = NotificationType;
  
  constructor(private notificationService: NotificationService) {}
  
  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(notification => {
      this.notifications.push(notification);
      
      if (notification.timeout) {
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, notification.timeout);
      }
    });
  }
  
  removeNotification(id?: string) {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}