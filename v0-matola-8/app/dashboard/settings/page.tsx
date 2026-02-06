"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { User, Bell, Shield, CreditCard, LogOut, Save, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const { user, logout, showNotification } = useApp()
  const { language } = useLanguage()
  const router = useRouter()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    shipmentUpdates: true,
    paymentAlerts: true,
    promotions: false,
  })
  const [saving, setSaving] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    showNotification(language === "en" ? "Profile updated successfully" : "Mbiri yasinthidwa bwino", "success")
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleDeleteAccount = () => {
    if (
      confirm(
        language === "en"
          ? "Are you sure you want to delete your account? This action cannot be undone."
          : "Mukutsimikiza kuti mukufuna kufufuta akaunti yanu? Izi sizingabwezeretse.",
      )
    ) {
      showNotification(language === "en" ? "Account deletion requested" : "Kufufuta akaunti kwapemphedwa", "info")
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{language === "en" ? "Settings" : "Zosintha"}</h1>
            <p className="text-sm text-muted-foreground">
              {language === "en"
                ? "Manage your account settings and preferences"
                : "Sinthani akaunti yanu ndi zomwe mukufuna"}
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{language === "en" ? "Profile" : "Mbiri"}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">{language === "en" ? "Notifications" : "Zidziwitso"}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{language === "en" ? "Security" : "Chitetezo"}</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">{language === "en" ? "Billing" : "Malipiro"}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "en" ? "Profile Information" : "Zambiri za Mbiri"}</CardTitle>
                  <CardDescription>
                    {language === "en" ? "Update your personal information" : "Sinthani zambiri zanu"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{language === "en" ? "Full Name" : "Dzina Lonse"}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Banda"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{language === "en" ? "Email" : "Imelo"}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{language === "en" ? "Phone Number" : "Nambala ya Foni"}</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+265 999 123 456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === "en" ? "Account Type" : "Mtundu wa Akaunti"}</Label>
                      <Input value={userType === "shipper" ? "Shipper" : "Transporter"} disabled />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving
                      ? language === "en"
                        ? "Saving..."
                        : "Akusunga..."
                      : language === "en"
                        ? "Save Changes"
                        : "Sungani Zosintha"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? "Notification Preferences" : "Zomwe Mukufuna pa Zidziwitso"}
                  </CardTitle>
                  <CardDescription>
                    {language === "en" ? "Choose how you want to be notified" : "Sankhani momwe mukufuna kudziwitsidwa"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">{language === "en" ? "Channels" : "Njira"}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notif">
                          {language === "en" ? "Email Notifications" : "Zidziwitso za Imelo"}
                        </Label>
                        <Switch
                          id="email-notif"
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notif">
                          {language === "en" ? "SMS Notifications" : "Zidziwitso za SMS"}
                        </Label>
                        <Switch
                          id="sms-notif"
                          checked={notifications.sms}
                          onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notif">
                          {language === "en" ? "Push Notifications" : "Zidziwitso za Push"}
                        </Label>
                        <Switch
                          id="push-notif"
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      {language === "en" ? "Alert Types" : "Mitundu ya Zidziwitso"}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shipment-updates">
                          {language === "en" ? "Shipment Updates" : "Zosintha za Katundu"}
                        </Label>
                        <Switch
                          id="shipment-updates"
                          checked={notifications.shipmentUpdates}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({ ...prev, shipmentUpdates: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="payment-alerts">
                          {language === "en" ? "Payment Alerts" : "Zidziwitso za Malipiro"}
                        </Label>
                        <Switch
                          id="payment-alerts"
                          checked={notifications.paymentAlerts}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({ ...prev, paymentAlerts: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="promotions">
                          {language === "en" ? "Promotions & Offers" : "Zothandiza ndi Zopereka"}
                        </Label>
                        <Switch
                          id="promotions"
                          checked={notifications.promotions}
                          onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, promotions: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      showNotification(
                        language === "en" ? "Notification preferences saved" : "Zomwe mukufuna zasungidwa",
                        "success",
                      )
                    }
                  >
                    {language === "en" ? "Save Preferences" : "Sungani Zomwe Mukufuna"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "en" ? "Security Settings" : "Zosintha za Chitetezo"}</CardTitle>
                  <CardDescription>
                    {language === "en" ? "Manage your account security" : "Yanganirani chitetezo cha akaunti yanu"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        {language === "en" ? "Current Password" : "Chinsinsi Chapano"}
                      </Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">
                        {language === "en" ? "New Password" : "Chinsinsi Chatsopano"}
                      </Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        {language === "en" ? "Confirm Password" : "Tsimikizani Chinsinsi"}
                      </Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      showNotification(
                        language === "en" ? "Password updated successfully" : "Chinsinsi chasinthidwa bwino",
                        "success",
                      )
                    }
                  >
                    {language === "en" ? "Update Password" : "Sinthani Chinsinsi"}
                  </Button>

                  <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-destructive mb-4">
                      {language === "en" ? "Danger Zone" : "Malo Oopsa"}
                    </h4>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{language === "en" ? "Delete Account" : "Fufutani Akaunti"}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? "Permanently delete your account and all data"
                            : "Fufutani akaunti yanu ndi zonse mosabwezeretsa"}
                        </p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAccount} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        {language === "en" ? "Delete Account" : "Fufutani"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "en" ? "Billing & Payments" : "Malipiro"}</CardTitle>
                  <CardDescription>
                    {language === "en"
                      ? "Manage your payment methods and billing history"
                      : "Yanganirani njira zanu zolipirira ndi mbiri ya malipiro"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                          <CreditCard className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Airtel Money</p>
                          <p className="text-sm text-muted-foreground">+265 999 *** 456</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {language === "en" ? "Edit" : "Sinthani"}
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    {language === "en" ? "Add Payment Method" : "Onjezani Njira Yolipirira"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-6">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{language === "en" ? "Sign Out" : "Tulukani"}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Sign out of your account" : "Tulukani pa akaunti yanu"}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                {language === "en" ? "Sign Out" : "Tulukani"}
              </Button>
            </CardContent>
          </Card>
      </div>
    </DashboardShell>
  )
}
