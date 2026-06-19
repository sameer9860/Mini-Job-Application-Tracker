import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Plus,
  Search,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  GET_APPLICATIONS,
  GET_APPLICATION_STATS,
  CREATE_APPLICATION,
  UPDATE_APPLICATION,
  DELETE_APPLICATION,
} from "../graphql/operations";
import { StatusBadge } from "../components/StatusBadge";
import { ApplicationActions } from "../components/ApplicationActions";
import { ApplicationForm } from "../components/ApplicationForm";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewApplicationDialog } from "../components/ViewApplicationDialog";
import {
  PAGE_SIZE,
  applyOptimisticCreate,
  applyOptimisticDelete,
  applyOptimisticUpdate,
  buildOptimisticApplication,
  reconcileCreatedApplication,
  updateStatsCache,
} from "../lib/cache";
import type {
  Application,
  ApplicationStats,
  ApplicationsQueryVariables,
  CreateApplicationInput,
  PaginatedApplications,
  Status,
} from "../lib/types";

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

const STAT_CARDS: { status: Status; key: keyof Omit<ApplicationStats, "total"> }[] = [
  { status: "Applied", key: "applied" },
  { status: "Interviewing", key: "interviewing" },
  { status: "Offer", key: "offer" },
  { status: "Rejected", key: "rejected" },
];

export function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);

  const listVariables: ApplicationsQueryVariables = {
    status: statusFilter || undefined,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  useEffect(() => {
    setPage(0);
  }, [statusFilter, search]);

  const { data, loading, error } = useQuery<{ applications: PaginatedApplications }>(
    GET_APPLICATIONS,
    { variables: listVariables },
  );

  const total = data?.applications.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (total > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [total, page, totalPages]);

  const { data: statsData } = useQuery<{ applicationStats: ApplicationStats }>(
    GET_APPLICATION_STATS,
    { variables: { search: search || undefined } },
  );

  const statsRefetch = {
    query: GET_APPLICATION_STATS,
    variables: { search: search || undefined },
  };

  const [createApplication, { loading: creating }] = useMutation(
    CREATE_APPLICATION,
    {
      refetchQueries: [statsRefetch],
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
      refetchQueries: [statsRefetch],
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
      refetchQueries: [statsRefetch],
      onError: (err) => toast.error(err.message),
    },
  );

  const handleCreate = (input: CreateApplicationInput) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticApp = buildOptimisticApplication(input, tempId);

    createApplication({
      variables: { input },
      optimisticResponse: {
        createApplication: optimisticApp,
      },
      update: (cache, { data: mutationData }) => {
        const app = mutationData?.createApplication;
        if (!app) return;

        if (app.id.startsWith("temp-")) {
          applyOptimisticCreate(cache, listVariables, app);
          updateStatsCache(cache, search || undefined, (stats) => ({
            ...stats,
            total: stats.total + 1,
            applied:
              stats.applied + (app.status === "Applied" ? 1 : 0),
            interviewing:
              stats.interviewing + (app.status === "Interviewing" ? 1 : 0),
            offer: stats.offer + (app.status === "Offer" ? 1 : 0),
            rejected: stats.rejected + (app.status === "Rejected" ? 1 : 0),
          }));
          return;
        }

        reconcileCreatedApplication(cache, listVariables, app);
      },
    });
  };

  const handleUpdate = (input: CreateApplicationInput) => {
    if (!editingApp) return;

    const optimisticApp: Application = {
      ...editingApp,
      ...input,
      status: input.status ?? editingApp.status,
      applied_date: input.applied_date
        ? new Date(input.applied_date).toISOString()
        : editingApp.applied_date,
      notes: input.notes ?? editingApp.notes,
      updated_at: new Date().toISOString(),
    };

    updateApplication({
      variables: { id: editingApp.id, input },
      optimisticResponse: {
        updateApplication: optimisticApp,
      },
      update: (cache) => {
        applyOptimisticUpdate(
          cache,
          listVariables,
          editingApp.id,
          optimisticApp,
          editingApp.status,
        );
      },
    });
  };

  const handleDelete = () => {
    if (!deletingApp) return;

    const deletedId = deletingApp.id;
    const shouldGoToPrevPage = applications.length === 1 && page > 0;

    deleteApplication({
      variables: { id: deletedId },
      optimisticResponse: {
        deleteApplication: true,
      },
      update: (cache, { data }) => {
        if (!data?.deleteApplication) return;
        applyOptimisticDelete(cache, listVariables, deletedId);
      },
      onCompleted: () => {
        setDeletingApp(null);
        toast.success("Application deleted");
        if (shouldGoToPrevPage) setPage((p) => p - 1);
      },
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const applications = data?.applications.items ?? [];
  const currentPage = Math.min(page, totalPages - 1);
  const rangeStart = total === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((currentPage + 1) * PAGE_SIZE, total);
  const stats = statsData?.applicationStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-xl bg-indigo-600 p-2 shrink-0">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Job Tracker
                </h1>
                <p className="text-xs text-gray-500">
                  Track your job applications
                </p>
              </div>
            </div>
            <button
              className="btn-primary w-full sm:w-auto shrink-0"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add application</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value === "") setSearch("");
                }}
                className="input pl-9 w-full sm:w-56"
              />
            </div>
            <button type="submit" className="btn-secondary w-full sm:w-auto">
              Search
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_CARDS.map(({ status, key }) => (
            <div key={status} className="card px-4 py-3">
              <p className="text-xs text-gray-500">{status}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.[key] ?? "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading && applications.length === 0 ? (
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
            <>
              {/* Mobile card layout */}
              <div className="md:hidden divide-y divide-gray-100">
                {applications.map((app, index) => (
                  <article
                    key={app.id}
                    className={`p-4 space-y-3 ${
                      app.id.startsWith("temp-") ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-400">
                          #{currentPage * PAGE_SIZE + index + 1}
                        </p>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {app.company_name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {app.job_title}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>{JOB_TYPE_LABELS[app.job_type]}</span>
                      <span aria-hidden="true">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(app.applied_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {app.notes}
                      </p>
                    )}

                    <div className="flex justify-end border-t border-gray-100 pt-3">
                      <ApplicationActions
                        application={app}
                        onView={setViewingApp}
                        onEdit={setEditingApp}
                        onDelete={setDeletingApp}
                        compact
                      />
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                      className={`hover:bg-gray-50 transition-colors ${
                        app.id.startsWith("temp-") ? "opacity-70" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">
                          {currentPage * PAGE_SIZE + index + 1}.
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
                        <ApplicationActions
                          application={app}
                          onView={setViewingApp}
                          onEdit={setEditingApp}
                          onDelete={setDeletingApp}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Showing {rangeStart}–{rangeEnd} of {total} application
              {total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                className="btn-secondary flex-1 sm:flex-none"
                disabled={currentPage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="text-sm text-gray-600 min-w-[5.5rem] text-center shrink-0">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary flex-1 sm:flex-none"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <ApplicationForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isLoading={creating}
        />
      )}

      {editingApp && (
        <ApplicationForm
          initial={editingApp}
          onSubmit={handleUpdate}
          onClose={() => setEditingApp(null)}
          isLoading={updating}
        />
      )}

      {deletingApp && (
        <ConfirmDeleteDialog
          companyName={deletingApp.company_name}
          onConfirm={handleDelete}
          onCancel={() => setDeletingApp(null)}
          isLoading={deleting}
        />
      )}

      {viewingApp && (
        <ViewApplicationDialog
          application={viewingApp}
          onClose={() => setViewingApp(null)}
        />
      )}
    </div>
  );
}
