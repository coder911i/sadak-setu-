import { useToastContext } from '../context/ToastContext';

export function useToast() {
  const { addToast, removeToast } = useToastContext();

  return {
    toast: addToast,
    success: (title, message) => addToast({ title, message, type: 'success' }),
    error: (title, message) => addToast({ title, message, type: 'error' }),
    warning: (title, message) => addToast({ title, message, type: 'warning' }),
    info: (title, message) => addToast({ title, message, type: 'info' }),
    dismiss: removeToast,
  };
}
