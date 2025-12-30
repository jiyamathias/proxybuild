import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded bg-primary font-bold text-black">P</div>
          <span className="text-xl font-bold tracking-tight">
            ProxyBuild<span className="text-primary italic">Africa</span>
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it Works
          </Link>
          <Link
            href="#services"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </Link>
          <Link
            href="#dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Platform
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden text-sm font-medium md:flex">
              Client Login
            </Button>
          </Link>
          <Button className="rounded-full bg-primary font-semibold text-black hover:bg-primary/90">
            Book Consultation
          </Button>
        </div>
      </div>
    </nav>
  )
}
