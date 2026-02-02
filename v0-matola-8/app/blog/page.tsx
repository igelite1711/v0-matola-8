import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, ArrowRight } from "lucide-react"

const blogPosts = [
  {
    slug: "backhaul-optimization-guide",
    title: "How Backhaul Optimization Can Save You 30% on Shipping Costs",
    excerpt: "Learn how smart route matching reduces empty miles and cuts costs for both shippers and transporters.",
    category: "Tips & Guides",
    date: "2024-12-01",
    readTime: "5 min read",
    image: "/logistics-truck-on-road.png",
  },
  {
    slug: "malawi-logistics-landscape",
    title: "The State of Logistics in Malawi: Challenges and Opportunities",
    excerpt: "An in-depth look at the current logistics landscape in Malawi and how technology is driving change.",
    category: "Industry",
    date: "2024-11-15",
    readTime: "8 min read",
    image: "/malawi-transport.jpg",
  },
  {
    slug: "transporter-success-story",
    title: "From Empty Trucks to Full Loads: A Driver's Journey with Matola",
    excerpt: "James Phiri shares how he increased his earnings by 40% using backhaul matching.",
    category: "Success Stories",
    date: "2024-11-01",
    readTime: "4 min read",
    image: "/happy-truck-driver.jpg",
  },
  {
    slug: "mobile-money-payments",
    title: "Secure Payments: How We Use Mobile Money for Safe Transactions",
    excerpt: "Understanding how Airtel Money and TNM Mpamba integrations protect both parties.",
    category: "Platform",
    date: "2024-10-20",
    readTime: "6 min read",
    image: "/mobile-payment-africa.jpg",
  },
  {
    slug: "shipping-tips-small-business",
    title: "5 Shipping Tips Every Small Business Owner Should Know",
    excerpt: "Practical advice for getting the best rates and ensuring safe delivery of your goods.",
    category: "Tips & Guides",
    date: "2024-10-10",
    readTime: "5 min read",
    image: "/small-business-shipping.png",
  },
  {
    slug: "rtoa-verification",
    title: "Why RTOA Verification Matters for Your Safety",
    excerpt: "How our partnership with the Road Transport Operators Association keeps you protected.",
    category: "Safety",
    date: "2024-10-01",
    readTime: "4 min read",
    image: "/vehicle-inspection.jpg",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog</h1>
            <p className="mt-4 text-lg text-muted-foreground">Insights, tips, and stories from the Matola community.</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Card
                key={post.slug}
                className="group overflow-hidden border-border transition-all hover:border-primary/50"
              >
                <div className="aspect-video overflow-hidden bg-secondary">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 text-lg group-hover:text-primary">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Read more <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
