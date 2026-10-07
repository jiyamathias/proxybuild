/**
 * Development seed data — never run in production.
 *
 * Creates:
 *   - 1 SUPER_ADMIN user (admin@proxybuild.africa / Admin123!)
 *   - 1 PROJECT_MANAGER  (pm@proxybuild.africa / Admin123!)
 *   - 1 CLIENT           (john@example.com  / Client123!)
 *   - 1 project          Lekki Residence
 *   - 9 milestones
 *   - 4 project updates
 *   - 4 media records (placeholder storage keys)
 *   - 3 documents
 *   - 2 payments
 *   - 1 budget + budget items
 *   - 4 notifications for the client
 *   - 3 messages
 *   - 1 consultation
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index.js";
import { hashPassword } from "../lib/auth/password.js";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱  Seeding ProxyBuild database…\n");

  // ─────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────
  const adminHash = await hashPassword("Admin123!");
  const clientHash = await hashPassword("Client123!");

  const [superAdmin] = await db
    .insert(schema.users)
    .values({
      email: "admin@proxybuild.africa",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      emailVerified: true,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [pm] = await db
    .insert(schema.users)
    .values({
      email: "pm@proxybuild.africa",
      passwordHash: adminHash,
      role: "PROJECT_MANAGER",
      emailVerified: true,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [client] = await db
    .insert(schema.users)
    .values({
      email: "john@example.com",
      passwordHash: clientHash,
      role: "CLIENT",
      emailVerified: true,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  console.log("✅  Users created");

  if (!superAdmin || !pm || !client) {
    console.log("⚠️  Some users already exist — skipping profiles and downstream seed.");
    return;
  }

  // Profiles
  await db.insert(schema.profiles).values([
    {
      userId: superAdmin.id,
      firstName: "ProxyBuild",
      lastName: "Admin",
      countryOfResidence: "Nigeria",
    },
    {
      userId: pm.id,
      firstName: "Tunde",
      lastName: "Okonkwo",
      phone: "+2348012345678",
      countryOfResidence: "Nigeria",
    },
    {
      userId: client.id,
      firstName: "John",
      lastName: "Adeyemi",
      phone: "+447700900123",
      countryOfResidence: "United Kingdom",
    },
  ]);

  console.log("✅  Profiles created");

  // ─────────────────────────────────────────────
  // PROJECT
  // ─────────────────────────────────────────────
  const [project] = await db
    .insert(schema.projects)
    .values({
      slug: "lekki-residence-john-adeyemi",
      title: "Lekki Residence",
      description:
        "4-bedroom detached house with BQ, 2-car garage, and landscaped compound in Lekki Phase 1, Lagos. Client is based in the United Kingdom.",
      projectType: "RESIDENTIAL_NEW_BUILD",
      status: "ACTIVE",
      health: "ON_TRACK",
      progressPercent: 62,
      clientId: client.id,
      country: "Nigeria",
      state: "Lagos",
      city: "Lekki",
      area: "Lekki Phase 1",
      address: "Plot 14, Admiralty Way, Lekki Phase 1, Lagos",
      currency: "NGN",
      budgetAmount: "40000000",
      contractValue: "38500000",
      plannedStartDate: new Date("2025-01-15"),
      plannedEndDate: new Date("2027-03-31"),
      actualStartDate: new Date("2025-01-20"),
    })
    .returning();

  // Add PM as project member
  await db.insert(schema.projectMembers).values({
    projectId: project.id,
    userId: pm.id,
    role: "PROJECT_MANAGER",
  });

  console.log("✅  Project created:", project.title);

  // ─────────────────────────────────────────────
  // MILESTONES
  // ─────────────────────────────────────────────
  const milestoneData = [
    {
      title: "Site Preparation",
      sequence: 1,
      weightPercent: 5,
      budgetAmount: "1200000",
      status: "APPROVED" as const,
      approvalStatus: "APPROVED" as const,
      actualStartDate: new Date("2025-01-20"),
      actualEndDate: new Date("2025-02-10"),
    },
    {
      title: "Foundation",
      sequence: 2,
      weightPercent: 12,
      budgetAmount: "4800000",
      status: "APPROVED" as const,
      approvalStatus: "APPROVED" as const,
      actualStartDate: new Date("2025-02-12"),
      actualEndDate: new Date("2025-04-05"),
    },
    {
      title: "Ground Floor Structure",
      sequence: 3,
      weightPercent: 13,
      budgetAmount: "5200000",
      status: "APPROVED" as const,
      approvalStatus: "APPROVED" as const,
      actualStartDate: new Date("2025-04-10"),
      actualEndDate: new Date("2025-06-20"),
    },
    {
      title: "Upper Floor Structure",
      sequence: 4,
      weightPercent: 12,
      budgetAmount: "4800000",
      status: "APPROVED" as const,
      approvalStatus: "APPROVED" as const,
      actualStartDate: new Date("2025-06-25"),
      actualEndDate: new Date("2025-09-05"),
    },
    {
      title: "Roofing",
      sequence: 5,
      weightPercent: 10,
      budgetAmount: "4000000",
      status: "IN_PROGRESS" as const,
      approvalStatus: "PENDING" as const,
      actualStartDate: new Date("2025-09-10"),
      plannedEndDate: new Date("2025-12-15"),
    },
    {
      title: "Electrical Installation",
      sequence: 6,
      weightPercent: 8,
      budgetAmount: "3200000",
      status: "NOT_STARTED" as const,
      approvalStatus: "PENDING" as const,
      plannedStartDate: new Date("2025-12-20"),
      plannedEndDate: new Date("2026-02-15"),
    },
    {
      title: "Plumbing",
      sequence: 7,
      weightPercent: 8,
      budgetAmount: "3200000",
      status: "NOT_STARTED" as const,
      approvalStatus: "PENDING" as const,
      plannedStartDate: new Date("2026-01-10"),
      plannedEndDate: new Date("2026-03-10"),
    },
    {
      title: "Plastering & Screeding",
      sequence: 8,
      weightPercent: 8,
      budgetAmount: "3200000",
      status: "NOT_STARTED" as const,
      approvalStatus: "PENDING" as const,
      plannedStartDate: new Date("2026-03-15"),
      plannedEndDate: new Date("2026-06-01"),
    },
    {
      title: "Tiling, Painting & Finishing",
      sequence: 9,
      weightPercent: 10,
      budgetAmount: "4000000",
      status: "NOT_STARTED" as const,
      approvalStatus: "PENDING" as const,
      plannedStartDate: new Date("2026-06-10"),
      plannedEndDate: new Date("2026-10-01"),
    },
    {
      title: "External Works & Landscaping",
      sequence: 10,
      weightPercent: 7,
      budgetAmount: "2800000",
      status: "NOT_STARTED" as const,
      approvalStatus: "PENDING" as const,
      plannedStartDate: new Date("2026-09-01"),
      plannedEndDate: new Date("2026-11-15"),
    },
    {
      title: "Final Inspection & Snagging",
      sequence: 11,
      weightPercent: 4,
      budgetAmount: "1600000",
      status: "NOT_STARTED" as const,
      approvalStatus: "PENDING" as const,
      plannedStartDate: new Date("2026-11-20"),
      plannedEndDate: new Date("2027-01-15"),
    },
    {
      title: "Handover",
      sequence: 12,
      weightPercent: 3,
      budgetAmount: "800000",
      status: "NOT_STARTED" as const,
      approvalStatus: "PENDING" as const,
      plannedStartDate: new Date("2027-01-20"),
      plannedEndDate: new Date("2027-03-31"),
    },
  ];

  const insertedMilestones = await db
    .insert(schema.milestones)
    .values(
      milestoneData.map((m) => ({
        projectId: project.id,
        isClientVisible: true,
        ...m,
      }))
    )
    .returning();

  console.log("✅  Milestones created:", insertedMilestones.length);

  const roofingMilestone = insertedMilestones.find(
    (m) => m.title === "Roofing"
  )!;
  const foundationMilestone = insertedMilestones.find(
    (m) => m.title === "Foundation"
  )!;

  // ─────────────────────────────────────────────
  // PROJECT UPDATES
  // ─────────────────────────────────────────────
  const [update1, update2, update3, update4] = await db
    .insert(schema.projectUpdates)
    .values([
      {
        projectId: project.id,
        milestoneId: roofingMilestone.id,
        authorId: pm.id,
        title: "Roofing Progress — Week 18",
        body: "Roof trusses have been installed and roofing sheets are currently being fitted. The team is making excellent progress and we expect the roof to be fully covered by the end of next week. All materials are on site. No issues to report.",
        progressDelta: 7,
        isClientVisible: true,
        isPublished: true,
        publishedAt: new Date("2025-11-08"),
        createdAt: new Date("2025-11-08"),
        updatedAt: new Date("2025-11-08"),
      },
      {
        projectId: project.id,
        milestoneId: roofingMilestone.id,
        authorId: pm.id,
        title: "Roofing Commenced — Week 15",
        body: "Roofing work has officially commenced. The structural steel for the roof is being erected. Materials have been delivered and stored on site securely. We are on schedule.",
        progressDelta: 5,
        isClientVisible: true,
        isPublished: true,
        publishedAt: new Date("2025-09-20"),
        createdAt: new Date("2025-09-20"),
        updatedAt: new Date("2025-09-20"),
      },
      {
        projectId: project.id,
        milestoneId: foundationMilestone.id,
        authorId: pm.id,
        title: "Upper Floor Structure Complete",
        body: "The upper floor concrete slab has been cast and cured. Blockwork for the upper floor walls is 80% complete. All columns and beams are in place. The structural engineer has inspected and confirmed satisfactory work.",
        progressDelta: 12,
        isClientVisible: true,
        isPublished: true,
        publishedAt: new Date("2025-08-30"),
        createdAt: new Date("2025-08-30"),
        updatedAt: new Date("2025-08-30"),
      },
      {
        projectId: project.id,
        milestoneId: foundationMilestone.id,
        authorId: pm.id,
        title: "Foundation Complete — Site Assessment",
        body: "Foundation work has been completed as per the approved structural drawings. Raft foundation with reinforced concrete footings. Soil tests confirmed adequate bearing capacity. Ready to proceed to superstructure.",
        progressDelta: 12,
        isClientVisible: true,
        isPublished: true,
        publishedAt: new Date("2025-04-05"),
        createdAt: new Date("2025-04-05"),
        updatedAt: new Date("2025-04-05"),
      },
    ])
    .returning();

  console.log("✅  Project updates created");

  // ─────────────────────────────────────────────
  // PROJECT MEDIA (placeholder storage keys)
  // ─────────────────────────────────────────────
  await db.insert(schema.projectMedia).values([
    {
      projectId: project.id,
      milestoneId: roofingMilestone.id,
      updateId: update1.id,
      uploadedById: pm.id,
      mediaType: "photo",
      storageKey: `projects/${project.id}/photos/roofing-trusses-01.jpg`,
      fileName: "roofing-trusses-01.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 2400000,
      caption: "Roof trusses installed and sheeting in progress",
      takenAt: new Date("2025-11-07"),
      isClientVisible: true,
      sortOrder: 0,
    },
    {
      projectId: project.id,
      milestoneId: roofingMilestone.id,
      updateId: update1.id,
      uploadedById: pm.id,
      mediaType: "photo",
      storageKey: `projects/${project.id}/photos/roofing-overview-02.jpg`,
      fileName: "roofing-overview-02.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 1900000,
      caption: "Aerial overview of roofing progress",
      takenAt: new Date("2025-11-07"),
      isClientVisible: true,
      sortOrder: 1,
    },
    {
      projectId: project.id,
      milestoneId: foundationMilestone.id,
      updateId: update3.id,
      uploadedById: pm.id,
      mediaType: "photo",
      storageKey: `projects/${project.id}/photos/upper-floor-slab-01.jpg`,
      fileName: "upper-floor-slab-01.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 2100000,
      caption: "Upper floor slab after curing",
      takenAt: new Date("2025-08-28"),
      isClientVisible: true,
      sortOrder: 0,
    },
    {
      projectId: project.id,
      milestoneId: roofingMilestone.id,
      updateId: update2.id,
      uploadedById: pm.id,
      mediaType: "video",
      storageKey: `projects/${project.id}/videos/roofing-site-walkthrough.mp4`,
      fileName: "roofing-site-walkthrough.mp4",
      mimeType: "video/mp4",
      fileSizeBytes: 45000000,
      caption: "Site walkthrough — roofing commencement",
      takenAt: new Date("2025-09-18"),
      isClientVisible: true,
      sortOrder: 0,
    },
  ]);

  console.log("✅  Project media created");

  // ─────────────────────────────────────────────
  // DOCUMENTS
  // ─────────────────────────────────────────────
  await db.insert(schema.documents).values([
    {
      projectId: project.id,
      uploadedById: pm.id,
      category: "ARCHITECTURAL_DRAWING",
      title: "Approved Architectural Drawings",
      description: "Full set of approved architectural drawings — ground floor, first floor, elevations and sections.",
      storageKey: `projects/${project.id}/documents/architectural-drawings-v2.pdf`,
      fileName: "architectural-drawings-v2.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 8500000,
      version: 2,
      isClientVisible: true,
    },
    {
      projectId: project.id,
      uploadedById: pm.id,
      category: "BOQ",
      title: "Bill of Quantities — Approved",
      description: "Complete BOQ as agreed in the contract.",
      storageKey: `projects/${project.id}/documents/boq-approved.pdf`,
      fileName: "boq-approved.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 3200000,
      version: 1,
      isClientVisible: true,
    },
    {
      projectId: project.id,
      uploadedById: pm.id,
      category: "CONTRACT",
      title: "Construction Agreement",
      description: "Signed construction agreement between John Adeyemi and ProxyBuild Africa.",
      storageKey: `projects/${project.id}/documents/construction-agreement-signed.pdf`,
      fileName: "construction-agreement-signed.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 1200000,
      version: 1,
      isClientVisible: true,
    },
  ]);

  console.log("✅  Documents created");

  // ─────────────────────────────────────────────
  // BUDGET
  // ─────────────────────────────────────────────
  const [budget] = await db
    .insert(schema.budgets)
    .values({
      projectId: project.id,
      currency: "NGN",
      totalAmount: "40000000",
      approvedAt: new Date("2025-01-12"),
      notes: "Budget approved by client on 12 Jan 2025 via email and dashboard.",
    })
    .returning();

  await db.insert(schema.budgetItems).values([
    {
      budgetId: budget.id,
      category: "MATERIAL",
      description: "All construction materials (concrete, steel, blocks, roofing, etc.)",
      amount: "18000000",
    },
    {
      budgetId: budget.id,
      category: "LABOUR",
      description: "Skilled and unskilled labour for entire project",
      amount: "9000000",
    },
    {
      budgetId: budget.id,
      category: "PROFESSIONAL_FEES",
      description: "Architect, structural engineer, quantity surveyor fees",
      amount: "3000000",
    },
    {
      budgetId: budget.id,
      category: "PROXYBUILD_FEE",
      description: "ProxyBuild project management and supervision fee",
      amount: "4500000",
    },
    {
      budgetId: budget.id,
      category: "LOGISTICS",
      description: "Transport, site establishment and logistics",
      amount: "1500000",
    },
    {
      budgetId: budget.id,
      category: "CONTINGENCY",
      description: "10% contingency reserve",
      amount: "4000000",
    },
  ]);

  console.log("✅  Budget and budget items created");

  // ─────────────────────────────────────────────
  // PAYMENTS
  // ─────────────────────────────────────────────
  await db.insert(schema.payments).values([
    {
      projectId: project.id,
      payerId: client.id,
      recordedById: superAdmin.id,
      currency: "GBP",
      amount: "12000",
      exchangeRateToNgn: "2040.50",
      status: "SUCCESSFUL",
      provider: "bank_transfer",
      providerReference: "PB-PAY-2025-001",
      description: "Milestone 1 & 2 payment — Site Preparation and Foundation",
      paidAt: new Date("2025-01-14"),
      clientApproved: true,
      clientApprovedAt: new Date("2025-01-14"),
    },
    {
      projectId: project.id,
      payerId: client.id,
      recordedById: superAdmin.id,
      currency: "GBP",
      amount: "11000",
      exchangeRateToNgn: "2060.00",
      status: "SUCCESSFUL",
      provider: "bank_transfer",
      providerReference: "PB-PAY-2025-002",
      description: "Milestone 3 & 4 payment — Ground and Upper Floor Structure",
      paidAt: new Date("2025-05-20"),
      clientApproved: true,
      clientApprovedAt: new Date("2025-05-20"),
    },
  ]);

  console.log("✅  Payments created");

  // ─────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────
  await db.insert(schema.notifications).values([
    {
      userId: client.id,
      type: "NEW_UPDATE",
      title: "New project update: Roofing Progress — Week 18",
      body: "Your project manager has published a new update with 8 photos.",
      actionUrl: `/dashboard/projects/${project.id}/updates`,
      isRead: false,
      projectId: project.id,
    },
    {
      userId: client.id,
      type: "MILESTONE_AWAITING_APPROVAL",
      title: "Roofing milestone nearing completion",
      body: "The Roofing milestone is approaching completion. You will be asked to review shortly.",
      actionUrl: `/dashboard/projects/${project.id}/milestones`,
      isRead: false,
      projectId: project.id,
    },
    {
      userId: client.id,
      type: "PAYMENT_RECORDED",
      title: "Payment recorded — £11,000",
      body: "Your payment of £11,000 for Milestones 3 & 4 has been confirmed.",
      actionUrl: `/dashboard/projects/${project.id}/payments`,
      isRead: true,
      readAt: new Date("2025-05-21"),
      projectId: project.id,
    },
    {
      userId: client.id,
      type: "PROJECT_CREATED",
      title: "Lekki Residence project created",
      body: "Your Lekki Residence project has been set up on the ProxyBuild platform. Welcome aboard.",
      actionUrl: `/dashboard/projects/${project.id}`,
      isRead: true,
      readAt: new Date("2025-01-16"),
      projectId: project.id,
    },
  ]);

  console.log("✅  Notifications created");

  // ─────────────────────────────────────────────
  // MESSAGES
  // ─────────────────────────────────────────────
  const [msg1] = await db
    .insert(schema.messages)
    .values({
      projectId: project.id,
      senderId: client.id,
      body: "Hi Tunde, just checking in — how is the roofing going? I saw the latest update, looking great! Will we stay on schedule for the electrical in December?",
      isRead: true,
      readAt: new Date("2025-11-10"),
      createdAt: new Date("2025-11-09T10:30:00"),
    })
    .returning();

  await db.insert(schema.messages).values([
    {
      projectId: project.id,
      senderId: pm.id,
      parentMessageId: msg1.id,
      body: "Good morning John! Yes, roofing is going very well. We are about 70% through the sheeting. The team is on track. We are still planning for electrical to commence on the 20th of December as scheduled. I will share more photos by end of this week.",
      isRead: true,
      readAt: new Date("2025-11-10T09:15:00"),
      createdAt: new Date("2025-11-10T09:00:00"),
    },
    {
      projectId: project.id,
      senderId: client.id,
      body: "Perfect, that is great news. Thanks for the updates, really appreciate the transparency. Looking forward to the photos!",
      isRead: false,
      createdAt: new Date("2025-11-10T14:22:00"),
    },
  ]);

  console.log("✅  Messages created");

  // ─────────────────────────────────────────────
  // CONSULTATION
  // ─────────────────────────────────────────────
  await db.insert(schema.consultations).values({
    userId: client.id,
    firstName: "Amaka",
    lastName: "Obi",
    email: "amaka.obi@example.com",
    phone: "+16134567890",
    countryOfResidence: "Canada",
    projectLocation: "Enugu",
    projectState: "Enugu",
    projectType: "RESIDENTIAL_NEW_BUILD",
    landStatus: "OWNED_WITH_TITLE",
    estimatedBudget: "₦25M – ₦35M",
    desiredTimeline: "Start Q2 2026, 18 months",
    description:
      "I own land in New Haven, Enugu and want to build a 3-bedroom bungalow for my parents. The land has a C of O. I am based in Ottawa, Canada. I need a fully managed service as I cannot travel regularly.",
    status: "NEW",
    referralSource: "Instagram",
  });

  console.log("✅  Demo consultation created");
  console.log("\n🎉  Seed complete!\n");
  console.log("   Admin:   admin@proxybuild.africa  / Admin123!");
  console.log("   PM:      pm@proxybuild.africa     / Admin123!");
  console.log("   Client:  john@example.com      / Client123!\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
