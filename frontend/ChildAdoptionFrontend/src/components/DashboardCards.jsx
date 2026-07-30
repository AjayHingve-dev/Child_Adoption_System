import React from 'react';
import { FaUserTie, FaUserCheck, FaUserTimes, FaHourglassHalf, FaCheckDouble } from 'react-icons/fa';

export default function DashboardCards({ workers = [] }) {
  const total = workers.length;
  const active = workers.filter((w) => w.status === 'ACTIVE').length;
  const inactive = workers.filter((w) => w.status === 'INACTIVE').length;
  const pendingVisits = workers.reduce((acc, curr) => acc + (curr.pendingVisits || 0), 0);
  const completedVisits = workers.reduce((acc, curr) => acc + (curr.completedVisits || 0), 0);

  const cardsData = [
    {
      title: 'Total Social Workers',
      count: total,
      icon: <FaUserTie className="fs-3 text-primary" />,
      border: 'border-start border-4 border-primary',
      bgIcon: 'bg-primary-subtle',
    },
    {
      title: 'Active Workers',
      count: active,
      icon: <FaUserCheck className="fs-3 text-success" />,
      border: 'border-start border-4 border-success',
      bgIcon: 'bg-success-subtle',
    },
    {
      title: 'Inactive Workers',
      count: inactive,
      icon: <FaUserTimes className="fs-3 text-danger" />,
      border: 'border-start border-4 border-danger',
      bgIcon: 'bg-danger-subtle',
    },
    {
      title: 'Pending Visits',
      count: pendingVisits,
      icon: <FaHourglassHalf className="fs-3 text-warning" />,
      border: 'border-start border-4 border-warning',
      bgIcon: 'bg-warning-subtle',
    },
    {
      title: 'Completed Visits',
      count: completedVisits,
      icon: <FaCheckDouble className="fs-3 text-info" />,
      border: 'border-start border-4 border-info',
      bgIcon: 'bg-info-subtle',
    },
  ];

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-3 mb-4">
      {cardsData.map((c, idx) => (
        <div key={idx} className="col">
          <div className={`card h-100 shadow-sm border-0 ${c.border}`}>
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block text-uppercase" style={{ fontSize: '0.72rem' }}>
                  {c.title}
                </span>
                <h3 className="mb-0 fw-bold mt-1 text-dark">{c.count}</h3>
              </div>
              <div className={`p-2 rounded-3 ${c.bgIcon} d-flex align-items-center justify-content-center`}>
                {c.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
