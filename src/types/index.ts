export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "SITE_SUPERVISOR"
  | "FINANCE"
  | "CLIENT";

export type ProjectStatus =
  | "ENQUIRY"
  | "CONSULTATION"
  | "SITE_ASSESSMENT"
  | "PLANNING"
  | "PROPOSAL"
  | "CONTRACT"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type ProjectHealth =
  | "ON_TRACK"
  | "AT_RISK"
  | "DELAYED"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

export type MilestoneStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "APPROVED"
  | "ON_HOLD";

export type MilestoneApprovalStatus =
  | "PENDING"
  | "AWAITING_CLIENT"
  | "APPROVED"
  | "REJECTED"
  | "REVISION_REQUESTED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESSFUL"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "CANCELLED";

export type ChangeOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "IMPLEMENTED";

export type ConsultationStatus =
  | "NEW"
  | "REVIEWING"
  | "CONTACTED"
  | "SCHEDULED"
  | "COMPLETED"
  | "REJECTED";

export type DocumentCategory =
  | "ARCHITECTURAL_DRAWING"
  | "STRUCTURAL_DRAWING"
  | "ELECTRICAL_PLAN"
  | "PLUMBING_PLAN"
  | "BOQ"
  | "CONTRACT"
  | "PERMIT"
  | "INVOICE"
  | "RECEIPT"
  | "REPORT"
  | "WARRANTY"
  | "PHOTO"
  | "VIDEO"
  | "OTHER";

export type Currency = "NGN" | "USD" | "GBP" | "CAD" | "EUR" | "AUD";

export type ProjectType =
  | "RESIDENTIAL_NEW_BUILD"
  | "RESIDENTIAL_RENOVATION"
  | "RESIDENTIAL_FINISHING"
  | "COMMERCIAL_NEW_BUILD"
  | "COMMERCIAL_RENOVATION"
  | "SITE_PREPARATION"
  | "MAINTENANCE"
  | "OTHER";

export type LandStatus =
  | "OWNED_WITH_TITLE"
  | "OWNED_WITHOUT_TITLE"
  | "FAMILY_LAND"
  | "NOT_YET_ACQUIRED"
  | "OTHER";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";

export type NotificationType =
  | "PROJECT_CREATED"
  | "MILESTONE_STARTED"
  | "MILESTONE_COMPLETED"
  | "MILESTONE_AWAITING_APPROVAL"
  | "CLIENT_APPROVAL_RECEIVED"
  | "PAYMENT_RECORDED"
  | "PAYMENT_REMINDER"
  | "NEW_UPDATE"
  | "NEW_DOCUMENT"
  | "NEW_MESSAGE"
  | "PROJECT_DELAY"
  | "PROJECT_COMPLETED"
  | "CONSULTATION_RECEIVED"
  | "CHANGE_ORDER_SUBMITTED"
  | "CHANGE_ORDER_APPROVED";

export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED";
export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type BudgetItemCategory =
  | "MATERIAL"
  | "LABOUR"
  | "CONTRACTOR"
  | "PROFESSIONAL_FEES"
  | "LOGISTICS"
  | "PROXYBUILD_FEE"
  | "CONTINGENCY"
  | "OTHER";

export type LedgerEntryType =
  | "CLIENT_PAYMENT"
  | "MATERIAL_COST"
  | "LABOUR_COST"
  | "CONTRACTOR_COST"
  | "PROFESSIONAL_FEE"
  | "LOGISTICS"
  | "OTHER_EXPENSE"
  | "REFUND"
  | "ADJUSTMENT"
  | "CHANGE_ORDER"
  | "PROXYBUILD_FEE";
