import { toast } from "sonner";
import { WorkflowEntry, WorkflowStatus, WorkflowType } from "@/types/workflow";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";

// Fetch all workflow entries from the database
export async function fetchWorkflowEntries(): Promise<WorkflowEntry[]> {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match our WorkflowEntry interface
    return data.map(item => ({
      id: item.id,
      timestamp: item.created_at,
      type: item.type as WorkflowType,
      inputData: item.input_data as Record<string, any>,
      status: item.status as WorkflowStatus,
      outcome: item.outcome as Record<string, any> | undefined
    }));
  } catch (error) {
    console.error('Error fetching workflow entries:', error);
    toast.error('Failed to load workflow entries');
    return [];
  }
}

export async function fetchWorkflowEntry(id: string): Promise<WorkflowEntry | null> {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }

    // Transform the data to match our WorkflowEntry interface
    return {
      id: data.id,
      timestamp: data.created_at,
      type: data.type as WorkflowType,
      inputData: data.input_data as Record<string, any>,
      status: data.status as WorkflowStatus,
      outcome: data.outcome as Record<string, any> | undefined
    };
  } catch (error) {
    console.error(`Error fetching workflow entry ${id}:`, error);
    toast.error('Failed to load workflow entry');
    return null;
  }
}

export async function createWorkflowEntry(
  type: WorkflowType, 
  inputData: Record<string, any>
): Promise<WorkflowEntry | null> {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .insert([
        { 
          type, 
          input_data: inputData,
          status: 'pending' 
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success('New workflow created successfully');
    
    // Return the formatted workflow entry
    return {
      id: data.id,
      timestamp: data.created_at,
      type: data.type as WorkflowType,
      inputData: data.input_data as Record<string, any>,
      status: data.status as WorkflowStatus,
      outcome: data.outcome as Record<string, any> | undefined
    };
  } catch (error) {
    console.error('Error creating workflow entry:', error);
    toast.error('Failed to create workflow entry');
    return null;
  }
}

export async function updateWorkflowStatus(
  id: string,
  status: WorkflowStatus,
  outcome?: Record<string, any>
): Promise<WorkflowEntry | null> {
  try {
    const updateData: any = { status };
    if (outcome) {
      updateData.outcome = outcome;
    }
    
    const { data, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success(`Workflow status updated to ${status}`);
    
    // Return the formatted workflow entry
    return {
      id: data.id,
      timestamp: data.created_at,
      type: data.type as WorkflowType,
      inputData: data.input_data as Record<string, any>,
      status: data.status as WorkflowStatus,
      outcome: data.outcome as Record<string, any> | undefined
    };
  } catch (error) {
    console.error(`Error updating workflow entry ${id}:`, error);
    toast.error('Failed to update workflow status');
    return null;
  }
}

// These functions handle webhook/HTTP requests for workflows
export async function webhookCreateWorkflow(req: Request): Promise<Response> {
  try {
    console.log(`[Webhook] Create workflow - Processing request`);
    const data = await req.json();
    const { type, inputData } = data;
    
    console.log(`[Webhook] Create workflow - Type: ${type}, Input data:`, inputData);
    
    if (!type || !inputData) {
      console.error(`[Webhook] Create workflow - Missing required fields: type=${type}, inputData=${!!inputData}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields', 
        details: `Required fields: type and inputData. Provided: ${type ? 'type' : ''}${(!type && !inputData) ? ' and ' : ''}${inputData ? 'inputData' : ''}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`[Webhook] Create workflow - Inserting into database`);
    const { data: insertedData, error } = await supabaseAdmin
      .from('workflows')
      .insert([
        { type, input_data: inputData, status: 'pending' }
      ])
      .select()
      .single();
    
    if (error) {
      console.error(`[Webhook] Create workflow - Database error:`, error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database error', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`[Webhook] Create workflow - Successfully created: ID=${insertedData.id}`);
    
    // Format the response to match our API structure
    const responseData = {
      success: true,
      message: `Workflow created successfully with ID: ${insertedData.id}`,
      data: {
        id: insertedData.id,
        timestamp: insertedData.created_at,
        type: insertedData.type,
        inputData: insertedData.input_data,
        status: insertedData.status
      }
    };
    
    return new Response(JSON.stringify(responseData), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Webhook] Create workflow - Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function webhookUpdateWorkflow(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Extract ID from URL
    
    console.log(`[Webhook] Update workflow - Processing request for ID: ${id}`);
    
    const data = await req.json();
    const { status, outcome } = data;
    
    console.log(`[Webhook] Update workflow - Updating to status: ${status}, Outcome:`, outcome || 'none');
    
    if (!id || !status) {
      console.error(`[Webhook] Update workflow - Missing required fields: id=${id}, status=${status}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields', 
        details: `Required fields: id and status. ${!id ? 'ID is missing.' : ''} ${!status ? 'Status is missing.' : ''}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if workflow exists before updating
    const { data: existingWorkflow, error: checkError } = await supabaseAdmin
      .from('workflows')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError || !existingWorkflow) {
      console.error(`[Webhook] Update workflow - Workflow not found with ID: ${id}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Workflow not found', 
        details: `No workflow found with ID: ${id}`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const updateData: any = { status };
    if (outcome) {
      updateData.outcome = outcome;
    }
    
    console.log(`[Webhook] Update workflow - Updating database record`);
    const { data: updatedData, error } = await supabaseAdmin
      .from('workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`[Webhook] Update workflow - Database error:`, error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database error', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`[Webhook] Update workflow - Successfully updated: ID=${updatedData.id}, Status=${updatedData.status}`);
    
    // Format the response to match our API structure
    const responseData = {
      success: true,
      message: `Workflow ${id} updated successfully to status: ${status}`,
      data: {
        id: updatedData.id,
        status: updatedData.status,
        outcome: updatedData.outcome,
        updated: updatedData.updated_at
      }
    };
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Webhook] Update workflow - Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
