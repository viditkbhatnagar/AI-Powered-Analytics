import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Endpoints that should automatically receive ?industry=<id> based on the active store value.
// Matched as exact paths or path prefixes (with trailing slash) so /api/charts/prebuilt/17 also matches.
const INDUSTRY_SCOPED_PREFIXES = [
  "/api/initiatives",
  "/api/trends",
  "/api/domains",
  "/api/salaries",
  "/api/certifications",
  "/api/companies",
  "/api/stats",
  "/api/charts/prebuilt",
];

function isIndustryScoped(path: string): boolean {
  // Detail endpoints that take a numeric id directly (e.g. /api/domains/26) are looked
  // up by primary key and don't need the industry filter.
  if (/\/api\/(domains|subdomains|industries)\/\d+$/.test(path)) return false;
  return INDUSTRY_SCOPED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export function withIndustry(path: string, industryId?: number | null): string {
  const id = industryId ?? useAppStore.getState().selectedIndustryId;
  if (!id) return path;
  if (!isIndustryScoped(path)) return path;
  if (/[?&]industry=/.test(path)) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}industry=${id}`;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Path is the first queryKey segment; further segments are concatenated as path params
    // (e.g. ['/api/domains', 26] -> /api/domains/26). For industry-scoped endpoints we
    // append ?industry=<active id> from the store unless one is already on the URL.
    const segments = (queryKey as unknown[]).filter((v) => v !== null && v !== undefined);
    let url = segments.map((v) => String(v)).join("/");
    url = withIndustry(url);

    const res = await fetch(url, { credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
