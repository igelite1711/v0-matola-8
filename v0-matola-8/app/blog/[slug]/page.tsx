import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CalendarDays, Clock, Share2 } from "lucide-react"

// This would normally come from a CMS or database
const blogPosts: Record<
  string,
  { title: string; content: string; category: string; date: string; readTime: string; image: string }
> = {
  "backhaul-optimization-guide": {
    title: "How Backhaul Optimization Can Save You 30% on Shipping Costs",
    category: "Tips & Guides",
    date: "2024-12-01",
    readTime: "5 min read",
    image: "/logistics-truck-on-road.png",
    content: `
      <p>Empty return journeys are one of the biggest inefficiencies in the logistics industry. When a truck delivers goods from Lilongwe to Blantyre, it often returns empty – that's wasted fuel, time, and money.</p>
      
      <h2>What is Backhaul Optimization?</h2>
      <p>Backhaul optimization is the practice of finding cargo for the return journey. Instead of driving back empty, transporters can pick up goods going in the opposite direction, turning a cost into revenue.</p>
      
      <h2>How Matola Makes It Easy</h2>
      <p>Our smart matching algorithm automatically identifies backhaul opportunities. When you post a shipment, we check if any verified transporters are heading your way after their current delivery.</p>
      
      <h3>Benefits for Shippers</h3>
      <ul>
        <li>Lower prices – backhaul loads are typically 20-30% cheaper</li>
        <li>Faster matching – drivers actively looking for return cargo</li>
        <li>Same quality service – all drivers are RTOA verified</li>
      </ul>
      
      <h3>Benefits for Transporters</h3>
      <ul>
        <li>Increased earnings – turn empty miles into profit</li>
        <li>Better fuel efficiency – maximize revenue per kilometer</li>
        <li>Automatic notifications – we alert you to matching opportunities</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>Ready to save on your next shipment? Sign up for Matola and experience the power of smart logistics.</p>
    `,
  },
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex flex-col items-center justify-center py-24">
          <h1 className="text-2xl font-bold text-foreground">Post Not Found</h1>
          <p className="mt-2 text-muted-foreground">This blog post doesn't exist.</p>
          <Button className="mt-6" asChild>
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <article className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            <div className="mt-6">
              <Badge variant="secondary">{post.category}</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{post.title}</h1>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>
            </div>

            <div className="mt-8 aspect-video overflow-hidden rounded-lg bg-secondary">
              <img src={post.image || "/placeholder.svg"} alt={post.title} className="h-full w-full object-cover" />
            </div>

            <div
              className="prose prose-invert mt-8 max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  More Articles
                </Link>
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
