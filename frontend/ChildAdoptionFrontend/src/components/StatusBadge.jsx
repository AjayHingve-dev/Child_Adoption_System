import React from 'react';

export default function StatusBadge({ status }) {
  const isOk = status === 'ACTIVE';
  return (
    <span
      className={`badge rounded-pill px-3 py-2 fw-semibold ${
        isOk ? 'bg-success text-white' : 'bg-danger text-white'
      }`}
      style={{ fontSize: '0.78rem', letterSpacing: '0.04em' }}
    >
      {isOk ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}
