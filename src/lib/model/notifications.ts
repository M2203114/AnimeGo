import { writable } from 'svelte/store';

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  progress: number;
  dismissable: boolean;
  dismissAfter: number;
  show: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function createNotifications() {
  const { subscribe, set, update } = writable<Notification[]>([]);
  return {
    subscribe,
    addNotification: (
      notification: Pick<Notification, 'title' | 'message'> &
        Partial<Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>>
    ) => {
      const date = new Date();
      const id = date.getTime();
      update(n => [
        ...n,
        {
          id,
          title: notification.title,
          message: notification.message,
          type: notification.type ?? 'info',
          duration: notification.duration ?? 0,
          dismissable: notification.dismissable ?? true,
          dismissAfter: notification.dismissAfter ?? 5000,
          show: notification.show ?? true,
          createdAt: date,
          updatedAt: date
        }
      ]);
      return id;
    },
    removeNotification: (id: number) => {
      update(n => n.filter(notification => notification.id !== id));
    },
    removeAllNotifications: () => {
      set([]);
    },
    updateNotification: (
      id: number,
      notification: Partial<
        Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>
      >
    ) => {
      update(n => {
        const index = n.findIndex(notification => notification.id === id);
        if (index === -1) return n;
        n[index] = { ...n[index], ...notification, updatedAt: new Date() };
        return n;
      });
    }
  };
}

export const notifications = createNotifications();
