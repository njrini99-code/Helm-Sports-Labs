'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Upload, Users } from 'lucide-react';
import type { Team } from '@/lib/queries/team';
import type { TeamPageMode } from './team-page-shell';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { updateTeamInfo } from '@/lib/queries/team';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TeamOverviewProps {
  team: Team;
  coachName?: string | null;
  mode: TeamPageMode;
  onUpdate?: () => void;
}

export function TeamOverview({ team, coachName, mode, onUpdate }: TeamOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    about: team.about || '',
    program_values: team.program_values || '',
  });

  const isOwner = mode === 'owner';

  const handleSave = async () => {
    const success = await updateTeamInfo(team.id, {
      about: formData.about,
      program_values: formData.program_values,
    });

    if (success) {
      toast.success('Team info updated');
      setIsEditing(false);
      onUpdate?.();
    } else {
      toast.error('Failed to update team info');
    }
  };

  return (
    <div className="space-y-6">
      {/* About Section */}
      <Card className="bg-[#111315] border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">About the Program</CardTitle>
          {isOwner && (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111315] border-white/10">
                <DialogHeader>
                  <DialogTitle>Edit Team Info</DialogTitle>
                  <DialogDescription>
                    Update your team's description and values
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      About
                    </label>
                    <Textarea
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      className="bg-[#0B0D0F] border-white/10 text-white"
                      rows={4}
                      placeholder="Describe your program..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Program Values
                    </label>
                    <Textarea
                      value={formData.program_values}
                      onChange={(e) => setFormData({ ...formData, program_values: e.target.value })}
                      className="bg-[#0B0D0F] border-white/10 text-white"
                      rows={3}
                      placeholder="What values drive your program?"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {team.about ? (
            <p className="text-slate-300 leading-relaxed">{team.about}</p>
          ) : (
            <p className="text-slate-500 italic">No description yet.</p>
          )}

          {team.program_values && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Program Values</h3>
              <p className="text-slate-300">{team.program_values}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placement Highlights */}
      {team.placement_highlights && team.placement_highlights.length > 0 && (
        <Card className="bg-[#111315] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Placement Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {team.placement_highlights.map((highlight, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-blue-500/10 text-blue-200 border-blue-500/30"
                >
                  {highlight}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owner Actions */}
      {isOwner && (
        <Card className="bg-[#111315] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Team Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-[#0B0D0F] border-white/10">
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
            <Button variant="outline" className="bg-[#0B0D0F] border-white/10">
              <Upload className="w-4 h-4 mr-2" />
              Upload Banner
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Viewer Actions */}
      {mode === 'viewer' && (
        <Card className="bg-[#111315] border-white/5">
          <CardContent className="pt-6">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              View Roster
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
