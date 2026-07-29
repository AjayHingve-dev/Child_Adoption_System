import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = 'success', message } = toast;

  let bgClass = 'bg-success text-white';
  let icon = <FaCheckCircle className="fs-5" />;

  if (type === 'error') {
    bgClass = 'bg-danger text-white';
    icon = <FaExclamationCircle className="fs-5" />;
  } else if (type === 'warning') {
    bgClass = 'bg-warning text-dark';
    icon = <FaExclamationTriangle className="fs-5" />;
  }

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1100 }}
    >
      <div
        className={`toast show align-items-center ${bgClass} border-0 shadow-lg rounded-3`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex p-2">
          <div className="toast-body d-flex align-items-center gap-2 fw-semibold">
            {icon}
            <span>{message}</span>
          </div>
          <button
            type="button"
            className={`btn-close ms-auto me-2 my-auto ${type === 'warning' ? '' : 'btn-close-white'}`}
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}
