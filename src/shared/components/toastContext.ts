import { createContext, useContext } from 'react';

export const ToastContext = createContext<{ notify: (message: string) => void }>({
  notify: () => {},
});
export const useToast = () => useContext(ToastContext);
