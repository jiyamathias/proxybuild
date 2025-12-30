"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Download,
  ImageIcon,
  Play,
  MessageSquare,
} from "lucide-react"
import { demoProjects, type Project } from "@/lib/demo-data"

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem("pb_authenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
      // Find project
      const foundProject = demoProjects.find((p) => p.id === params.id)
      setProject(foundProject || null)
    } else {
      router.push("/login")
    }
  }, [router, params.id])

  if (!isAuthenticated || !project) {
    return null
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="size-5 text-green-500" />
      case "approved":
        return <CheckCircle2 className="size-5 text-blue-500" />
      case "pending":
        return <Clock className="size-5 text-orange-500" />
      case "upcoming":
        return <Clock className="size-5 text-muted-foreground" />
      default:
        return null
    }
  }

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "approved":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "pending":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
      case "upcoming":
        return "bg-muted text-muted-foreground hover:bg-muted"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {/* Project Header */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                  {project.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {project.location}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  Started {new Date(project.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-lg font-bold text-primary">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-4" />
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="size-4" />
                Total Budget
              </p>
              <p className="text-2xl font-bold">${project.totalCost.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4" />
                Amount Paid
              </p>
              <p className="text-2xl font-bold text-green-500">${project.paidAmount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                Expected Completion
              </p>
              <p className="text-2xl font-bold">{new Date(project.expectedCompletion).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="updates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
          </TabsList>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            {project.updates.map((update) => (
              <div key={update.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-xl font-bold">{update.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(update.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Latest
                  </Badge>
                </div>

                <p className="mb-6 text-muted-foreground">{update.description}</p>

                {/* Media Gallery */}
                <div className="mb-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" />
                    Photos & Videos
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {update.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-zinc-900"
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Update ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                      </button>
                    ))}
                    {update.videoUrl && (
                      <button className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-zinc-900">
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <div className="flex size-16 items-center justify-center rounded-full bg-primary/20 backdrop-blur transition-transform group-hover:scale-110">
                            <Play className="size-8 text-primary" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 rounded bg-black/60 px-2 py-1 text-xs text-white">
                          Video Update
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
              <Calendar className="mx-auto mb-3 size-12 text-muted-foreground" />
              <p className="mb-1 font-medium">Weekly Updates</p>
              <p className="text-sm text-muted-foreground">New photos and videos are posted every Friday at 5 PM WAT</p>
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            {project.milestones.map((milestone, idx) => (
              <div
                key={milestone.id}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      {getMilestoneIcon(milestone.status)}
                      <h3 className="text-lg font-bold">{milestone.name}</h3>
                      <Badge variant="outline" className={getMilestoneColor(milestone.status)}>
                        {milestone.status}
                      </Badge>
                    </div>

                    <div className="grid gap-2 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-bold">${milestone.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">{new Date(milestone.dueDate).toLocaleDateString()}</p>
                      </div>
                      {milestone.completedDate && (
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium text-green-500">
                            {new Date(milestone.completedDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {milestone.status === "approved" && (
                    <Button size="sm" className="bg-primary text-black hover:bg-primary/90">
                      Approve Payment
                    </Button>
                  )}
                  {milestone.status === "pending" && (
                    <Button size="sm" variant="outline">
                      Review Progress
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h4 className="mb-2 font-bold text-primary">Escrow Protection Active</h4>
              <p className="text-sm text-muted-foreground">
                All milestone payments are held in secure escrow and released only after your approval of completed
                work.
              </p>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {project.documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-6" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            ))}
          </TabsContent>

          {/* Supervisor Tab */}
          <TabsContent value="supervisor">
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="mb-6 text-2xl font-bold">Project Supervisor</h3>

              <div className="mb-8 flex items-start gap-6">
                <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {project.supervisor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 text-xl font-bold">{project.supervisor.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="size-4" />
                      <a href={`tel:${project.supervisor.phone}`} className="hover:text-primary">
                        {project.supervisor.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="size-4" />
                      <a href={`mailto:${project.supervisor.email}`} className="hover:text-primary">
                        {project.supervisor.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button size="lg" className="w-full bg-primary text-black hover:bg-primary/90 gap-2">
                  <MessageSquare className="size-5" />
                  Send Message to Supervisor
                </Button>
                <Button size="lg" variant="outline" className="w-full gap-2 bg-transparent">
                  <Phone className="size-5" />
                  Request Call Back
                </Button>
              </div>

              <div className="mt-6 rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">
                  Your supervisor oversees all construction activities and provides weekly updates. They are available
                  Monday-Saturday, 8 AM - 6 PM WAT.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-primary"
            onClick={() => setSelectedImage(null)}
          >
            <XCircle className="size-8" />
          </button>
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Full size"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
