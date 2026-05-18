import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import type { Industry } from "@shared/schema";

const PREFERRED_DEFAULT_NAME = "Supply Chain & Logistics";

export function useIndustries() {
  return useQuery<Industry[]>({
    queryKey: ["/api/industries"],
    queryFn: async () => {
      const res = await fetch("/api/industries");
      if (!res.ok) throw new Error("Failed to fetch industries");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Reads the selected industry from the store. On first load (no persisted value), picks
// PREFERRED_DEFAULT_NAME if it exists, else the first industry returned by the API.
export function useSelectedIndustry() {
  const { data: industries } = useIndustries();
  const selectedIndustryId = useAppStore((s) => s.selectedIndustryId);
  const setSelectedIndustryId = useAppStore((s) => s.setSelectedIndustryId);

  useEffect(() => {
    if (!industries || industries.length === 0) return;
    const stillExists = selectedIndustryId != null && industries.some((i) => i.id === selectedIndustryId);
    if (stillExists) return;
    const fallback = industries.find((i) => i.name === PREFERRED_DEFAULT_NAME) ?? industries[0];
    setSelectedIndustryId(fallback.id);
  }, [industries, selectedIndustryId, setSelectedIndustryId]);

  const current = industries?.find((i) => i.id === selectedIndustryId) ?? null;
  return { industries: industries ?? [], current, selectedIndustryId, setSelectedIndustryId };
}

// Convenience for query keys / URLs. Returns the id once the store is hydrated and we
// have at least one industry; null otherwise so callers can skip the fetch.
export function useIndustryId(): number | null {
  const { selectedIndustryId } = useSelectedIndustry();
  return selectedIndustryId ?? null;
}
