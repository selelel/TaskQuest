import { useEffect, useRef } from 'react';

interface NotificationsProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export function Notifications({ onPermissionChange }: NotificationsProps) {
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    const checkNotificationPermission = async () => {
      try {
        if (!('Notification' in window)) {
          console.warn('This browser does not support notifications');
          return;
        }

        const permission = await Notification.requestPermission();
        permissionRef.current = permission;
        
        if (onPermissionChange) {
          onPermissionChange(permission);
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    };

    checkNotificationPermission();
  }, [onPermissionChange]);

  return null;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      // Use the app's favicon as the notification icon if no icon is provided
      const defaultIcon = `${window.location.origin}/favicon.ico`;
      const notification = new Notification(title, {
        icon: defaultIcon,
        ...options
      });

      return notification;
    } catch (err) {
      console.error('Error showing notification:', err);
    }
  }
} 