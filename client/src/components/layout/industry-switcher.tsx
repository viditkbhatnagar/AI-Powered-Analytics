import { Plane, ShoppingBag, Truck, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelectedIndustry } from "@/hooks/use-industry";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  "shopping-bag": ShoppingBag,
  truck: Truck,
};

function IndustryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICON_MAP[icon] ?? Building;
  return <Icon className={className} />;
}

export function IndustrySwitcher() {
  const { industries, current, setSelectedIndustryId } = useSelectedIndustry();

  if (industries.length <= 1) return null;

  return (
    <div className="px-4 pt-3 pb-1">
      <label className="text-xs text-muted-foreground mb-1.5 block">Industry</label>
      <Select
        value={current ? String(current.id) : undefined}
        onValueChange={(v) => setSelectedIndustryId(Number(v))}
      >
        <SelectTrigger className="h-9 text-sm" data-testid="industry-switcher">
          <SelectValue placeholder="Select industry">
            {current ? (
              <span className="flex items-center gap-2">
                <IndustryIcon icon={current.icon} className="h-4 w-4 shrink-0" />
                <span className="truncate">{current.name}</span>
              </span>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {industries.map((i) => (
            <SelectItem key={i.id} value={String(i.id)}>
              <span className="flex items-center gap-2">
                <IndustryIcon icon={i.icon} className="h-4 w-4 shrink-0" />
                <span>{i.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
