import React, { useEffect } from 'react';
import { ExclamationTriangleIcon, XCircleIcon } from './icons/ResultIcons';

interface NotificationProps {
  message: string;
  details?: string[];
  type: 'warning' | 'info' | 'success';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, details, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 7000); // Auto-close after 7 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const theme = {
    warning: {
      icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
      bg: 'bg-yellow-400/20 dark:bg-yellow-800/30',
      border: 'border-yellow-500/50',
      text: 'text-yellow-800 dark:text-yellow-300',
      title: 'text-yellow-900 dark:text-yellow-200 font-bold',
    },
    // Can be extended with 'info' and 'success' types later
  };

  const currentTheme = theme[type];

  return (
    <div
      className={`max-w-sm w-full rounded-lg shadow-lg p-4 flex items-start gap-3 backdrop-blur-md animate-slide-in-right ${currentTheme.bg} border ${currentTheme.border}`}
      role="alert"
    >
      <div className="flex-shrink-0">{currentTheme.icon}</div>
      <div className="flex-grow">
        <p className={currentTheme.title}>{message}</p>
        {details && details.length > 0 && (
          <ul className={`mt-1 text-sm list-disc list-inside ${currentTheme.text}`}>
            {details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={onClose} className={`ml-auto p-1 rounded-full ${currentTheme.text} hover:opacity-75 transition-opacity`}>
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Notification;
