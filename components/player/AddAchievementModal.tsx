'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddAchievementModalProps {
  playerId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AddAchievementModal({ playerId, onSuccess, trigger }: AddAchievementModalProps) {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    achievement_text: '',
    achievement_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.achievement_text) {
      toast.error('Please enter an achievement');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('player_achievements')
        .insert({
          player_id: playerId,
          achievement_text: formData.achievement_text,
          achievement_date: formData.achievement_date || null,
        });

      if (error) {
        toast.error('Failed to add achievement');
        console.error(error);
        return;
      }

      toast.success('Achievement added!');
      setOpen(false);
      setFormData({ achievement_text: '', achievement_date: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const quickAddAchievements = [
    'All-Conference Team',
    'All-District Team',
    'All-State Team',
    'Team MVP',
    'Team Captain',
    'Perfect Game Showcase Invite',
    'PG All-American',
    'Area Code Games Selection',
    'State Championship',
    'District Championship',
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Achievement
          </Button>
)}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Add Achievement
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Achievement *</Label>
            <Input
              value={formData.achievement_text}
              onChange={(e) => setFormData({ ...formData, achievement_text: e.target.value })}
              placeholder="e.g., All-Conference Team 2024"
            />
          </div>
      <div className="space-y-2">
            <Label className="text-sm text-slate-500">Quick Add</Label>
            <div className="flex flex-wrap gap-2">
              {quickAddAchievements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            quickAddAchievements.map((achievement) => (
                <button
                  key={achievement}
                  type="button"
                  className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setFormData({ ...formData, achievement_text: achievement })}
                >
                  {achievement}
                </button>
              ))}
            </div>
          </div>
      <div className="space-y-2">
            <Label>Date (Optional)</Label>
            <Input
              type="date"
              value={formData.achievement_date}
              onChange={(e) => setFormData({ ...formData, achievement_date: e.target.value })}
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
                'Add Achievement'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

