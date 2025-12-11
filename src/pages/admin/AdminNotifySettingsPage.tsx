import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  useAdminNotifySettings, 
  useAdminNotifyTemplates, 
  useAdminNotifyAudit,
  useUpdateNotifySettings,
  useUpdateNotifyTemplate,
  useRollbackTemplate,
  BookingNotifySettings,
  BookingNotifyTemplate,
} from "@/hooks/useBookingNotifyConfig";
import { Save, RotateCcw, Eye, History, GripVertical, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const BOOKING_TYPES = [
  { key: "package", label: "Travel Packages" },
  { key: "listing", label: "Marketplace Listings" },
  { key: "product", label: "Shop Products" },
];

const TEMPLATE_KEYS = [
  { key: "whatsapp_short_en", label: "WhatsApp Short (EN)", type: "whatsapp" },
  { key: "whatsapp_short_hi", label: "WhatsApp Short (HI)", type: "whatsapp" },
  { key: "whatsapp_full_en", label: "WhatsApp Full (EN)", type: "whatsapp" },
  { key: "whatsapp_full_hi", label: "WhatsApp Full (HI)", type: "whatsapp" },
  { key: "email_subject_en", label: "Email Subject (EN)", type: "email" },
  { key: "email_subject_hi", label: "Email Subject (HI)", type: "email" },
  { key: "email_body_en", label: "Email Body (EN)", type: "email" },
  { key: "email_body_hi", label: "Email Body (HI)", type: "email" },
];

const PLACEHOLDERS = [
  "{{bookingId}}", "{{bookingType}}", "{{itemName}}", 
  "{{customerName}}", "{{customerEmail}}", "{{customerPhone}}",
  "{{dates}}", "{{guestInfo}}", "{{productInfo}}", "{{notes}}"
];

export default function AdminNotifySettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading: settingsLoading } = useAdminNotifySettings();
  const { data: templates, isLoading: templatesLoading } = useAdminNotifyTemplates();
  const { data: auditLogs, isLoading: auditLoading } = useAdminNotifyAudit();
  const updateSettings = useUpdateNotifySettings();
  const updateTemplate = useUpdateNotifyTemplate();
  const rollbackTemplate = useRollbackTemplate();

  // Local form state
  const [formData, setFormData] = useState<Partial<BookingNotifySettings>>({});
  const [editingTemplate, setEditingTemplate] = useState<{ key: string; template: string } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  // Initialize form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        enabled_whatsapp: settings.enabled_whatsapp,
        enabled_email: settings.enabled_email,
        whatsapp_label: settings.whatsapp_label,
        email_label: settings.email_label,
        admin_fallback_phone: settings.admin_fallback_phone,
        admin_fallback_email: settings.admin_fallback_email,
        allow_server_fallback: settings.allow_server_fallback,
        server_fallback_rate_limit_per_hour: settings.server_fallback_rate_limit_per_hour,
        phone_min_digits: settings.phone_min_digits,
        default_language: settings.default_language,
        show_confirm_question: settings.show_confirm_question,
        position_order: settings.position_order,
        visibility: settings.visibility,
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      toast({ title: "Settings saved", description: "Notification settings have been updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    try {
      await updateTemplate.mutateAsync({
        key: editingTemplate.key,
        template: editingTemplate.template,
      });
      toast({ title: "Template saved", description: "A new version has been created." });
      setEditingTemplate(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template.", variant: "destructive" });
    }
  };

  const handleRollback = async (key: string, version: number) => {
    try {
      await rollbackTemplate.mutateAsync({ key, targetVersion: version });
      toast({ title: "Rollback successful", description: `Template restored to version ${version}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to rollback template.", variant: "destructive" });
    }
  };

  const getActiveTemplate = (key: string): BookingNotifyTemplate | undefined => {
    return templates?.find(t => t.key === key && t.is_active);
  };

  const getTemplateVersions = (key: string): BookingNotifyTemplate[] => {
    return templates?.filter(t => t.key === key).sort((a, b) => b.version - a.version) || [];
  };

  const togglePositionOrder = () => {
    const current = formData.position_order || ["whatsapp", "email"];
    const newOrder = current[0] === "whatsapp" ? ["email", "whatsapp"] : ["whatsapp", "email"];
    setFormData({ ...formData, position_order: newOrder });
  };

  const toggleVisibility = (key: string) => {
    const current = formData.visibility || {};
    setFormData({
      ...formData,
      visibility: { ...current, [key]: !current[key] },
    });
  };

  // Preview with sample data
  const renderPreview = (template: string): string => {
    const sampleData: Record<string, string> = {
      "{{bookingId}}": "BK-12345",
      "{{bookingType}}": "Travel Package Booking",
      "{{itemName}}": "Kedarnath-Badrinath Yatra",
      "{{customerName}}": "Rahul Sharma",
      "{{customerEmail}}": "rahul@example.com",
      "{{customerPhone}}": "+91-9876543210",
      "{{dates}}": "Start: 2025-01-15\nEnd: 2025-01-20",
      "{{guestInfo}}": "Guests: 2 Adults, 1 Child",
      "{{productInfo}}": "",
      "{{notes}}": "Vegetarian food preferred",
    };
    let result = template;
    for (const [placeholder, value] of Object.entries(sampleData)) {
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), value);
    }
    return result;
  };

  if (settingsLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Post-Booking Notifications</h1>
          <p className="text-muted-foreground">
            Configure WhatsApp and Email notification buttons shown after bookings.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure notification channels, labels, and fallback contacts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Enable WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">Show WhatsApp button after booking</p>
                    </div>
                    <Switch
                      checked={formData.enabled_whatsapp}
                      onCheckedChange={(checked) => setFormData({ ...formData, enabled_whatsapp: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Enable Email</Label>
                      <p className="text-sm text-muted-foreground">Show Email button after booking</p>
                    </div>
                    <Switch
                      checked={formData.enabled_email}
                      onCheckedChange={(checked) => setFormData({ ...formData, enabled_email: checked })}
                    />
                  </div>
                </div>

                {/* Labels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>WhatsApp Button Label</Label>
                    <Input
                      value={formData.whatsapp_label || ""}
                      onChange={(e) => setFormData({ ...formData, whatsapp_label: e.target.value })}
                      maxLength={80}
                      placeholder="WhatsApp Us"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Button Label</Label>
                    <Input
                      value={formData.email_label || ""}
                      onChange={(e) => setFormData({ ...formData, email_label: e.target.value })}
                      maxLength={80}
                      placeholder="Email Us"
                    />
                  </div>
                </div>

                {/* Fallback Contacts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fallback Phone (Admin)</Label>
                    <Input
                      value={formData.admin_fallback_phone || ""}
                      onChange={(e) => setFormData({ ...formData, admin_fallback_phone: e.target.value })}
                      placeholder="+91-9876543210"
                    />
                    <p className="text-xs text-muted-foreground">Used when provider phone is missing</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Fallback Email (Admin)</Label>
                    <Input
                      value={formData.admin_fallback_email || ""}
                      onChange={(e) => setFormData({ ...formData, admin_fallback_email: e.target.value })}
                      placeholder="contact@humpahadihaii.in"
                    />
                    <p className="text-xs text-muted-foreground">Used when provider email is missing</p>
                  </div>
                </div>

                {/* Other Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select
                      value={formData.default_language}
                      onValueChange={(value) => setFormData({ ...formData, default_language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Phone Digits</Label>
                    <Input
                      type="number"
                      min={6}
                      max={15}
                      value={formData.phone_min_digits || 8}
                      onChange={(e) => setFormData({ ...formData, phone_min_digits: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Show Confirm Question</Label>
                      <p className="text-xs text-muted-foreground">Ask if message sent</p>
                    </div>
                    <Switch
                      checked={formData.show_confirm_question}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_confirm_question: checked })}
                    />
                  </div>
                </div>

                {/* Button Order */}
                <div className="space-y-2">
                  <Label>Button Order</Label>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {(formData.position_order || ["whatsapp", "email"]).map((item, index) => (
                        <Badge key={item} variant="outline" className="flex items-center gap-1">
                          <GripVertical className="h-3 w-3" />
                          {index + 1}. {item === "whatsapp" ? "WhatsApp" : "Email"}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={togglePositionOrder}>
                      Swap Order
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateSettings.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>
                  Edit WhatsApp and Email templates. Use placeholders like customerName
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-2">
                    {PLACEHOLDERS.map(p => (
                      <Badge key={p} variant="secondary" className="font-mono text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>

                {templatesLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="space-y-4">
                    {TEMPLATE_KEYS.map(({ key, label, type }) => {
                      const activeTemplate = getActiveTemplate(key);
                      const versions = getTemplateVersions(key);
                      
                      return (
                        <div key={key} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{label}</h4>
                              <Badge variant={type === "whatsapp" ? "default" : "secondary"}>
                                {type}
                              </Badge>
                              {activeTemplate && (
                                <Badge variant="outline">v{activeTemplate.version}</Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(activeTemplate?.template || "")}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Preview: {label}</DialogTitle>
                                  </DialogHeader>
                                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap font-mono text-sm">
                                    {renderPreview(previewTemplate || "")}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <History className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Version History: {label}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {versions.map(v => (
                                      <div key={v.id} className="flex items-center justify-between p-2 border rounded">
                                        <div>
                                          <span className="font-medium">Version {v.version}</span>
                                          <span className="text-sm text-muted-foreground ml-2">
                                            {format(new Date(v.created_at), "PPp")}
                                          </span>
                                          {v.is_active && <Badge className="ml-2">Active</Badge>}
                                        </div>
                                        {!v.is_active && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRollback(key, v.version)}
                                          >
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                            Restore
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          
                          {editingTemplate?.key === key ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingTemplate.template}
                                onChange={(e) => setEditingTemplate({ ...editingTemplate, template: e.target.value })}
                                rows={6}
                                className="font-mono text-sm"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveTemplate} disabled={updateTemplate.isPending}>
                                  {updateTemplate.isPending ? "Saving..." : "Save New Version"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingTemplate(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded max-h-32 overflow-y-auto">
                                {activeTemplate?.template || "No template set"}
                              </pre>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setEditingTemplate({ key, template: activeTemplate?.template || "" })}
                              >
                                Edit Template
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visibility */}
          <TabsContent value="visibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visibility by Booking Type</CardTitle>
                <CardDescription>
                  Control which booking types show notification buttons.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {BOOKING_TYPES.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">{label}</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notification buttons for {label.toLowerCase()}
                      </p>
                    </div>
                    <Checkbox
                      checked={formData.visibility?.[key] !== false}
                      onCheckedChange={() => toggleVisibility(key)}
                    />
                  </div>
                ))}
                <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateSettings.isPending ? "Saving..." : "Save Visibility Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  History of all changes to notification settings and templates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : auditLogs && auditLogs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Changed By</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {format(new Date(log.created_at), "PPp")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.change_type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.changed_by || "System"}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">View Diff</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Change Details</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2 text-red-600">Before</h4>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                                      {JSON.stringify(log.before_value, null, 2) || "N/A"}
                                    </pre>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2 text-green-600">After</h4>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                                      {JSON.stringify(log.after_value, null, 2) || "N/A"}
                                    </pre>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No audit logs yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
