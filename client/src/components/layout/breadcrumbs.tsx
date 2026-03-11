import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

interface BreadcrumbConfig {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  domains: "Domains",
  visualizations: "Visualizations",
  "dashboard-builder": "Dashboard Builder",
  upload: "Upload Data",
  compare: "Compare",
  settings: "Settings",
};

export function Breadcrumbs() {
  const [location] = useLocation();
  const pathParts = location.split("/").filter(Boolean);

  if (pathParts.length === 0) {
    return null;
  }

  const breadcrumbs: BreadcrumbConfig[] = pathParts.map((part, index) => {
    const href = "/" + pathParts.slice(0, index + 1).join("/");
    const isLast = index === pathParts.length - 1;
    const label = routeLabels[part] || decodeURIComponent(part);

    return {
      label,
      href: isLast ? undefined : href,
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only md:not-sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={index}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
