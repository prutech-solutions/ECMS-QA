/**
 * Persona definitions for ECMS multi-role testing.
 *
 * Each persona maps to a Salesforce permission-set-based role.
 * The `envSessionVar` is the .env key that holds the session ID
 * (or storage-state path) for that persona.
 */

export type OrgType = 'CBO' | 'FCCN' | 'both';

export interface Persona {
  /** Human-readable name used in test titles */
  name: string;
  /** Short key used in fixture lookups and file paths */
  key: string;
  /** Which org type(s) this persona operates under */
  orgType: OrgType;
  /** Environment variable name for the session ID */
  envSessionVar: string;
  /** Path to the stored auth state file */
  storageStatePath: string;
  /** Salesforce permission set group(s) associated with this persona */
  permissionSets: string[];
}

/** All known ECMS personas */
export const PERSONAS: Record<string, Persona> = {
  budgetCreator: {
    name: 'Budget Creator',
    key: 'budget-creator',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_BUDGET_CREATOR',
    storageStatePath: 'playwright/.auth/budget-creator.json',
    permissionSets: ['ECMS_External_Manage_Budgets'],
  },
  invoiceManager: {
    name: 'Invoice Manager',
    key: 'invoice-manager',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_INVOICE_MANAGER',
    storageStatePath: 'playwright/.auth/invoice-manager.json',
    permissionSets: ['ECMS_Invoices_External'],
  },
  siteManager: {
    name: 'Site Manager',
    key: 'site-manager',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_SITE_MANAGER',
    storageStatePath: 'playwright/.auth/site-manager.json',
    permissionSets: ['ECMS_External_Site_Management'],
  },
  vendorAdmin: {
    name: 'Vendor Admin',
    key: 'vendor-admin',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_VENDOR_ADMIN',
    storageStatePath: 'playwright/.auth/vendor-admin.json',
    permissionSets: ['ECMS_External_Vendor_Admin'],
  },
  enrollmentManager: {
    name: 'Enrollment Manager',
    key: 'enrollment-manager',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_ENROLLMENT_MANAGER',
    storageStatePath: 'playwright/.auth/enrollment-manager.json',
    permissionSets: ['ECMS_Create_Update_Enrollment'],
  },
  attendanceTaker: {
    name: 'Attendance Taker',
    key: 'attendance-taker',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_ATTENDANCE_TAKER',
    storageStatePath: 'playwright/.auth/attendance-taker.json',
    permissionSets: ['ECMS_External_Attendance_Management'],
  },
  affiliationManager: {
    name: 'Affiliation Manager',
    key: 'affiliation-manager',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_AFFILIATION_MANAGER',
    storageStatePath: 'playwright/.auth/affiliation-manager.json',
    permissionSets: ['ECMS_External_Affiliation_Management'],
  },
  educationSpecialist: {
    name: 'Education Specialist',
    key: 'education-specialist',
    orgType: 'CBO',
    envSessionVar: 'SF_SESSION_EDUCATION_SPECIALIST',
    storageStatePath: 'playwright/.auth/education-specialist.json',
    permissionSets: ['ECMS_Education_Specialist'],
  },
  familyWorker: {
    name: 'Family Worker',
    key: 'family-worker',
    orgType: 'CBO',
    envSessionVar: 'SF_SESSION_FAMILY_WORKER',
    storageStatePath: 'playwright/.auth/family-worker.json',
    permissionSets: ['ECMS_Family_Worker'],
  },
  educationDirector: {
    name: 'Education Director',
    key: 'education-director',
    orgType: 'CBO',
    envSessionVar: 'SF_SESSION_EDUCATION_DIRECTOR',
    storageStatePath: 'playwright/.auth/education-director.json',
    permissionSets: ['ECMS_Education_Director'],
  },
  monitoringSpecialist: {
    name: 'Monitoring Specialist',
    key: 'monitoring-specialist',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_MONITORING_SPECIALIST',
    storageStatePath: 'playwright/.auth/monitoring-specialist.json',
    permissionSets: ['ECMS_Internal_Monitoring'],
  },
  studentScreener: {
    name: 'Student Screener',
    key: 'student-screener',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_STUDENT_SCREENER',
    storageStatePath: 'playwright/.auth/student-screener.json',
    permissionSets: ['ECMS_External_Student_Screening'],
  },
  checklistManager: {
    name: 'Checklist Manager',
    key: 'checklist-manager',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_CHECKLIST_MANAGER',
    storageStatePath: 'playwright/.auth/checklist-manager.json',
    permissionSets: ['ECMS_Internal_Checklist_Manager'],
  },
  classroomCreator: {
    name: 'Classroom Creator',
    key: 'classroom-creator',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_CLASSROOM_CREATOR',
    storageStatePath: 'playwright/.auth/classroom-creator.json',
    permissionSets: ['ECMS_External_Classroom_Management'],
  },

  /* ── Internal / Admin personas ─────────────────────────────── */

  internalAdmin: {
    name: 'Internal Admin',
    key: 'internal-admin',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_INTERNAL_ADMIN',
    storageStatePath: 'playwright/.auth/internal-admin.json',
    permissionSets: ['ECMS_Internal_Admin'],
  },
  systemAdmin: {
    name: 'System Admin',
    key: 'system-admin',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_ID',
    storageStatePath: 'playwright/.auth/user.json',
    permissionSets: [],
  },
  enrollmentSpecialist: {
    name: 'Enrollment Specialist',
    key: 'enrollment-specialist',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_ENROLLMENT_SPECIALIST',
    storageStatePath: 'playwright/.auth/enrollment-specialist.json',
    permissionSets: ['ECMS_Internal_Enrollment_Specialist'],
  },
  checklistViewer: {
    name: 'External Checklist Viewer',
    key: 'checklist-viewer',
    orgType: 'both',
    envSessionVar: 'SF_SESSION_CHECKLIST_VIEWER',
    storageStatePath: 'playwright/.auth/checklist-viewer.json',
    permissionSets: ['ECMS_External_Checklist_Viewers'],
  },
};

/** Lookup a persona by key */
export function getPersona(key: string): Persona {
  const persona = Object.values(PERSONAS).find(p => p.key === key);
  if (!persona) {
    throw new Error(`Unknown persona key: "${key}". Available: ${Object.values(PERSONAS).map(p => p.key).join(', ')}`);
  }
  return persona;
}
