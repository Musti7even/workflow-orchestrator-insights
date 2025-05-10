export type WorkflowStatus = 'pending' | 'completed' | 'failed';

export type WorkflowType = 'customer_service' | 'hr' | 'financial_analyst';

export interface WorkflowEntry {
  id: string;
  custom_id?: string;
  timestamp: string;
  type: WorkflowType;
  inputData: Record<string, any>;
  status: WorkflowStatus;
  outcome?: Record<string, any>;
}
