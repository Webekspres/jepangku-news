type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeNotificationInvalidation(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function invalidateNotifications(): void {
  listeners.forEach((listener) => listener());
}
