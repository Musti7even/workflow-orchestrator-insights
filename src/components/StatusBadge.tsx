
import { WorkflowStatus } from "@/types/workflow";
import { Check, X, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ 
  status, 
  className, 
  showIcon = true, 
  size = "md" 
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs py-0.5 px-2",
    md: "text-sm py-1 px-3",
    lg: "text-base py-1.5 px-4"
  };
  
  const getStatusProps = () => {
    switch(status) {
      case "completed":
        return {
          icon: <Check size={size === "sm" ? 12 : 16} />,
          bgClass: "bg-workflow-completed bg-opacity-20",
          textClass: "text-workflow-completed",
          label: "Completed"
        };
      case "failed":
        return {
          icon: <X size={size === "sm" ? 12 : 16} />,
          bgClass: "bg-workflow-failed bg-opacity-20",
          textClass: "text-workflow-failed",
          label: "Failed"
        };
      case "pending":
      default:
        return {
          icon: <Loader size={size === "sm" ? 12 : 16} className="animate-spin" />,
          bgClass: "bg-workflow-pending bg-opacity-20",
          textClass: "text-workflow-pending",
          label: "Pending"
        };
    }
  };
  
  const { icon, bgClass, textClass, label } = getStatusProps();
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      bgClass,
      textClass,
      sizeClasses[size],
      className
    )}>
      {showIcon && icon}
      {label}
    </span>
  );
}
