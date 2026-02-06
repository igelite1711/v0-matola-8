import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { Truck, Phone, MessageCircle, CheckCircle2 } from "lucide-react"

/**
 * Unified register page - consolidated from /app/simple/register/page.tsx and /app/register/page.tsx
 * This single responsive page works for both mobile and desktop users
 */
export default function SimpleRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Matola</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Pangani Akaunti / Create Account</h1>
          <p className="mt-2 text-muted-foreground">Yambani kutumiza kapena kunyamula katundu lero</p>
        </div>

        {/* Simple Requirements - Malawi Context */}
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="mb-2 text-sm font-medium text-green-800">Zomwe mukufunikira / What you need:</p>
          <ul className="space-y-1.5 text-sm text-green-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Nambala ya foni (Airtel/TNM)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              WhatsApp (optional)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              PIN ya manambala 4
            </li>
          </ul>
        </div>

        <RegisterForm />

        {/* Alternative Registration */}
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-center text-sm font-medium text-foreground">Lembani kudzera pa / Register via</p>
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
          Muli ndi akaunti kale? / Have account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Lowani / Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
