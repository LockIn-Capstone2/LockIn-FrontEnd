import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CalendarNotification({ onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📅</div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              New! Google Calendar Integration
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Automatically create calendar reminders for your assignment deadlines. 
              Get email and popup notifications to never miss a due date!
            </p>
            <div className="mt-2 text-xs text-blue-600">
              ✅ Email reminders (1 day + 10 minutes before)
              <br />
              ✅ Popup notifications (1 hour before)
              <br />
              ✅ Color-coded by priority
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 p-1"
        >
          ×
        </Button>
      </div>
    </div>
  );
}
