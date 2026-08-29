import { supabase } from './SupabaseClient';

/**
 * Save Citizen Boundary Report to Supabase
 */
export async function saveBoundaryReport(data: {
  ulpin: string;
  discrepancyCategory: string;
  applicantName: string;
  description: string;
  attachmentUrl?: string;
}) {
  const { data: result, error } = await supabase
    .from('boundary_discrepancy_reports')
    .insert([
      {
        ulpin: data.ulpin,
        discrepancy_category: data.discrepancyCategory,
        applicant_name: data.applicantName,
        description: data.description,
        attachment_url: data.attachmentUrl || null,
        status: 'Pending Review',
      },
    ])
    .select();

  if (error) {
    console.error('Error saving boundary report to Supabase:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: result };
}

/**
 * Save Citizen Property Correction or Transfer Application to Supabase
 */
export async function saveCorrectionApplication(data: {
  applicationType: 'transfer' | 'correction';
  ulpin: string;
  currentOwner: string;
  newOwnerName?: string;
  saleDeedRef?: string;
  correctionDetails?: string;
}) {
  const { data: result, error } = await supabase
    .from('property_correction_applications')
    .insert([
      {
        application_type: data.applicationType,
        ulpin: data.ulpin,
        current_owner: data.currentOwner,
        new_owner_name: data.newOwnerName || null,
        sale_deed_ref: data.saleDeedRef || null,
        correction_details: data.correctionDetails || null,
        status: 'Under Review',
      },
    ])
    .select();

  if (error) {
    console.error('Error saving application to Supabase:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: result };
}