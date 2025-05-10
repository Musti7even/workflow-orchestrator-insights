
import { WorkflowEntry as WorkflowEntryType, WorkflowType } from "@/types/workflow";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";
import { format } from "date-fns";
import { FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface WorkflowEntryProps {
  workflow: WorkflowEntryType;
  className?: string;
}

export default function WorkflowEntry({ workflow, className }: WorkflowEntryProps) {
  const { id, timestamp, type, inputData, status } = workflow;
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy • h:mm a");
    } catch {
      return dateString;
    }
  };
  
  const getTypeLabel = (type: WorkflowType) => {
    switch(type) {
      case "customer_service":
        return "Customer Service";
      case "hr":
        return "Human Resources";
      case "financial_analyst":
        return "Financial Analysis";
      default:
        return type;
    }
  };
  
  const getTypeColor = (type: WorkflowType) => {
    switch(type) {
      case "customer_service":
        return "text-blue-400";
      case "hr":
        return "text-purple-400";
      case "financial_analyst":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };
  
  // Generate a summary based on the input data
  const getSummary = () => {
    if (type === "customer_service" && inputData.subject) {
      return inputData.subject;
    }
    
    if (type === "hr" && inputData.requestType) {
      return `${inputData.requestType.replace(/_/g, ' ')} request`;
    }
    
    if (type === "financial_analyst" && inputData.analysisType) {
      return `${inputData.analysisType.replace(/_/g, ' ')}`;
    }
    
    return `${getTypeLabel(type)} workflow`;
  };

  return (
    <Link to={`/workflow/${id}`} className="block">
      <Card className={cn(
        "glass-card hover:border-white/20 transition-all duration-200 overflow-hidden group",
        className
      )}>
        <CardHeader className="p-4 border-b border-white/5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="font-semibold leading-none tracking-tight">{getSummary()}</p>
              <p className={cn("text-xs opacity-70", getTypeColor(type))}>
                {getTypeLabel(type)}
              </p>
            </div>
            <StatusBadge status={status} size="sm" />
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground mb-3">
            <Clock size={14} />
            <span className="text-xs">{formatDate(timestamp)}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <FileText size={16} className="mt-0.5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground overflow-hidden">
              {Object.entries(inputData).slice(0, 2).map(([key, value]) => (
                <div key={key} className="truncate">
                  <span className="font-medium">{key.replace(/_/g, ' ')}:</span>{" "}
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </div>
              ))}
              {Object.keys(inputData).length > 2 && (
                <p className="text-xs opacity-60">+ {Object.keys(inputData).length - 2} more fields</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 border-t border-white/5 opacity-0 -mt-4 transition-all duration-200 group-hover:opacity-100 group-hover:mt-0">
          <p className="text-xs text-primary hover:underline">View details →</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
