
import { useEffect, useState } from "react";
import { WorkflowEntry } from "@/types/workflow";
import { fetchWorkflowEntries } from "@/services/api";
import DashboardMetrics from "@/components/DashboardMetrics";
import WorkflowEntryComponent from "@/components/WorkflowEntry";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<WorkflowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchWorkflowEntries();
        setWorkflows(data);
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <div className="space-y-10 animate-fade-in"> {/* Increased spacing between main sections */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your automated workflow processes.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/workflows">View All Workflows</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading metrics...</p>
        </div>
      ) : (
        <DashboardMetrics workflows={workflows} />
      )}

      <div className="grid grid-cols-1 gap-6 pb-6"> {/* Added bottom padding */}
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Workflows</CardTitle>
            <CardDescription>
              The latest workflow events across all verticals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Loading workflows...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 6)
                  .map((workflow) => (
                    <WorkflowEntryComponent key={workflow.id} workflow={workflow} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
