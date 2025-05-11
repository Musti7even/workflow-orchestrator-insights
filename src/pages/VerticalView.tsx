
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { WorkflowEntry } from "@/types/workflow";
import { fetchWorkflowEntries } from "@/services/api";
import WorkflowEntryComponent from "@/components/WorkflowEntry";
import VerticalMetrics from "@/components/verticals/VerticalMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type VerticalType = "customer-service" | "hr" | "financial-analysis";

const verticalMapping: Record<VerticalType, string> = {
  "customer-service": "customer_service",
  "hr": "hr",
  "financial-analysis": "financial_analyst"
};

const getVerticalTitle = (vertical: VerticalType): string => {
  switch(vertical) {
    case "customer-service": return "Customer Service";
    case "hr": return "Human Resources";
    case "financial-analysis": return "Financial Analysis";
  }
};

export default function VerticalView() {
  const { vertical } = useParams<{ vertical: VerticalType }>();
  const [workflows, setWorkflows] = useState<WorkflowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      if (!vertical || !verticalMapping[vertical]) return;
      
      try {
        const data = await fetchWorkflowEntries();
        const filteredData = data.filter(
          wf => wf.type === verticalMapping[vertical]
        );
        setWorkflows(filteredData);
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [vertical]);

  if (!vertical || !verticalMapping[vertical]) {
    return <Navigate to="/workflows" />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">
          {getVerticalTitle(vertical)} Workflows
        </h1>
        <p className="text-muted-foreground">
          View and manage {getVerticalTitle(vertical).toLowerCase()} automation workflows.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading workflows...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Analytics Dashboard for this vertical */}
          <VerticalMetrics 
            workflows={workflows} 
            verticalType={verticalMapping[vertical]} 
          />
          
          {/* Workflows List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Workflows</h2>
            {workflows.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p>No {getVerticalTitle(vertical).toLowerCase()} workflows found.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                  <WorkflowEntryComponent key={workflow.id} workflow={workflow} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
