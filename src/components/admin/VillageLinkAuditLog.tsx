import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, RotateCcw, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { useVillageLinkJobs, AuditLogEntry } from "@/hooks/useVillageLinkJobs";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  villageId: string;
  onRollbackComplete?: () => void;
}

export function VillageLinkAuditLog({ villageId, onRollbackComplete }: Props) {
  const { auditLog, isLoading, fetchAuditLog, rollback } = useVillageLinkJobs(villageId);
  const { role } = useAuth();
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditLogEntry | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  const handleRollbackClick = (audit: AuditLogEntry) => {
    setSelectedAudit(audit);
    setRollbackReason('');
    setRollbackDialogOpen(true);
  };

  const handleViewClick = (audit: AuditLogEntry) => {
    setSelectedAudit(audit);
    setViewDialogOpen(true);
  };

  const handleRollback = async () => {
    if (!selectedAudit) return;
    
    const result = await rollback(selectedAudit.id, rollbackReason);
    if (result.success) {
      setRollbackDialogOpen(false);
      setSelectedAudit(null);
      onRollbackComplete?.();
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'link': return <Badge className="bg-green-500">Link</Badge>;
      case 'unlink': return <Badge className="bg-red-500">Unlink</Badge>;
      case 'update': return <Badge className="bg-blue-500">Update</Badge>;
      case 'rollback': return <Badge className="bg-purple-500">Rollback</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const canRollback = (audit: AuditLogEntry) => {
    // Can't rollback a rollback
    if (audit.action === 'rollback') return false;
    // Only super_admin can rollback
    return isSuperAdmin;
  };

  if (isLoading && auditLog.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading audit log...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No audit entries yet. Link some items to see history.
            </p>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map(entry => (
                    <>
                      <TableRow key={entry.id} className="cursor-pointer" onClick={() => toggleRow(entry.id)}>
                        <TableCell>
                          {expandedRows.has(entry.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>{getActionBadge(entry.action)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{entry.item_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(entry.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {entry.reason || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewClick(entry); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canRollback(entry) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleRollbackClick(entry); }}
                                className="text-orange-500 hover:text-orange-600"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(entry.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/50">
                            <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                              <div>
                                <p className="font-medium mb-2">Before State</p>
                                <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-32">
                                  {entry.before_state ? JSON.stringify(entry.before_state, null, 2) : 'null'}
                                </pre>
                              </div>
                              <div>
                                <p className="font-medium mb-2">After State</p>
                                <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-32">
                                  {entry.after_state ? JSON.stringify(entry.after_state, null, 2) : 'null'}
                                </pre>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Rollback Dialog */}
      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rollback</DialogTitle>
            <DialogDescription>
              This will revert the {selectedAudit?.action} action on this {selectedAudit?.item_type}.
              This action will be logged in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Reason for rollback</label>
              <Textarea
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                placeholder="Describe why you are reverting this change..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRollback} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
              <RotateCcw className="h-4 w-4 mr-2" />
              Confirm Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Entry Details</DialogTitle>
          </DialogHeader>
          {selectedAudit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <p className="mt-1">{getActionBadge(selectedAudit.action)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Item Type</label>
                  <p className="mt-1 capitalize">{selectedAudit.item_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="mt-1 text-sm">{new Date(selectedAudit.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Item ID</label>
                  <p className="mt-1 text-sm font-mono">{selectedAudit.item_id}</p>
                </div>
              </div>
              {selectedAudit.reason && (
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <p className="mt-1 text-sm">{selectedAudit.reason}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Before State</label>
                  <pre className="mt-2 bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                    {selectedAudit.before_state ? JSON.stringify(selectedAudit.before_state, null, 2) : 'null'}
                  </pre>
                </div>
                <div>
                  <label className="text-sm font-medium">After State</label>
                  <pre className="mt-2 bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                    {selectedAudit.after_state ? JSON.stringify(selectedAudit.after_state, null, 2) : 'null'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
