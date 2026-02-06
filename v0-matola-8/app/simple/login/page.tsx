import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Truck, Phone, MessageCircle } from "lucide-react"

/**
 * Unified login page - consolidated from /app/simple/login/page.tsx and /app/login/page.tsx
 * This single responsive page works for both mobile and desktop users
 */
export default function SimpleLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Matola</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Takulandirani / Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Lowani kuti muyang'anire katundu wanu</p>
        </div>

        <LoginForm />

        {/* Alternative Access Methods - Malawi Reality */}
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-center text-sm font-medium text-foreground">
            Njira zina zolowera / Other ways to access
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Phone className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">USSD</span>
              <span className="text-xs font-medium text-primary">*384*628652#</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs text-muted-foreground">WhatsApp</span>
              <span className="text-xs font-medium text-primary">+265999000000</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Mulibe akaunti? / No account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Lembani / Register
          </Link>
        </p>
      </div>
    </div>
  )
}
