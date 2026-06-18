import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  companyName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ConfirmDeleteDialog({
  companyName,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">Delete application</h3>
            <p className="mt-1 text-sm text-gray-500">
              Are you sure you want to delete the application for{' '}
              <span className="font-medium text-gray-900">{companyName}</span>? This action cannot
              be undone.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
