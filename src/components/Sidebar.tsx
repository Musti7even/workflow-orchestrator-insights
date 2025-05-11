
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  children: React.ReactNode;
}

export function SidebarWrapper({ children }: SidebarProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 space-y-6">
            <SidebarTrigger />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <ShadcnSidebar>
      <SidebarHeader>
        <div className="px-3 py-4 text-center">
          <h1 className="text-lg font-bold text-white">Workflow Automation</h1>
          <p className="text-xs text-muted-foreground">Management Platform</p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-xs">OPUS</Badge>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavigationMenu isActive={isActive} />
        <VerticalMenu isActive={isActive} />
        <ApiDocsMenu />
      </SidebarContent>
    </ShadcnSidebar>
  );
}

function NavigationMenu({ isActive }: { isActive: (path: string) => boolean }) {
  const navItems = [
    { title: "Dashboard", path: "/" },
    { title: "All Workflows", path: "/workflows" },
  ];

  return (
    <div className="px-3 py-2">
      <h2 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
        Navigation
      </h2>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link 
                to={item.path} 
                className={cn(
                  "w-full text-left",
                  isActive(item.path) ? "text-white font-medium" : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}

function VerticalMenu({ isActive }: { isActive: (path: string) => boolean }) {
  const verticalItems = [
    { title: "Customer Service", path: "/vertical/customer-service" },
    { title: "Human Resources", path: "/vertical/hr" },
    { title: "Financial Analysis", path: "/vertical/financial-analysis" },
  ];

  return (
    <div className="px-3 py-2">
      <h2 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
        Verticals
      </h2>
      <SidebarMenu>
        {verticalItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link 
                to={item.path} 
                className={cn(
                  "w-full text-left",
                  isActive(item.path) ? "text-white font-medium" : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}

function ApiDocsMenu() {
  return (
    <div className="px-3 py-2">
      <h2 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
        Developer
      </h2>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/api-docs" className="w-full text-left text-muted-foreground">
              API Documentation
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
