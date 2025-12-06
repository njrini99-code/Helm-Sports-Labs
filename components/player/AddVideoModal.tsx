'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Video, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddVideoModalProps {
  playerId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AddVideoModal({ playerId, onSuccess, trigger }: AddVideoModalProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    video_type: '',
    video_url: '',
    recorded_date: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.video_type || !formData.video_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('player_videos')
        .insert({
          player_id: playerId,
          title: formData.title,
          video_type: formData.video_type,
          video_url: formData.video_url,
          recorded_date: formData.recorded_date || null,
          notes: formData.notes || null,
        });

      if (error) {
        toast.error('Failed to add video');
        console.error(error);
        return;
      }

      toast.success('Video added successfully!');
      setOpen(false);
      setFormData({ title: '', video_type: '', video_url: '', recorded_date: '', notes: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-500" />
            Add Video
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Summer Showcase Highlights"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Video Type *</Label>
            <Select value={formData.video_type} onValueChange={(v) => setFormData({ ...formData, video_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Game">Game Footage</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Video URL *</Label>
            <Input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-slate-500">YouTube, Vimeo, or direct video link</p>
          </div>
          
          <div className="space-y-2">
            <Label>Date Recorded</Label>
            <Input
              type="date"
              value={formData.recorded_date}
              onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this video..."
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-500">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Video'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

