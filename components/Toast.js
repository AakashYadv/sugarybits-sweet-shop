import React, { useEffect } from 'react';
import { html } from 'htm/react';

const Toast = ({ toasts, removeToast }) => {
  return html`
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      ${toasts.map((toast) => html`
        <${ToastItem} key=${toast.id} toast=${toast} removeToast=${removeToast} />
      `)}
    </div>
  `;
};

const ToastItem = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };

  return html`
    <div className=${`pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] transform transition-all duration-300 animate-[slideIn_0.3s_ease-out] ${styles[toast.type]}`}>
      <i className=${`fa-solid ${icons[toast.type]}`}></i>
      <span className="font-medium text-sm flex-1">${toast.message}</span>
      <button onClick=${() => removeToast(toast.id)} className="opacity-80 hover:opacity-100 transition-opacity">
        <i className="fa-solid fa-times"></i>
      </button>
    </div>
  `;
};

export default Toast;