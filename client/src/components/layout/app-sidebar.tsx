import { Link, useLocation } from "wouter";
import {
  Home,
  Layers,
  BarChart3,
  PanelLeft,
  Upload,
  GitCompare,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Domains", url: "/domains", icon: Layers },
  { title: "Visualizations", url: "/visualizations", icon: BarChart3 },
  { title: "Dashboard Builder", url: "/dashboard-builder", icon: PanelLeft },
  { title: "Upload Data", url: "/upload", icon: Upload },
  { title: "Compare", url: "/compare", icon: GitCompare },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#45BFD3]/25 to-[#2196F3]/25 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <img 
              src="/logo.png" 
              alt="AI-Powered Analytics Logo" 
              className="relative h-11 w-11 object-contain rounded-lg transition-all duration-300 group-hover:scale-110"
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(69, 191, 211, 0.2))'
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold bg-gradient-to-r from-[#1976D2] to-[#45BFD3] bg-clip-text text-transparent">AI-Powered Analytics</span>
            <span className="text-xs text-muted-foreground">Career Analytics</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location === "/settings"}
              data-testid="nav-settings"
            >
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
