import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Briefcase,
  Calendar,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  GET_APPLICATIONS,
  CREATE_APPLICATION,
  UPDATE_APPLICATION,
  DELETE_APPLICATION,
} from "../graphql/operations";
import { StatusBadge } from "../components/StatusBadge";
import { ApplicationForm } from "../components/ApplicationForm";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewApplicationDialog } from "../components/ViewApplicationDialog";
import type { Application, CreateApplicationInput, Status } from "../lib/types";

const STATUS_FILTERS: { value: Status | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "Applied", label: "Applied" },
  { value: "Interviewing", label: "Interviewing" },
  { value: "Offer", label: "Offer" },
  { value: "Rejected", label: "Rejected" },
];

const JOB_TYPE_LABELS: Record<string, string> = {
  Internship: "Internship",
  FullTime: "Full-time",
  PartTime: "Part-time",
};

export function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);

  const { data, loading, error } = useQuery<{ applications: Application[] }>(
    GET_APPLICATIONS,
    {
      variables: {
        status: statusFilter || undefined,
        search: search || undefined,
      },
    },
  );

  const [createApplication, { loading: creating }] = useMutation(
    CREATE_APPLICATION,
    {
      refetchQueries: [GET_APPLICATIONS],
      onCompleted: () => {
        setShowForm(false);
        toast.success("Application added!");
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const [updateApplication, { loading: updating }] = useMutation(
    UPDATE_APPLICATION,
    {
      refetchQueries: [GET_APPLICATIONS],
      onCompleted: () => {
        setEditingApp(null);
        toast.success("Application updated!");
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const [deleteApplication, { loading: deleting }] = useMutation(
    DELETE_APPLICATION,
    {
      refetchQueries: [GET_APPLICATIONS],
      onCompleted: () => {
        setDeletingApp(null);
        toast.success("Application deleted");
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const handleCreate = (input: CreateApplicationInput) => {
    createApplication({ variables: { input } });
  };

  const handleUpdate = (input: CreateApplicationInput) => {
    if (!editingApp) return;
    updateApplication({ variables: { id: editingApp.id, input } });
  };

  const handleDelete = () => {
    if (!deletingApp) return;
    deleteApplication({ variables: { id: deletingApp.id } });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const applications = data?.applications ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-600 p-2">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Job Tracker
                </h1>
                <p className="text-xs text-gray-500">
                  Track your job applications
                </p>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add application
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status filter tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value === "") setSearch("");
                }}
                className="input pl-9 w-56"
              />
            </div>
            <button type="submit" className="btn-secondary">
              Search
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["Applied", "Interviewing", "Offer", "Rejected"] as Status[]).map(
            (s) => {
              const count = (data?.applications ?? []).filter(
                (a) => a.status === s,
              ).length;
              return (
                <div key={s} className="card px-4 py-3">
                  <p className="text-xs text-gray-500">{s}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {count}
                  </p>
                </div>
              );
            },
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-600 text-sm">
              {error.message}
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No applications yet.</p>
              <button
                className="btn-primary mt-4"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-4 w-4" /> Add your first application
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.N.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider hidden sm:table-cell">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {applications.map((app, index) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">
                          {index + 1}.
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">
                          {app.company_name}
                        </p>
                        {app.notes && (
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">
                            {app.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {app.job_title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                        {JOB_TYPE_LABELS[app.job_type]}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(app.applied_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingApp(app)}
                            className="rounded-md p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingApp(app)}
                            className="rounded-md p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingApp(app)}
                            className="rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400 text-right">
          {applications.length} application
          {applications.length !== 1 ? "s" : ""}
        </p>
      </main>

      {/* Add form modal */}
      {showForm && (
        <ApplicationForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isLoading={creating}
        />
      )}

      {/* Edit form modal */}
      {editingApp && (
        <ApplicationForm
          initial={editingApp}
          onSubmit={handleUpdate}
          onClose={() => setEditingApp(null)}
          isLoading={updating}
        />
      )}

      {/* Delete confirm */}
      {deletingApp && (
        <ConfirmDeleteDialog
          companyName={deletingApp.company_name}
          onConfirm={handleDelete}
          onCancel={() => setDeletingApp(null)}
          isLoading={deleting}
        />
      )}

      {/* View dialog */}
      {viewingApp && (
        <ViewApplicationDialog
          application={viewingApp}
          onClose={() => setViewingApp(null)}
        />
      )}
    </div>
  );
}
