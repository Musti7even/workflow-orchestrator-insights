
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarWrapper } from "@/components/Sidebar";
import Dashboard from "./pages/Index";
import WorkflowsList from "./pages/WorkflowsList";
import WorkflowDetail from "./pages/WorkflowDetail";
import VerticalView from "./pages/VerticalView";
import ApiDocs from "./pages/ApiDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <SidebarWrapper>
              <Dashboard />
            </SidebarWrapper>
          } />
          <Route path="/workflows" element={
            <SidebarWrapper>
              <WorkflowsList />
            </SidebarWrapper>
          } />
          <Route path="/workflow/:id" element={
            <SidebarWrapper>
              <WorkflowDetail />
            </SidebarWrapper>
          } />
          <Route path="/vertical/:vertical" element={
            <SidebarWrapper>
              <VerticalView />
            </SidebarWrapper>
          } />
          <Route path="/api-docs" element={
            <SidebarWrapper>
              <ApiDocs />
            </SidebarWrapper>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
