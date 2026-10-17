import {
  Bell,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  FileText,
  AlertCircle,
  Info,
  FolderPlus,
  PlayCircle,
  ClipboardCheck,
} from "lucide-react";

// Keys must match notificationTypeEnum in db/schema/communications.ts
export function NotificationIcon({ type }: { type: string }) {
  const cls = "h-4 w-4";
  switch (type) {
    case "PROJECT_CREATED":
      return <FolderPlus className={`${cls} text-[var(--pb-green)]`} />;
    case "MILESTONE_STARTED":
      return <PlayCircle className={`${cls} text-blue-400`} />;
    case "MILESTONE_COMPLETED":
    case "CLIENT_APPROVAL_RECEIVED":
    case "CHANGE_ORDER_APPROVED":
    case "PROJECT_COMPLETED":
      return <CheckCircle2 className={`${cls} text-[var(--pb-success)]`} />;
    case "MILESTONE_AWAITING_APPROVAL":
    case "CHANGE_ORDER_SUBMITTED":
      return <ClipboardCheck className={`${cls} text-yellow-500`} />;
    case "PAYMENT_RECORDED":
    case "PAYMENT_REMINDER":
      return <DollarSign className={`${cls} text-yellow-500`} />;
    case "NEW_MESSAGE":
      return <MessageSquare className={`${cls} text-blue-400`} />;
    case "NEW_DOCUMENT":
      return <FileText className={`${cls} text-purple-400`} />;
    case "NEW_UPDATE":
      return <Info className={`${cls} text-[var(--pb-green)]`} />;
    case "PROJECT_DELAY":
      return <AlertCircle className={`${cls} text-[var(--pb-danger)]`} />;
    case "CONSULTATION_RECEIVED":
      return <Bell className={`${cls} text-[var(--pb-green)]`} />;
    default:
      return <Bell className={`${cls} text-[var(--pb-text-muted)]`} />;
  }
}
