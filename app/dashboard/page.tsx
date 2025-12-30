"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, DollarSign, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { demoProjects } from "@/lib/demo-data"

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem("pb_authenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
    } else {
      router.push("/login")
    }
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  const activeProjects = demoProjects.filter((p) => p.status === "active")
  const totalInvestment = demoProjects.reduce((sum, p) => sum + p.totalCost, 0)
  const totalPaid = demoProjects.reduce((sum, p) => sum + p.paidAmount, 0)
  const pendingMilestones = demoProjects.reduce(
    (sum, p) => sum + p.milestones.filter((m) => m.status === "pending" || m.status === "approved").length,
    0,
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Track and manage all your construction projects in one place.</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <DollarSign className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">${totalInvestment.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Clock className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Milestones</p>
                <p className="text-2xl font-bold">{pendingMilestones}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          {demoProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{project.name}</h2>
                    <Badge
                      variant={project.status === "active" ? "default" : "secondary"}
                      className={
                        project.status === "active" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-4" />
                      {project.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {project.location}
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="gap-2 sm:mt-0 bg-transparent">
                  View Details
                  <ArrowRight className="size-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Overall Progress</span>
                  <span className="text-primary font-bold">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </div>

              {/* Project Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">Budget</p>
                  <p className="text-lg font-bold">${project.totalCost.toLocaleString()}</p>
                  <p className="text-xs text-green-500">${project.paidAmount.toLocaleString()} paid</p>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">Timeline</p>
                  <p className="text-lg font-bold">
                    {Math.ceil(
                      (new Date(project.expectedCompletion).getTime() - new Date(project.startDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 30),
                    )}{" "}
                    months
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Started {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">Milestones</p>
                  <p className="text-lg font-bold">
                    {project.milestones.filter((m) => m.status === "paid").length}/{project.milestones.length}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {project.milestones.some((m) => m.status === "pending") && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <AlertCircle className="size-3" />
                        {project.milestones.filter((m) => m.status === "pending").length} pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Latest Update */}
              {project.updates.length > 0 && (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="mb-1 text-xs font-medium text-primary">Latest Update</p>
                      <p className="mb-1 font-medium text-sm">{project.updates[0].title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.updates[0].date).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle2 className="size-5 text-primary" />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Empty State (if no projects - not shown in demo) */}
        {demoProjects.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <Building2 className="mb-4 size-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-bold">No Projects Yet</h3>
            <p className="mb-6 text-muted-foreground">Start your construction journey with ProxyBuild Africa.</p>
            <Button size="lg" className="bg-primary text-black hover:bg-primary/90">
              Start New Project
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
