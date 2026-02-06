import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { USSDSimulator } from "@/components/dashboard/ussd/ussd-simulator"
import { WhatsAppSimulator } from "@/components/dashboard/whatsapp/whatsapp-simulator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, MessageCircle, Globe, Users } from "lucide-react"

function ChannelsContent() {
  const channelStats = [
    { channel: "USSD", users: "12,450", percentage: 45, icon: Phone },
    { channel: "WhatsApp", users: "9,820", percentage: 35, icon: MessageCircle },
    { channel: "Web/PWA", users: "4,230", percentage: 15, icon: Globe },
    { channel: "Brokers", users: "1,500", percentage: 5, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Access Channels</h2>
        <p className="text-muted-foreground">Multi-channel platform access - USSD, WhatsApp, and Web</p>
      </div>

      {/* Channel Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {channelStats.map((stat) => (
          <Card key={stat.channel} className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{stat.channel}</p>
                <p className="text-sm text-muted-foreground">{stat.users} users</p>
              </div>
              <Badge variant="secondary">{stat.percentage}%</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simulators */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle>USSD Interface</CardTitle>
              </div>
              <CardDescription>
                Primary access channel for feature phones. Dial *384*MATOLA# to access. Supports Chichewa and English.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <USSDSimulator />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle>WhatsApp Bot</CardTitle>
              </div>
              <CardDescription>
                Conversational interface for smartphone users. Message +265 991 MATOLA to start. Supports voice notes
                and images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WhatsAppSimulator />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
