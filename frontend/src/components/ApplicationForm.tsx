import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Application, CreateApplicationInput, JobType, Status } from '../lib/types';

interface ApplicationFormProps {
  initial?: Application;
  onSubmit: (data: CreateApplicationInput) => void;
  onClose: () => void;
  isLoading: boolean;
}

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'Internship', label: 'Internship' },
  { value: 'FullTime', label: 'Full-time' },
  { value: 'PartTime', label: 'Part-time' },
];

const STATUSES: { value: Status; label: string }[] = [
  { value: 'Applied', label: 'Applied' },
  { value: 'Interviewing', label: 'Interviewing' },
  { value: 'Offer', label: 'Offer' },
  { value: 'Rejected', label: 'Rejected' },
];

export function ApplicationForm({ initial, onSubmit, onClose, isLoading }: ApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateApplicationInput>({
    defaultValues: initial
      ? {
          company_name: initial.company_name,
          job_title: initial.job_title,
          job_type: initial.job_type,
          status: initial.status,
          applied_date: initial.applied_date.split('T')[0],
          notes: initial.notes ?? '',
        }
      : {
          status: 'Applied',
          applied_date: new Date().toISOString().split('T')[0],
        },
  });

  const isEditing = !!initial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit application' : 'Add application'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Company Name */}
          <div>
            <label className="label" htmlFor="company_name">
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              id="company_name"
              className="input"
              placeholder="e.g. Anthropic"
              {...register('company_name', {
                required: 'Company name is required',
                minLength: { value: 2, message: 'Must be at least 2 characters' },
              })}
            />
            {errors.company_name && (
              <p className="mt-1 text-xs text-red-600">{errors.company_name.message}</p>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label className="label" htmlFor="job_title">
              Job title <span className="text-red-500">*</span>
            </label>
            <input
              id="job_title"
              className="input"
              placeholder="e.g. Software Engineer Intern"
              {...register('job_title', { required: 'Job title is required' })}
            />
            {errors.job_title && (
              <p className="mt-1 text-xs text-red-600">{errors.job_title.message}</p>
            )}
          </div>

          {/* Job Type + Status (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="job_type">
                Job type <span className="text-red-500">*</span>
              </label>
              <select
                id="job_type"
                className="input"
                {...register('job_type', { required: 'Job type is required' })}
              >
                <option value="">Select type</option>
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.job_type && (
                <p className="mt-1 text-xs text-red-600">{errors.job_type.message}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="status">
                Status <span className="text-red-500">*</span>
              </label>
              <select id="status" className="input" {...register('status')}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applied Date */}
          <div>
            <label className="label" htmlFor="applied_date">
              Applied date <span className="text-red-500">*</span>
            </label>
            <input
              id="applied_date"
              type="date"
              className="input"
              {...register('applied_date', { required: 'Applied date is required' })}
            />
            {errors.applied_date && (
              <p className="mt-1 text-xs text-red-600">{errors.applied_date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="input resize-none"
              placeholder="Any additional notes..."
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
