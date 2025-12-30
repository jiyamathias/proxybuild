export interface Milestone {
  id: string
  name: string
  status: "paid" | "pending" | "approved" | "upcoming"
  amount: number
  dueDate: string
  completedDate?: string
}

export interface ProjectUpdate {
  id: string
  date: string
  title: string
  description: string
  images: string[]
  videoUrl?: string
}

export interface Project {
  id: string
  name: string
  type: string
  location: string
  progress: number
  status: "active" | "completed" | "on-hold"
  startDate: string
  expectedCompletion: string
  totalCost: number
  paidAmount: number
  supervisor: {
    name: string
    phone: string
    email: string
  }
  milestones: Milestone[]
  updates: ProjectUpdate[]
  documents: {
    name: string
    type: string
    uploadedDate: string
  }[]
}

// Demo project data
export const demoProjects: Project[] = [
  {
    id: "proj-001",
    name: "3 Bedroom Bungalow - Lekki",
    type: "Residential",
    location: "Lekki Phase 1, Lagos",
    progress: 65,
    status: "active",
    startDate: "2025-01-15",
    expectedCompletion: "2025-07-15",
    totalCost: 45000,
    paidAmount: 29250,
    supervisor: {
      name: "Engr. Adebayo Okonkwo",
      phone: "+234 801 234 5678",
      email: "adebayo@proxybuild.africa",
    },
    milestones: [
      {
        id: "m1",
        name: "Site Clearance & Foundation",
        status: "paid",
        amount: 9000,
        dueDate: "2025-02-01",
        completedDate: "2025-01-28",
      },
      {
        id: "m2",
        name: "Block Work & Roofing",
        status: "paid",
        amount: 13500,
        dueDate: "2025-03-15",
        completedDate: "2025-03-10",
      },
      {
        id: "m3",
        name: "Plastering & Electrical",
        status: "approved",
        amount: 9000,
        dueDate: "2025-04-20",
        completedDate: "2025-04-18",
      },
      {
        id: "m4",
        name: "Finishing & Painting",
        status: "pending",
        amount: 9000,
        dueDate: "2025-06-01",
      },
      {
        id: "m5",
        name: "Final Inspection & Handover",
        status: "upcoming",
        amount: 4500,
        dueDate: "2025-07-15",
      },
    ],
    updates: [
      {
        id: "u1",
        date: "2025-04-18",
        title: "Electrical Installation Complete",
        description:
          "All electrical conduits, wiring, and outlets have been installed. The electrical inspection has been passed.",
        images: ["/demo-update-electrical.jpg", "/demo-update-electrical-2.jpg"],
      },
      {
        id: "u2",
        date: "2025-04-11",
        title: "Internal Plastering Progress",
        description:
          "Plastering work is 85% complete. All bedrooms and living room walls have been finished. Kitchen plastering in progress.",
        images: ["/demo-update-plastering.jpg"],
        videoUrl: "/demo-plastering-video.mp4",
      },
      {
        id: "u3",
        date: "2025-04-04",
        title: "Roofing Milestone Reached",
        description: "Roofing has been successfully completed with aluminum sheets. Waterproofing applied and tested.",
        images: ["/demo-update-roofing.jpg", "/demo-update-roofing-2.jpg"],
      },
    ],
    documents: [
      { name: "Architectural Drawings", type: "PDF", uploadedDate: "2025-01-10" },
      { name: "Building Permit", type: "PDF", uploadedDate: "2025-01-12" },
      { name: "Survey Plan", type: "PDF", uploadedDate: "2025-01-10" },
      { name: "Project Contract", type: "PDF", uploadedDate: "2025-01-14" },
    ],
  },
  {
    id: "proj-002",
    name: "Commercial Plaza - Abuja",
    type: "Commercial",
    location: "Wuse 2, Abuja",
    progress: 30,
    status: "active",
    startDate: "2025-03-01",
    expectedCompletion: "2026-02-01",
    totalCost: 120000,
    paidAmount: 36000,
    supervisor: {
      name: "Engr. Chioma Nwosu",
      phone: "+234 802 345 6789",
      email: "chioma@proxybuild.africa",
    },
    milestones: [
      {
        id: "m1",
        name: "Land Clearing & Foundation",
        status: "paid",
        amount: 24000,
        dueDate: "2025-04-01",
        completedDate: "2025-03-28",
      },
      {
        id: "m2",
        name: "Structural Framework",
        status: "paid",
        amount: 36000,
        dueDate: "2025-06-15",
        completedDate: "2025-06-10",
      },
      {
        id: "m3",
        name: "External Walls & Windows",
        status: "pending",
        amount: 24000,
        dueDate: "2025-08-30",
      },
      {
        id: "m4",
        name: "MEP Installation",
        status: "upcoming",
        amount: 24000,
        dueDate: "2025-11-15",
      },
      {
        id: "m5",
        name: "Finishing & Handover",
        status: "upcoming",
        amount: 12000,
        dueDate: "2026-02-01",
      },
    ],
    updates: [
      {
        id: "u1",
        date: "2025-06-10",
        title: "Structural Framework Complete",
        description: "All columns and beams are complete. Steel reinforcement inspected and approved.",
        images: ["/demo-commercial-framework.jpg"],
      },
    ],
    documents: [
      { name: "Commercial Building Plans", type: "PDF", uploadedDate: "2025-02-20" },
      { name: "Environmental Impact Assessment", type: "PDF", uploadedDate: "2025-02-25" },
      { name: "Building Permit", type: "PDF", uploadedDate: "2025-02-28" },
    ],
  },
  {
    id: "proj-003",
    name: "Duplex Renovation - Port Harcourt",
    type: "Renovation",
    location: "GRA Phase 2, Port Harcourt",
    progress: 90,
    status: "active",
    startDate: "2025-02-01",
    expectedCompletion: "2025-05-15",
    totalCost: 28000,
    paidAmount: 25200,
    supervisor: {
      name: "Engr. Ibrahim Musa",
      phone: "+234 803 456 7890",
      email: "ibrahim@proxybuild.africa",
    },
    milestones: [
      {
        id: "m1",
        name: "Demolition & Structural Assessment",
        status: "paid",
        amount: 5600,
        dueDate: "2025-02-15",
        completedDate: "2025-02-12",
      },
      {
        id: "m2",
        name: "New Plumbing & Electrical",
        status: "paid",
        amount: 8400,
        dueDate: "2025-03-15",
        completedDate: "2025-03-10",
      },
      {
        id: "m3",
        name: "Interior Renovation",
        status: "paid",
        amount: 8400,
        dueDate: "2025-04-15",
        completedDate: "2025-04-12",
      },
      {
        id: "m4",
        name: "Finishing & Final Touches",
        status: "approved",
        amount: 5600,
        dueDate: "2025-05-15",
        completedDate: "2025-05-10",
      },
    ],
    updates: [
      {
        id: "u1",
        date: "2025-05-10",
        title: "Interior Design Complete",
        description: "All interior finishes including tiles, paint, and fixtures have been installed.",
        images: ["/demo-interior-renovation.jpg", "/demo-interior-renovation-2.jpg"],
      },
    ],
    documents: [
      { name: "Renovation Plans", type: "PDF", uploadedDate: "2025-01-25" },
      { name: "Structural Assessment Report", type: "PDF", uploadedDate: "2025-01-28" },
    ],
  },
]
