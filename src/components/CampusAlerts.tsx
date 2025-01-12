"use client"

import { useData } from '@/context/DataContext';

export default function CampusAlerts() {
  const { alerts, isLoading, error } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-pulse text-gray-500">Loading alerts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-black">{error}</div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-black">No active alerts</div>
      </div>
    );
  }

  const getAlertStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'emergency':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">UCLA Alerts</h1>
        <p className="text-sm">Via https://bso.ucla.edu/</p>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 border-l-4 rounded-lg transition-all hover:scale-[1.02] ${getAlertStyles(alert.type)}`}
        >
          <div className="flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{alert.title}</h3>
                <p className="text-sm mt-1">
                  {new Date(alert.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {alert.categories.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {alert.categories.map((category, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-opacity-20 bg-current"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <a
                href={alert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline hover:no-underline ml-4"
              >
                Read More
              </a>
            </div>
            <div className="mt-3 text-sm opacity-80">
              {alert.summary}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 