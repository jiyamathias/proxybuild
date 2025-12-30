"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, FileText, LayoutDashboard, MessageSquare, Wallet, CheckCircle2 } from "lucide-react"

export function DashboardMock() {
  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-black p-2 shadow-2xl md:p-4">
      <div className="flex h-[500px] w-full flex-col overflow-hidden rounded-lg bg-zinc-950 md:flex-row">
        {/* Sidebar */}
        <div className="hidden w-16 flex-col items-center gap-6 border-r border-border py-6 md:flex">
          <div className="size-8 rounded bg-primary" />
          <LayoutDashboard className="size-5 text-primary" />
          <Camera className="size-5 text-zinc-500" />
          <Wallet className="size-5 text-zinc-500" />
          <FileText className="size-5 text-zinc-500" />
          <MessageSquare className="size-5 text-zinc-500" />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Project: PB-2940</p>
              <h3 className="text-2xl font-bold">Lagos Duplex - Phase 2</h3>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-primary/50 text-primary">
                Live Updates
              </Badge>
              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10">Active</Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Construction Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">64%</div>
                <Progress value={64} className="mt-3 h-2 bg-zinc-800" />
                <p className="mt-2 text-xs text-zinc-500">Foundation and Ground Floor Complete</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Escrow Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">$12,400</span>
                  <Badge variant="secondary" className="bg-zinc-800">
                    Pending Approval
                  </Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="size-1.5 rounded-full bg-primary" />
                  <div className="size-1.5 rounded-full bg-primary" />
                  <div className="size-1.5 rounded-full bg-zinc-700" />
                  <div className="size-1.5 rounded-full bg-zinc-700" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h4 className="mb-4 text-sm font-bold uppercase text-zinc-500">Weekly Photo Updates</h4>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-md bg-zinc-800 animate-pulse overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <span className="text-[10px] text-white">Aug {15 + i}, 2025</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Info */}
      <div className="absolute bottom-8 right-8 hidden flex-col gap-2 md:flex">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 shadow-xl">
          <CheckCircle2 className="size-4 text-green-500" />
          <span className="text-xs font-medium">Supervisor on site: Engr. Kola</span>
        </div>
      </div>
    </div>
  )
}
