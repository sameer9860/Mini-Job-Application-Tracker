import { X, Calendar, Clock, FileText, Tag, Info } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Application } from '../lib/types';

interface ViewApplicationDialogProps {
  application: Application;
  onClose: () => void;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  Internship: 'Internship',
  FullTime: 'Full-time',
  PartTime: 'Part-time',
};

export function ViewApplicationDialog({ application, onClose }: ViewApplicationDialogProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimestamp = (tsStr: string) => {
    return new Date(tsStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Company</span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 break-words">
              {application.company_name}
            </h3>
          </div>

          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Role</span>
            <p className="text-base sm:text-lg text-gray-800 font-medium mt-0.5 break-words">
              {application.job_title}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-gray-100 py-4">
            <div className="flex items-start gap-2.5">
              <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <span className="block text-xs font-medium text-gray-500">Job Type</span>
                <span className="text-sm font-semibold text-gray-800">
                  {JOB_TYPE_LABELS[application.job_type] || application.job_type}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">
                <span className="block text-xs font-medium text-gray-500 mb-1">Status</span>
                <StatusBadge status={application.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <span className="block text-xs font-medium text-gray-500">Date Applied</span>
                <span className="text-sm font-medium text-gray-800">{formatDate(application.applied_date)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <span className="block text-xs font-medium text-gray-500">Last Updated</span>
                <span className="text-sm font-medium text-gray-800">{formatTimestamp(application.updated_at)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <span className="block text-xs font-medium text-gray-500">Notes</span>
                {application.notes ? (
                  <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 whitespace-pre-wrap">
                    {application.notes}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-400 italic">No notes added for this application.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 flex justify-stretch sm:justify-end border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
