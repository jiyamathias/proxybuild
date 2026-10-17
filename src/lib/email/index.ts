import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "ProxyBuild <noreply@proxybuild.africa>";
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL ?? "admin@proxybuild.africa";

type EmailResult = { success: boolean; error?: string };

async function send(
  to: string | string[],
  subject: string,
  html: string
): Promise<EmailResult> {
  try {
    await getResend().emails.send({ from: FROM, to, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[Email] Send failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendConsultationConfirmation(params: {
  to: string;
  firstName: string;
  projectLocation: string;
}): Promise<EmailResult> {
  return send(
    params.to,
    "We've received your consultation request — ProxyBuild",
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#fff;padding:32px;border-radius:8px;">
      <div style="color:#16A34A;font-size:22px;font-weight:700;margin-bottom:8px;">ProxyBuild</div>
      <h1 style="font-size:24px;margin-bottom:16px;">Thank you, ${params.firstName}</h1>
      <p style="color:#A3A3A3;line-height:1.6;">
        We've received your consultation request for your project in <strong style="color:#fff">${params.projectLocation}</strong>.
      </p>
      <p style="color:#A3A3A3;line-height:1.6;">
        A member of our team will review your request and reach out to you within 1–2 business days to discuss next steps.
      </p>
      <div style="background:#171717;border-radius:6px;padding:16px;margin:24px 0;">
        <p style="color:#A3A3A3;font-size:14px;margin:0;">
          In the meantime, if you have questions you can reach us at
          <a href="mailto:hello@proxybuild.africa" style="color:#16A34A;">hello@proxybuild.africa</a>
        </p>
      </div>
      <p style="color:#A3A3A3;font-size:13px;margin-top:32px;">
        © ProxyBuild Africa · We Build Your Vision — Even While You're Away.
      </p>
    </div>
    `
  );
}

export async function sendConsultationAdminNotification(params: {
  consultationId: string;
  name: string;
  email: string;
  phone?: string | null;
  country: string;
  projectLocation: string;
  projectType: string;
  estimatedBudget?: string | null;
  description: string;
}): Promise<EmailResult> {
  return send(
    ADMIN_EMAIL,
    `New Consultation Request — ${params.name} (${params.country})`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2>New Consultation Request</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#666;width:160px;">Name</td><td>${params.name}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Email</td><td>${params.email}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Phone</td><td>${params.phone ?? "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Country</td><td>${params.country}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Project Location</td><td>${params.projectLocation}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Project Type</td><td>${params.projectType}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Budget</td><td>${params.estimatedBudget ?? "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Description</td><td>${params.description}</td></tr>
      </table>
      <p style="margin-top:16px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/consultations/${params.consultationId}" style="background:#16A34A;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;display:inline-block;">
          View in Admin
        </a>
      </p>
    </div>
    `
  );
}

export async function sendAccountInvitation(params: {
  to: string;
  firstName: string;
  inviteUrl: string;
  role: string;
}): Promise<EmailResult> {
  return send(
    params.to,
    "You've been invited to ProxyBuild",
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#fff;padding:32px;border-radius:8px;">
      <div style="color:#16A34A;font-size:22px;font-weight:700;margin-bottom:24px;">ProxyBuild</div>
      <h1 style="font-size:24px;margin-bottom:16px;">You've been invited, ${params.firstName}</h1>
      <p style="color:#A3A3A3;line-height:1.6;">
        You've been invited to access the ProxyBuild platform as a <strong style="color:#fff">${params.role}</strong>.
      </p>
      <a href="${params.inviteUrl}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:24px 0;">
        Accept Invitation
      </a>
      <p style="color:#A3A3A3;font-size:13px;">This link expires in 48 hours.</p>
    </div>
    `
  );
}

export async function sendPasswordReset(params: {
  to: string;
  firstName: string;
  resetUrl: string;
}): Promise<EmailResult> {
  return send(
    params.to,
    "Reset your ProxyBuild password",
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#fff;padding:32px;border-radius:8px;">
      <div style="color:#16A34A;font-size:22px;font-weight:700;margin-bottom:24px;">ProxyBuild</div>
      <h1 style="font-size:24px;margin-bottom:16px;">Reset your password</h1>
      <p style="color:#A3A3A3;line-height:1.6;">
        Hi ${params.firstName}, we received a request to reset your password.
      </p>
      <a href="${params.resetUrl}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:24px 0;">
        Reset Password
      </a>
      <p style="color:#A3A3A3;font-size:13px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
    `
  );
}

export async function sendMilestoneApprovalRequest(params: {
  to: string;
  firstName: string;
  projectTitle: string;
  milestoneTitle: string;
  milestoneUrl: string;
}): Promise<EmailResult> {
  return send(
    params.to,
    `Milestone ready for your approval — ${params.projectTitle}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#fff;padding:32px;border-radius:8px;">
      <div style="color:#16A34A;font-size:22px;font-weight:700;margin-bottom:24px;">ProxyBuild</div>
      <h1 style="font-size:24px;margin-bottom:16px;">Milestone ready for review</h1>
      <p style="color:#A3A3A3;line-height:1.6;">
        Hi ${params.firstName}, the milestone <strong style="color:#fff">${params.milestoneTitle}</strong> on your project
        <strong style="color:#fff">${params.projectTitle}</strong> is ready for your review and approval.
      </p>
      <a href="${params.milestoneUrl}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:24px 0;">
        Review Milestone
      </a>
    </div>
    `
  );
}

// ---------------------------------------------------------------------------
// Scheduled digests and reminders
// ---------------------------------------------------------------------------

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://proxybuild.africa";

/** Shared chrome so scheduled mail stays visually consistent with the product. */
function shell(heading: string, bodyHtml: string, footerNote?: string) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#fff;padding:32px;border-radius:8px;">
    <div style="color:#16A34A;font-size:22px;font-weight:700;margin-bottom:24px;">ProxyBuild</div>
    <h1 style="font-size:24px;margin:0 0 16px;">${heading}</h1>
    ${bodyHtml}
    <p style="color:#6B7280;font-size:12px;margin-top:32px;border-top:1px solid #262626;padding-top:16px;">
      ${footerNote ?? "You're receiving this because you have an active project with ProxyBuild Africa."}
      <br/>
      <a href="${APP_URL}/dashboard/settings" style="color:#6B7280;">Manage email preferences</a>
    </p>
  </div>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:20px 0;">${label}</a>`;
}

export type DigestProject = {
  id: string;
  title: string;
  progressPercent: number;
  currentMilestone: string | null;
  updatesThisWeek: { title: string; createdAt: Date }[];
  newPhotoCount: number;
  outstandingLabel: string | null;
  awaitingApproval: string | null;
};

export async function sendWeeklyDigest(params: {
  to: string;
  firstName: string;
  projects: DigestProject[];
}): Promise<EmailResult> {
  const blocks = params.projects
    .map((p) => {
      const updates =
        p.updatesThisWeek.length > 0
          ? `<ul style="color:#A3A3A3;font-size:14px;line-height:1.7;margin:12px 0 0;padding-left:18px;">
               ${p.updatesThisWeek.map((u) => `<li>${u.title}</li>`).join("")}
             </ul>`
          : `<p style="color:#6B7280;font-size:14px;margin:12px 0 0;">No written updates this week.</p>`;

      const photos =
        p.newPhotoCount > 0
          ? `<p style="color:#A3A3A3;font-size:14px;margin:8px 0 0;">${p.newPhotoCount} new photo${p.newPhotoCount === 1 ? "" : "s"} from site.</p>`
          : "";

      const approval = p.awaitingApproval
        ? `<div style="background:#422006;border:1px solid #CA8A04;border-radius:6px;padding:12px;margin-top:12px;">
             <p style="color:#FDE047;font-size:14px;margin:0;">Awaiting your approval: <strong>${p.awaitingApproval}</strong></p>
           </div>`
        : "";

      const outstanding = p.outstandingLabel
        ? `<p style="color:#A3A3A3;font-size:14px;margin:8px 0 0;">Outstanding balance: <strong style="color:#fff;">${p.outstandingLabel}</strong></p>`
        : "";

      return `
      <div style="background:#171717;border-radius:8px;padding:20px;margin-bottom:16px;">
        <h2 style="font-size:17px;margin:0 0 4px;color:#fff;">${p.title}</h2>
        <p style="color:#16A34A;font-size:14px;margin:0 0 12px;font-weight:600;">
          ${p.progressPercent}% complete${p.currentMilestone ? ` · ${p.currentMilestone}` : ""}
        </p>
        <div style="background:#262626;border-radius:999px;height:6px;overflow:hidden;">
          <div style="background:#16A34A;height:6px;width:${Math.min(100, Math.max(0, p.progressPercent))}%;"></div>
        </div>
        ${updates}
        ${photos}
        ${outstanding}
        ${approval}
        <div style="margin-top:4px;">
          ${button(`${APP_URL}/dashboard/projects/${p.id}`, "View Project")}
        </div>
      </div>`;
    })
    .join("");

  return send(
    params.to,
    "This week on your project — ProxyBuild",
    shell(
      `Hello ${params.firstName},`,
      `<p style="color:#A3A3A3;line-height:1.6;margin:0 0 20px;">
         Here's what happened on your ${params.projects.length === 1 ? "project" : "projects"} this week.
       </p>
       ${blocks}`
    )
  );
}

export async function sendPaymentReminder(params: {
  to: string;
  firstName: string;
  projectId: string;
  projectTitle: string;
  outstandingLabel: string;
}): Promise<EmailResult> {
  return send(
    params.to,
    `Outstanding balance on ${params.projectTitle} — ProxyBuild`,
    shell(
      "A friendly reminder",
      `<p style="color:#A3A3A3;line-height:1.6;">
         Hi ${params.firstName}, there is an outstanding balance of
         <strong style="color:#fff;">${params.outstandingLabel}</strong> on
         <strong style="color:#fff;">${params.projectTitle}</strong>.
       </p>
       <p style="color:#A3A3A3;line-height:1.6;">
         Keeping payments current helps us keep your build on schedule. You can pay securely
         from your dashboard at any time.
       </p>
       ${button(`${APP_URL}/dashboard/projects/${params.projectId}/payments`, "View & Pay")}
       <p style="color:#6B7280;font-size:13px;">
         If you've already paid or believe this is an error, please reply to this email and we'll sort it out.
       </p>`
    )
  );
}
