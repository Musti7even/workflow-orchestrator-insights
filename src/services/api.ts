import { toast } from "sonner";
import { WorkflowEntry, WorkflowStatus, WorkflowType } from "@/types/workflow";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";

// Interface for the database response that includes custom_id
export interface WorkflowDbResponse {
  id: string;
  custom_id?: string;
  created_at: string;
  updated_at: string;
  type: string;
  input_data: any;
  status: string;
  outcome: any;
}

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
    return data.map(item => {
      const typedItem = item as WorkflowDbResponse;
      return {
        id: typedItem.id,
        custom_id: typedItem.custom_id,
        timestamp: typedItem.created_at,
        type: typedItem.type as WorkflowType,
        inputData: typedItem.input_data as Record<string, any>,
        status: typedItem.status as WorkflowStatus,
        outcome: typedItem.outcome as Record<string, any> | undefined
      };
    });
  } catch (error) {
    console.error('Error fetching workflow entries:', error);
    toast.error('Failed to load workflow entries');
    return [];
  }
}

export async function fetchWorkflowEntry(id: string, useCustomId: boolean = false): Promise<WorkflowEntry | null> {
  try {
    let query = supabase
      .from('workflows')
      .select('*');
      
    // Use either id or custom_id for the query
    if (useCustomId) {
      query = query.eq('custom_id', id);
    } else {
      query = query.eq('id', id);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      throw error;
    }

    // Cast to our interface to help TypeScript recognize custom_id
    const typedData = data as WorkflowDbResponse;

    // Transform the data to match our WorkflowEntry interface
    return {
      id: typedData.id,
      custom_id: typedData.custom_id,
      timestamp: typedData.created_at,
      type: typedData.type as WorkflowType,
      inputData: typedData.input_data as Record<string, any>,
      status: typedData.status as WorkflowStatus,
      outcome: typedData.outcome as Record<string, any> | undefined
    };
  } catch (error) {
    console.error(`Error fetching workflow entry ${id}:`, error);
    toast.error('Failed to load workflow entry');
    return null;
  }
}

