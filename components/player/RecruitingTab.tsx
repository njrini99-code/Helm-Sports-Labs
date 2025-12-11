'use client';

import { useState, useEffect } from 'react';
import { Plus, School, Mail, Calendar, ChevronRight, Trash2, Edit2, Check, X, Trophy, MapPin } from 'lucide-react';
import { CollegeSearchSelect, type College } from '@/components/colleges/CollegeSearchSelect';
import {
  getRecruitingInterestsForPlayer,
  addRecruitingInterest,
  updateRecruitingInterest,
  deleteRecruitingInterest,
  type RecruitingInterest,
  type RecruitingInterestStatus,
} from '@/lib/api/player/recruitingInterests';

interface RecruitingTabProps {
  playerId: string;
}

const STATUS_OPTIONS: { value: RecruitingInterestStatus; label: string; color: string }[] = [
  { value: 'interested', label: 'Interested', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'questionnaire', label: 'Questionnaire', color: 'bg-indigo-500/20 text-indigo-400' },
  { value: 'unofficial_visit', label: 'Unofficial Visit', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'official_visit', label: 'Official Visit', color: 'bg-pink-500/20 text-pink-400' },
  { value: 'offer', label: 'Offer', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'verbal', label: 'Verbal Commit', color: 'bg-green-500/20 text-green-400' },
  { value: 'signed', label: 'Signed', color: 'bg-green-600/20 text-green-300' },
  { value: 'declined', label: 'Declined', color: 'bg-red-500/20 text-red-400' },
];

