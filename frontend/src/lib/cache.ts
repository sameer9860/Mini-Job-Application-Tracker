import type { ApolloCache } from '@apollo/client';
import { GET_APPLICATIONS, GET_APPLICATION_STATS } from '../graphql/operations';
import type {
  Application,
  ApplicationStats,
  ApplicationsQueryVariables,
  CreateApplicationInput,
  PaginatedApplications,
  Status,
} from './types';

export const PAGE_SIZE = 10;

export function buildOptimisticApplication(
  input: CreateApplicationInput,
  id: string,
): Application {
  const now = new Date().toISOString();
  return {
    id,
    company_name: input.company_name,
    job_title: input.job_title,
    job_type: input.job_type,
    status: input.status ?? 'Applied',
    applied_date: new Date(input.applied_date).toISOString(),
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
  };
}

function matchesListFilter(
  app: Application,
  variables: ApplicationsQueryVariables,
): boolean {
  if (variables.status && app.status !== variables.status) return false;
  if (variables.search) {
    const term = variables.search.toLowerCase();
    return (
      app.company_name.toLowerCase().includes(term) ||
      app.job_title.toLowerCase().includes(term)
    );
  }
  return true;
}

export function updateApplicationsCache(
  cache: ApolloCache<unknown>,
  variables: ApplicationsQueryVariables,
  updater: (existing: PaginatedApplications) => PaginatedApplications,
) {
  cache.updateQuery<{ applications: PaginatedApplications }>(
    { query: GET_APPLICATIONS, variables },
    (data) => {
      if (!data?.applications) return data;
      return { applications: updater(data.applications) };
    },
  );
}

export function updateStatsCache(
  cache: ApolloCache<unknown>,
  search: string | undefined,
  updater: (existing: ApplicationStats) => ApplicationStats,
) {
  cache.updateQuery<{ applicationStats: ApplicationStats }>(
    { query: GET_APPLICATION_STATS, variables: { search: search || undefined } },
    (data) => {
      if (!data?.applicationStats) return data;
      return { applicationStats: updater(data.applicationStats) };
    },
  );
}

export function applyOptimisticCreate(
  cache: ApolloCache<unknown>,
  listVariables: ApplicationsQueryVariables,
  optimisticApp: Application,
) {
  if (!matchesListFilter(optimisticApp, listVariables)) return;

  updateApplicationsCache(cache, listVariables, (existing) => {
    if (existing.items.some((item) => item.id === optimisticApp.id)) return existing;
    return {
      total: existing.total + 1,
      items:
        listVariables.offset === 0
          ? [optimisticApp, ...existing.items].slice(0, listVariables.limit)
          : existing.items,
    };
  });
}

export function reconcileCreatedApplication(
  cache: ApolloCache<unknown>,
  listVariables: ApplicationsQueryVariables,
  app: Application,
) {
  if (app.id.startsWith('temp-')) return;

  updateApplicationsCache(cache, listVariables, (existing) => {
    const hasTemp = existing.items.some((item) => item.id.startsWith('temp-'));
    if (hasTemp) {
      return {
        ...existing,
        items: existing.items.map((item) =>
          item.id.startsWith('temp-') ? app : item,
        ),
      };
    }

    if (!matchesListFilter(app, listVariables)) return existing;
    if (existing.items.some((item) => item.id === app.id)) return existing;

    return {
      total: existing.total + 1,
      items:
        listVariables.offset === 0
          ? [app, ...existing.items].slice(0, listVariables.limit)
          : existing.items,
    };
  });
}

export function applyOptimisticUpdate(
  cache: ApolloCache<unknown>,
  listVariables: ApplicationsQueryVariables,
  id: string,
  optimisticApp: Application,
  previousStatus: Status,
) {
  const inList = matchesListFilter(optimisticApp, listVariables);
  const wasInList = listVariables.status
    ? previousStatus === listVariables.status
    : true;

  updateApplicationsCache(cache, listVariables, (existing) => {
    const index = existing.items.findIndex((item) => item.id === id);

    if (index === -1) {
      if (inList && !wasInList) {
        return {
          total: existing.total + 1,
          items:
            listVariables.offset === 0
              ? [optimisticApp, ...existing.items].slice(0, listVariables.limit)
              : existing.items,
        };
      }
      return existing;
    }

    if (!inList) {
      return {
        total: Math.max(0, existing.total - 1),
        items: existing.items.filter((item) => item.id !== id),
      };
    }

    const items = [...existing.items];
    items[index] = optimisticApp;
    return { ...existing, items };
  });
}

export function applyOptimisticDelete(
  cache: ApolloCache<unknown>,
  listVariables: ApplicationsQueryVariables,
  id: string,
) {
  updateApplicationsCache(cache, listVariables, (existing) => {
    const hadItem = existing.items.some((item) => item.id === id);
    if (!hadItem) return existing;
    return {
      total: Math.max(0, existing.total - 1),
      items: existing.items.filter((item) => item.id !== id),
    };
  });
}
