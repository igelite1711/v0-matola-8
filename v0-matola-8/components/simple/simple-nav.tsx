"use client"

import Link from "next/link"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Truck, Menu, User, LogOut, X } from "lucide-react"
import { useState } from "react"

interface SimpleNavProps {
  onAction: (action: "post" | "find" | "track" | null) => void
}

export function SimpleNav({ onAction }: SimpleNavProps) {
  const { user, logout } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Matola</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              {user.role === "shipper" ? (
                <Button
                  onClick={() => onAction("post")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Post a Load
                </Button>
              ) : (
                <Button
                  onClick={() => onAction("find")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Find Loads
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                className="rounded-lg px-3 py-2 text-left text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-center text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-3 py-2 text-center text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
