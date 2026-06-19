import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Application } from '../lib/types';

interface ApplicationActionsProps {
  application: Application;
  onView: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  compact?: boolean;
}

export function ApplicationActions({
  application,
  onView,
  onEdit,
  onDelete,
  compact = false,
}: ApplicationActionsProps) {
  const buttonClass = compact
    ? 'rounded-lg p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors'
    : 'rounded-md p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors';

  const deleteClass = compact
    ? 'rounded-lg p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors'
    : 'rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors';

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'justify-end gap-2'}`}>
      <button
        onClick={() => onView(application)}
        className={buttonClass}
        title="View Details"
        aria-label="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => onEdit(application)}
        className={buttonClass}
        title="Edit"
        aria-label="Edit application"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(application)}
        className={deleteClass}
        title="Delete"
        aria-label="Delete application"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
