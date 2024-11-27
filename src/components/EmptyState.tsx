import React from 'react';
import { RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ message, onAction, actionLabel }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">{message}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}