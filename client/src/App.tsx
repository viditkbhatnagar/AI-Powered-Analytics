import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import DomainsPage from "@/pages/domains";
import DomainDetailPage from "@/pages/domain-detail";
import VisualizationsPage from "@/pages/visualizations";
import VisualizationDetailPage from "@/pages/visualization-detail";
import DashboardBuilderPage from "@/pages/dashboard-builder";
import UploadPage from "@/pages/upload";
import ComparePage from "@/pages/compare";
import SettingsPage from "@/pages/settings";

function Router() {
  const [location] = useLocation();
  const isLandingPage = location === "/";

  if (isLandingPage) {
    return <LandingPage />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/dashboard" component={HomePage} />
              <Route path="/domains" component={DomainsPage} />
              <Route path="/domains/:id" component={DomainDetailPage} />
              <Route path="/visualizations" component={VisualizationsPage} />
              <Route path="/visualizations/:id" component={VisualizationDetailPage} />
              <Route path="/dashboard-builder" component={DashboardBuilderPage} />
              <Route path="/upload" component={UploadPage} />
              <Route path="/compare" component={ComparePage} />
              <Route path="/settings" component={SettingsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