export async function createWorkflowEntry(
  type: WorkflowType, 
  inputData: Record<string, any>,
  custom_id?: string
): Promise<WorkflowEntry | null> {
  try {
    const insertData: any = { 
      type, 
      input_data: inputData,
      status: 'pending' 
    };
    
    if (custom_id) {
      insertData.custom_id = custom_id;
    }
    
    const { data, error } = await supabase
      .from('workflows')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success('New workflow created successfully');
    
    // Return the formatted workflow entry
    return {
      id: data.id,
      custom_id: data.custom_id,
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
  outcome?: Record<string, any>,
  useCustomId: boolean = false
): Promise<WorkflowEntry | null> {
  try {
    const updateData: any = { status };
    if (outcome) {
      updateData.outcome = outcome;
    }
    
    let query = supabase
      .from('workflows')
      .update(updateData);
      
    // Use either id or custom_id for the query
    if (useCustomId) {
      query = query.eq('custom_id', id);
    } else {
      query = query.eq('id', id);
    }
    
    const { data, error } = await query
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success(`Workflow status updated to ${status}`);
    
    // Cast to our interface to help TypeScript recognize custom_id
    const typedData = data as WorkflowDbResponse;
    
    // Return the formatted workflow entry
    return {
      id: typedData.id,
      custom_id: typedData.custom_id,
      timestamp: typedData.created_at,
      type: typedData.type as WorkflowType,
      inputData: typedData.input_data as Record<string, any>,
      status: typedData.status as WorkflowStatus,
      outcome: typedData.outcome as Record<string, any> | undefined
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
    const { type, inputData, custom_id } = data;
    
    console.log(`[Webhook] Create workflow - Type: ${type}, Input data:`, inputData, custom_id ? `, Custom ID: ${custom_id}` : '');
    
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
    
    // If custom_id is provided, check if it already exists to avoid duplicates
    if (custom_id) {
      const { data: existingWorkflow, error: checkError } = await supabaseAdmin
        .from('workflows')
        .select('id')
        .eq('custom_id', custom_id)
        .single();
      
      if (existingWorkflow) {
        console.error(`[Webhook] Create workflow - Duplicate custom_id: ${custom_id}`);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Duplicate custom_id', 
          details: `A workflow with custom_id "${custom_id}" already exists`
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    console.log(`[Webhook] Create workflow - Inserting into database`);
    const insertData: any = { 
      type, 
      input_data: inputData, 
      status: 'pending' 
    };
    
    // Add custom_id to insert data if provided
    if (custom_id) {
      insertData.custom_id = custom_id;
    }
    
    const { data: insertedData, error } = await supabaseAdmin
      .from('workflows')
      .insert([insertData])
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
    
    // Explicitly cast the response to our interface
    const typedData = insertedData as WorkflowDbResponse;
    
    console.log(`[Webhook] Create workflow - Successfully created: ID=${typedData.id}${typedData.custom_id ? `, Custom ID=${typedData.custom_id}` : ''}`);
    
    // Format the response to match our API structure
    const responseData = {
      success: true,
      message: `Workflow created successfully with ID: ${typedData.id}${typedData.custom_id ? ` and Custom ID: ${typedData.custom_id}` : ''}`,
      data: {
        id: typedData.id,
        custom_id: typedData.custom_id,
        timestamp: typedData.created_at,
        type: typedData.type,
        inputData: typedData.input_data,
        status: typedData.status
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
    const idParam = pathParts[pathParts.length - 1]; // Extract ID from URL
    
    console.log(`[Webhook] Update workflow - Processing request for ID: ${idParam}`);
    
    const data = await req.json();
    const { status, outcome, custom_id } = data;
    
    console.log(`[Webhook] Update workflow - Updating to status: ${status}, Outcome:`, outcome || 'none');
    
    if (!idParam || !status) {
      console.error(`[Webhook] Update workflow - Missing required fields: id=${idParam}, status=${status}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields', 
        details: `Required fields: id and status. ${!idParam ? 'ID is missing.' : ''} ${!status ? 'Status is missing.' : ''}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Determine if we're using custom_id or regular id
    const isUsingCustomId = custom_id === true; // If custom_id flag is set to true, treat idParam as a custom_id
    console.log(`[Webhook] Update workflow - Using ${isUsingCustomId ? 'custom_id' : 'id'} for lookup`);
    
    // Check if workflow exists before updating
    let query = supabaseAdmin.from('workflows').select('*');
    
    // Apply the appropriate filter based on whether we're using custom_id
    if (isUsingCustomId) {
      query = query.eq('custom_id', idParam);
    } else {
      query = query.eq('id', idParam);
    }
    
    const { data: existingWorkflow, error: checkError } = await query.single();
    
    if (checkError || !existingWorkflow) {
      console.error(`[Webhook] Update workflow - Workflow not found with ${isUsingCustomId ? 'custom_id' : 'id'}: ${idParam}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Workflow not found', 
        details: `No workflow found with ${isUsingCustomId ? 'custom_id' : 'id'}: ${idParam}`
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
    let updateQuery = supabaseAdmin
      .from('workflows')
      .update(updateData);
      
    // Apply the appropriate filter based on whether we're using custom_id
    if (isUsingCustomId) {
      updateQuery = updateQuery.eq('custom_id', idParam);
    } else {
      updateQuery = updateQuery.eq('id', idParam);
    }
    
    const { data: updatedData, error } = await updateQuery.select().single();
    
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
    
    // Explicitly cast the response to our interface
    const typedData = updatedData as WorkflowDbResponse;
    
    console.log(`[Webhook] Update workflow - Successfully updated: ID=${typedData.id}, ${typedData.custom_id ? `Custom ID=${typedData.custom_id},` : ''} Status=${typedData.status}`);
    
    // Format the response to match our API structure
    const responseData = {
      success: true,
      message: `Workflow ${idParam} updated successfully to status: ${status}`,
      data: {
        id: typedData.id,
        custom_id: typedData.custom_id,
        status: typedData.status,
        outcome: typedData.outcome,
        updated: typedData.updated_at
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
