// NoData component: Displays a message and optional action when no data is available.
"use client";
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import i18n from '@/lib/i18n';

interface NoDataProps {
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

const NoData: React.FC<NoDataProps> = ({ message = 'No data found.', action, className = '' }) => {
  const isRTL = i18n.language === 'ar';
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center text-muted ${className} ${isRTL ? 'rtl' : 'ltr'}`}>
      <ExclamationCircleIcon className="h-16 w-16 text-accentC mb-4 opacity-70" />
      <div className="text-lg font-semibold mb-2">{message}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default NoData; 