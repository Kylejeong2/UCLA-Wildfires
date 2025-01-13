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
        return 'bg-red-50 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-700';
    }
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold text-black">UCLA Alerts (last 3 days)</h1>
      <p className="text-xs text-gray-500">Via https://bso.ucla.edu/</p>
      <div className="md:h-[400px] md:overflow-y-auto space-y-2 md:pr-2">
        {alerts.map((alert) => (
          <a
            key={alert.id}
            href={alert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div
              className={`p-3 border-l-4 rounded-lg transition-all hover:scale-[1.01] ${getAlertStyles(alert.type)}`}
            >
              <div className="flex flex-col">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-current text-sm">
                      {alert.title}
                    </h3>
                    <p className="text-xs mt-0.5 opacity-75">
                      {new Date(alert.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {/* {alert.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {alert.categories.map((category, index) => (
                          <span
                            key={index}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-current bg-opacity-10 text-current"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )} */}
                  </div>
                  <span className="text-xs hover:underline shrink-0">Read More →</span>
                </div>
                <div className="mt-2 text-xs opacity-75">
                  {alert.summary.length > 50 ? `${alert.summary.substring(0, 50)}...` : alert.summary}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 