export function RecruitingTab({ playerId }: RecruitingTabProps) {
  const [interests, setInterests] = useState<RecruitingInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Add form state
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [newStatus, setNewStatus] = useState<RecruitingInterestStatus>('interested');
  const [newNotes, setNewNotes] = useState('');
  const [newCoachName, setNewCoachName] = useState('');
  
  // Edit form state
  const [editStatus, setEditStatus] = useState<RecruitingInterestStatus>('interested');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadInterests();
  }, [playerId]);

  const loadInterests = async () => {
    setIsLoading(true);
    const data = await getRecruitingInterestsForPlayer(playerId);
    setInterests(data);
    setIsLoading(false);
  };

  const handleAddInterest = async () => {
    if (!selectedCollege) return;

    const result = await addRecruitingInterest({
      playerId,
      collegeId: selectedCollege.id,
      schoolName: selectedCollege.name,
      conference: selectedCollege.conference || undefined,
      division: selectedCollege.division || undefined,
      status: newStatus,
      coachName: newCoachName || undefined,
      notes: newNotes || undefined,
    });

    if (!result.error) {
      setShowAddForm(false);
      setSelectedCollege(null);
      setNewStatus('interested');
      setNewNotes('');
      setNewCoachName('');
      loadInterests();
    }
  };

  const handleUpdateStatus = async (id: string, status: RecruitingInterestStatus) => {
    await updateRecruitingInterest({ id, status });
    loadInterests();
  };

  const handleSaveEdit = async (id: string) => {
    await updateRecruitingInterest({
      id,
      status: editStatus,
      notes: editNotes,
    });
    setEditingId(null);
    loadInterests();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this school from your list?')) {
      await deleteRecruitingInterest(id);
      loadInterests();
    }
  };

  const startEdit = (interest: RecruitingInterest) => {
    setEditingId(interest.id);
    setEditStatus(interest.status);
    setEditNotes(interest.notes || '');
  };

  const getStatusStyle = (status: RecruitingInterestStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusLabel = (status: RecruitingInterestStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
  };

  // Group interests by status category
  const groupedInterests = {
    active: interests.filter(i => !['signed', 'declined'].includes(i.status)),
    committed: interests.filter(i => i.status === 'signed'),
    declined: interests.filter(i => i.status === 'declined'),
  };

  const summaryStats = {
    total: interests.length,
    offers: interests.filter(i => ['offer', 'verbal', 'signed'].includes(i.status)).length,
    visits: interests.filter(i => ['unofficial_visit', 'official_visit'].includes(i.status)).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0B1020] rounded-xl p-4 border border-white/5">
          <p className="text-sm text-white/50 mb-1">Schools</p>
          <p className="text-2xl font-bold text-white">{summaryStats.total}</p>
        </div>
        <div className="bg-[#0B1020] rounded-xl p-4 border border-white/5">
          <p className="text-sm text-white/50 mb-1">Offers</p>
          <p className="text-2xl font-bold text-emerald-400">{summaryStats.offers}</p>
        </div>
        <div className="bg-[#0B1020] rounded-xl p-4 border border-white/5">
          <p className="text-sm text-white/50 mb-1">Visits</p>
          <p className="text-2xl font-bold text-purple-400">{summaryStats.visits}</p>
        </div>
      </div>

      {/* Add School Button */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add School
        </button>
      ) : (
        /* Add School Form */
        <div className="bg-[#0B1020] rounded-xl p-4 border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Add School</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          <CollegeSearchSelect
            value={selectedCollege}
            onChange={setSelectedCollege}
            placeholder="Search for a college..."
          />

          {selectedCollege && (
            <>
              <div>
                <label className="block text-sm text-white/50 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RecruitingInterestStatus)}
                  className="w-full px-3 py-2 bg-[#050711] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/50 mb-1">Coach Contact (optional)</label>
                <input
                  type="text"
                  value={newCoachName}
                  onChange={(e) => setNewCoachName(e.target.value)}
                  placeholder="Coach name"
                  className="w-full px-3 py-2 bg-[#050711] border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-white/50 mb-1">Notes (optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Any notes about this school..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#050711] border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>

              <button
                onClick={handleAddInterest}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-medium transition-colors"
              >
                Add to List
              </button>
            </>
          )}
        </div>
      )}

      {/* Interest List */}
      {groupedInterests.active.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/50 uppercase tracking-wide">Active Interest</h3>
          {groupedInterests.active.map((interest) => (
            <div
              key={interest.id}
              className="bg-[#0B1020] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
            >
              {editingId === interest.id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{interest.school_name}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingId(null)} className="p-1 hover:bg-white/10 rounded">
                        <X className="w-4 h-4 text-white/50" />
                      </button>
                      <button onClick={() => handleSaveEdit(interest.id)} className="p-1 hover:bg-emerald-500/20 rounded">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as RecruitingInterestStatus)}
                    className="w-full px-3 py-2 bg-[#050711] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notes..."
                    rows={2}
                    className="w-full px-3 py-2 bg-[#050711] border border-white/10 rounded-2xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    {interest.college?.logo_url ? (
                      <img src={interest.college.logo_url} alt="" className="w-10 h-10 object-contain" loading="lazy" />
                    ) : (
                      <School className="w-6 h-6 text-white/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{interest.school_name}</p>
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      {interest.college?.city && (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>{interest.college.city}, {interest.college.state}</span>
                        </>
                      )}
                      {interest.conference && (
                        <>
                          <span>•</span>
                          <Trophy className="w-3 h-3" />
                          <span>{interest.conference}</span>
                        </>
                      )}
                    </div>
                    {interest.notes && (
                      <p className="text-sm text-white/40 mt-1 truncate">{interest.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(interest.status)}`}>
                      {getStatusLabel(interest.status)}
                    </span>
                    <button onClick={() => startEdit(interest)} className="p-1.5 hover:bg-white/10 rounded">
                      <Edit2 className="w-4 h-4 text-white/40" />
                    </button>
                    <button onClick={() => handleDelete(interest.id)} className="p-1.5 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4 text-red-400/60" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Committed */}
      {groupedInterests.committed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-emerald-400/80 uppercase tracking-wide">✓ Committed</h3>
          {groupedInterests.committed.map((interest) => (
            <div
              key={interest.id}
              className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <School className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{interest.school_name}</p>
                  <p className="text-sm text-emerald-400/80">{interest.conference}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400">
                  Signed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {interests.length === 0 && (
        <div className="text-center py-12">
          <School className="w-12 h-12 mx-auto text-white/20 mb-3" />
          <p className="text-white/50">No schools added yet</p>
          <p className="text-sm text-white/30 mt-1">Start building your recruiting list</p>
        </div>
      )}
    </div>
  );
}

export default RecruitingTab;

