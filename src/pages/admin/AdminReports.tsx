import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Flag, Search, Loader2, MoreVertical, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ReportData {
  id: string;
  reporter: { id: string; name: string; email: string };
  reportedUser: { id: string; name: string; email: string };
  reason: string;
  description?: string;
  status: string;
  adminNotes?: string;
  created_at: string;
}

const reasonLabels: Record<string, string> = {
  spam: '🚫 Spam',
  harassment: '😤 Harassment',
  inappropriate_content: '⚠️ Inappropriate',
  scam: '💰 Scam / Fraud',
  fake_profile: '🎭 Fake Profile',
  threats: '🔴 Threats',
  other: '📝 Other',
};

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  reviewed: {
    label: 'Reviewed',
    className: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    icon: <Eye className="h-3 w-3" />,
  },
  dismissed: {
    label: 'Dismissed',
    className: 'bg-muted text-muted-foreground border-border',
    icon: <XCircle className="h-3 w-3" />,
  },
  actioned: {
    label: 'Actioned',
    className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

const AdminReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReports = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/reports${params}`);
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchReports();
  }, [user, navigate, statusFilter]);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status, adminNotes: adminNotes || undefined });
      toast.success(`Report marked as ${status}`);
      setSelectedReport(null);
      setAdminNotes('');
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update report');
    }
  };

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.reporter.name?.toLowerCase().includes(q) ||
      r.reporter.email?.toLowerCase().includes(q) ||
      r.reportedUser.name?.toLowerCase().includes(q) ||
      r.reportedUser.email?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <Flag className="h-8 w-8 text-primary" />
          Chat Reports
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full bg-destructive text-destructive-foreground text-sm font-bold">
              {pendingCount}
            </span>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          {reports.length} total report{reports.length !== 1 ? 's' : ''} · {pendingCount} pending review
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = reports.filter((r) => r.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              className={`
                flex items-center gap-3 p-4 rounded-xl border transition-all
                ${statusFilter === key ? 'ring-2 ring-primary/40 bg-primary/5' : 'bg-card hover:bg-muted/30'}
              `}
            >
              <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${config.className}`}>
                {config.icon}
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Search Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user name, email, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
      </motion.div>

      {/* Reports Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border bg-card overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Reporter</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Reported User</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Reason</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-right py-3.5 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report, idx) => {
                const sc = statusConfig[report.status] || statusConfig.pending;
                return (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.02 * idx }}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {report.reporter.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{report.reporter.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{report.reporter.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {report.reportedUser.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{report.reportedUser.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{report.reportedUser.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{reasonLabels[report.reason] || report.reason}</span>
                      {report.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{report.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.className}`}>
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(report.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedReport(report); setAdminNotes(report.adminNotes || ''); }}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {report.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'reviewed')}>
                                <Eye className="mr-2 h-4 w-4 text-blue-500" /> Mark Reviewed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'actioned')} className="text-emerald-600">
                                <CheckCircle className="mr-2 h-4 w-4" /> Take Action
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'dismissed')} className="text-muted-foreground">
                                <XCircle className="mr-2 h-4 w-4" /> Dismiss
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Flag className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No reports found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter !== 'all' ? 'Try a different status filter' : 'All clear — no reports to review'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Report Details
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedReport && new Date(selectedReport.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-2">
              {/* Reporter & Reported */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Reporter</Label>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {selectedReport.reporter.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedReport.reporter.name}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedReport.reporter.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Reported</Label>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-xs font-bold">
                      {selectedReport.reportedUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedReport.reportedUser.name}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedReport.reportedUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Reason</Label>
                <p className="text-sm font-medium">{reasonLabels[selectedReport.reason] || selectedReport.reason}</p>
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">User Description</Label>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedReport.description}</p>
                </div>
              )}

              {/* Status */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Status</Label>
                <div>
                  {(() => {
                    const sc = statusConfig[selectedReport.status] || statusConfig.pending;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${sc.className}`}>
                        {sc.icon} {sc.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="admin-notes" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Admin Notes
                </Label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this report..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedReport?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                  className="text-blue-600 border-blue-300"
                >
                  <Eye className="mr-1.5 h-4 w-4" />
                  Mark Reviewed
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedReport.id, 'actioned')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Take Action
                </Button>
              </>
            )}
            {selectedReport?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;
