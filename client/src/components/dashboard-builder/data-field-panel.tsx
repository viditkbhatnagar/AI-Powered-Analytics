/**
 * Data Field Panel
 * Left sidebar for selecting data source and fields
 */

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  TrendingUp,
  Building2,
  DollarSign,
  Award,
  Briefcase,
  Users,
  GripVertical,
  Hash,
  Type,
} from 'lucide-react';
import { DATA_FIELDS, type DataSourceType, type DataField } from './types';
import { cn } from '@/lib/utils';

interface DataFieldPanelProps {
  selectedDataSource: DataSourceType | null;
  onSelectDataSource: (source: DataSourceType) => void;
  onDragField: (field: DataField, source: DataSourceType) => void;
}

const DATA_SOURCE_ICONS: Record<DataSourceType, typeof TrendingUp> = {
  initiatives: TrendingUp,
  domains: Building2,
  salaries: DollarSign,
  certifications: Award,
  companies: Briefcase,
  roles: Users,
};

const DATA_SOURCE_LABELS: Record<DataSourceType, string> = {
  initiatives: 'UAE Initiatives',
  domains: 'Supply Chain Domains',
  salaries: 'Salary Data',
  certifications: 'Certifications',
  companies: 'Companies',
  roles: 'Job Roles',
};

export function DataFieldPanel({
  selectedDataSource,
  onSelectDataSource,
  onDragField,
}: DataFieldPanelProps) {
  const [expandedSources, setExpandedSources] = useState<DataSourceType[]>(['initiatives', 'domains', 'salaries']);

  const toggleSource = (source: DataSourceType) => {
    setExpandedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleDragStart = (e: React.DragEvent, field: DataField, source: DataSourceType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ field, source }));
    e.dataTransfer.effectAllowed = 'copy';
    onDragField(field, source);
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Data Fields
        </h2>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Drag fields to configure charts
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {(Object.keys(DATA_FIELDS) as DataSourceType[]).map((source) => {
            const Icon = DATA_SOURCE_ICONS[source];
            const fields = DATA_FIELDS[source];
            const isExpanded = expandedSources.includes(source);
            const isSelected = selectedDataSource === source;

            return (
              <Collapsible
                key={source}
                open={isExpanded}
                onOpenChange={() => toggleSource(source)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "hover:bg-accent",
                    isSelected && "bg-primary/10 text-primary"
                  )}
                  onClick={() => onSelectDataSource(source)}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{DATA_SOURCE_LABELS[source]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {fields.length}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pl-2 pt-1">
                  <div className="space-y-0.5 border-l-2 border-border pl-4">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, field, source)}
                        className={cn(
                          "group flex cursor-grab items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          "hover:bg-accent active:cursor-grabbing",
                          "select-none"
                        )}
                      >
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                        {field.type === 'number' ? (
                          <Hash className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <Type className="h-3.5 w-3.5 text-green-500" />
                        )}
                        <span className="flex-1 truncate">{field.label}</span>
                        {field.aggregatable && (
                          <Badge variant="outline" className="h-4 px-1 text-[10px] opacity-60">
                            Σ
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
