'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Check,
  QrCode,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
// QR Code generation using external service

interface Invitation {
  id: string;
  invite_code: string;
  invite_link: string;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  created_at: string;
}

interface TeamInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

export function TeamInviteModal({ open, onOpenChange, teamId }: TeamInviteModalProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newInvite, setNewInvite] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [maxUses, setMaxUses] = useState<number | ''>('');

  useEffect(() => {
    if (open && teamId) {
      loadInvitations();
    }
  }, [open, teamId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${teamId}/invite`);
      const data = await response.json();

      if (response.ok) {
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresInDays: expiresInDays || null,
          maxUses: maxUses || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to generate invitation');
        return;
      }

      setNewInvite(data.invitation);
      await loadInvitations();
      toast.success('Invitation link generated!');
    } catch (error) {
      console.error('Error generating invite:', error);
      toast.error('Failed to generate invitation');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const generateQRCode = (link: string) => {
    if (!link) {
      toast.error('No link to generate QR code for');
      return;
    }
    
    try {
      // Use external QR code service
      const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
      setQrCodeUrl(qrServiceUrl);
      toast.success('QR code generated');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const shareViaEmail = (link: string) => {
    if (!link) {
      toast.error('No link to share');
      return;
    }
    
    try {
      const subject = encodeURIComponent('Join my team on ScoutPulse');
      const body = encodeURIComponent(
        `I've invited you to join my team on ScoutPulse. Click the link below to join:\n\n${link}`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      toast.success('Email client opened');
    } catch (error) {
      console.error('Error opening email client:', error);
      toast.error('Failed to open email client');
    }
  };

  const shareViaSMS = (link: string) => {
    if (!link) {
      toast.error('No link to share');
      return;
    }
    
    try {
      const message = encodeURIComponent(
        `Join my team on ScoutPulse: ${link}`
      );
      window.location.href = `sms:?body=${message}`;
      toast.success('SMS client opened');
    } catch (error) {
      console.error('Error opening SMS client:', error);
      toast.error('Failed to open SMS client');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Players to Your Team</DialogTitle>
          <DialogDescription>
            Generate an invite link to share with your players. They can join your team instantly.
          </DialogDescription>
        </DialogHeader>
      <div className="space-y-6">
          {/* Generate New Invite */}
          {!newInvite && (
            <div className="space-y-4 p-4 border rounded-2xl bg-slate-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expires">Expires in (days)</Label>
                  <Input
                    id="expires"
                    type="number"
                    min="1"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value})
                  />
                </div>
                <div>
                  <Label htmlFor="maxUses">Max uses (optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) =>
                      setMaxUses(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <Button
                onClick={generateInvite}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Generate Invite Link
                  </>
                )}
              </Button>
            </div>
)}
          {/* New Invite Display */}
          {newInvite && (
            <div className="space-y-4 p-4 border-2 border-blue-200 rounded-2xl bg-blue-50">
              <div className="flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <h3 className="font-semibold text-blue-900">New Invitation Link</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewInvite(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
      <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newInvite.invite_link}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newInvite.invite_link)}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
      <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateQRCode(newInvite.invite_link)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareViaEmail(newInvite.invite_link)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareViaSMS(newInvite.invite_link)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Text Link
                  </Button>
                </div>
      {qrCodeUrl && (
                  <div className="flex justify-center p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded border">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
)}
              </div>
            </div>
)}
          {/* Existing Invitations */}
          <div className="space-y-2">
            <h3 className="font-semibold">Active Invitations</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : invitations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No active invitations. Generate one above.
              </p>
            ) : (
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 border rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                        <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                          {inv.invite_code}
                        </code>
                        {inv.expires_at &&
                          new Date(inv.expires_at) < new Date() && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                        <span>
                          Uses: {inv.current_uses}
                          {inv.max_uses ? ` / ${inv.max_uses}` : ' / ∞'}
                        </span>
                        {inv.expires_at && (
                          <span>
                            Expires:{' '}
                            {new Date(inv.expires_at).toLocaleDateString()}
                          </span>
)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(inv.invite_link)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
)}
              </div>
)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

