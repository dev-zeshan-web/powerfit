import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity, FiCalendar, FiStar, FiMessageSquare, FiLogOut, FiMenu,
  FiCheckCircle, FiClock, FiAlertCircle, FiPlus, FiSend, FiEdit2,
  FiTrash2, FiX, FiHome, FiUser, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import AIChat from '../components/AIChat';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

/* ─── Booking Modal (Add + Edit) ──────────────────────────── */
function BookingModal({ open, onClose, editBooking, availableClasses, trainers, profile, onSaved }) {
  const [classId, setClassId]   = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [notes, setNotes]       = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (open) {
      if (editBooking) {
        setClassId(editBooking.class_id || '');
        setTrainerId(editBooking.trainer_id || '');
        setNotes(editBooking.notes || '');
      } else {
        setClassId(''); setTrainerId(''); setNotes('');
      }
    }
  }, [open, editBooking]);

  async function handleSave() {
    if (!classId) { toast.error('Please select a class'); return; }
    setSaving(true);
    try {
      if (editBooking) {
        // EDIT — update trainer + notes
        const { error } = await supabase.from('class_bookings')
          .update({ trainer_id: trainerId || null, notes })
          .eq('id', editBooking.id);
        if (error) throw error;
        toast.success('Booking updated!');
      } else {
        // ADD — new booking
        const { error } = await supabase.from('class_bookings')
          .insert({ class_id: classId, member_id: profile.id, trainer_id: trainerId || null, notes, status: 'confirmed' });
        if (error?.code === '23505') { toast.error('You already booked this class'); setSaving(false); return; }
        if (error) throw error;
        toast.success('Class booked successfully! 🎉');
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message || 'Something went wrong');
    }
    setSaving(false);
  }

  if (!open) return null;

  const selectedClass = availableClasses.find(c => c.id === classId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {editBooking ? 'Edit Booking' : 'Book a Class'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Class Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Class <span className="text-red-500">*</span>
            </label>
            <select
              value={classId}
              onChange={e => { setClassId(e.target.value); setTrainerId(''); }}
              disabled={!!editBooking}
              className="input-field disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">-- Choose a class --</option>
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.schedule ? format(new Date(c.schedule), 'EEE, MMM d · h:mm a') : 'TBD'} ({c.level})
                </option>
              ))}
            </select>
          </div>

          {/* Class Info Card */}
          {selectedClass && (
            <div className="p-4 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-xl text-sm space-y-1">
              <p className="font-semibold text-brand-700 dark:text-brand-400">{selectedClass.name}</p>
              <p className="text-gray-600 dark:text-gray-400">📍 {selectedClass.location || 'Main Hall'} &nbsp;·&nbsp; ⏱ {selectedClass.duration_minutes || 60} min &nbsp;·&nbsp; 👥 {selectedClass.capacity || 20} spots</p>
              {selectedClass.description && <p className="text-gray-500 dark:text-gray-400">{selectedClass.description}</p>}
            </div>
          )}

          {/* Trainer Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Trainer <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select value={trainerId} onChange={e => setTrainerId(e.target.value)} className="input-field">
              <option value="">-- No preference --</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>{t.full_name} {t.specialization ? `· ${t.specialization}` : ''}</option>
              ))}
            </select>
            {trainerId && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {trainers.find(t => t.id === trainerId)?.full_name?.[0] || 'T'}
                </div>
                <span className="font-medium">{trainers.find(t => t.id === trainerId)?.full_name} selected</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes / Special Request</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any injuries, goals or requests for the trainer..."
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 text-sm">
            {saving ? 'Saving...' : editBooking ? 'Update Booking' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────── */
export default function MemberDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]   = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading]       = useState(true);

  const [membership, setMembership] = useState(null);
  const [bookings, setBookings]     = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [trainers, setTrainers]     = useState([]);
  const [myReviews, setMyReviews]   = useState([]);
  const [payments, setPayments]     = useState([]);

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editBooking, setEditBooking] = useState(null); // null = add, obj = edit

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Use profile.id as dep so effect only re-runs when the USER changes,
  // not on every profile object re-reference from parent re-renders
  const profileId = profile?.id;

  useEffect(() => {
    if (!profileId) return;
    fetchAll();

    // ── Realtime: auto-refresh when admin changes class schedule ──
    let channel;
    const timer = setTimeout(() => {
      channel = supabase
        .channel(`member-rt-${profileId}`)
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'classes' },
          () => { fetchAvailableClasses(); toast('📅 Class schedule updated!', { icon: '🔔', duration: 2500 }); }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'class_bookings',
            filter: `member_id=eq.${profileId}` },
          () => fetchBookings()
        )
        .subscribe();
    }, 1000); // small delay prevents duplicate subscriptions on fast mounts

    return () => {
      clearTimeout(timer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [profileId]);

  async function fetchAll() {
    setLoading(true);
    try {
      await Promise.all([fetchMembership(), fetchBookings(), fetchAvailableClasses(), fetchTrainers(), fetchMyReviews(), fetchPayments()]);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembership() {
    const { data } = await supabase.from('memberships')
      .select('*, plans(name, price, features)')
      .eq('member_id', profile.id).eq('status', 'active').maybeSingle();
    setMembership(data);
  }

  async function fetchBookings() {
    const { data } = await supabase.from('class_bookings')
      .select('*, classes(name, schedule, location, level, duration_minutes), profiles!class_bookings_trainer_id_fkey(full_name)')
      .eq('member_id', profile.id)
      .order('booked_at', { ascending: false });
    setBookings(data || []);
  }

  async function fetchAvailableClasses() {
    const { data } = await supabase.from('classes')
      .select('*').eq('is_active', true)
      .order('schedule', { ascending: true });
    setAvailableClasses(data || []);
  }

  async function fetchTrainers() {
    const { data } = await supabase.from('profiles')
      .select('id, full_name, trainer_profiles(specialization, experience_years)')
      .eq('role', 'trainer');
    // Flatten specialization
    const list = (data || []).map(t => ({
      id: t.id,
      full_name: t.full_name,
      specialization: t.trainer_profiles?.[0]?.specialization || null,
      experience: t.trainer_profiles?.[0]?.experience_years || null,
    }));
    setTrainers(list);
  }

  async function fetchMyReviews() {
    const { data } = await supabase.from('reviews')
      .select('*').eq('member_id', profile.id).order('created_at', { ascending: false });
    setMyReviews(data || []);
  }

  async function fetchPayments() {
    const { data } = await supabase.from('payments')
      .select('*, plans(name), memberships(plan_id)').eq('member_id', profile.id).order('created_at', { ascending: false });
    setPayments(data || []);
  }

  function openAdd() { setEditBooking(null); setModalOpen(true); }
  function openEdit(booking) { setEditBooking(booking); setModalOpen(true); }

  async function deleteBooking(bookingId) {
    const result = await Swal.fire({ title: 'Cancel Booking?', text: 'Are you sure you want to cancel this class booking?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, cancel it' });
    if (!result.isConfirmed) return;
    const { error } = await supabase.from('class_bookings').delete().eq('id', bookingId);
    if (error) toast.error('Failed to cancel');
    else { toast.success('Booking cancelled'); fetchBookings(); }
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews')
      .insert({ member_id: profile.id, reviewer_name: profile.full_name, rating: reviewForm.rating, comment: reviewForm.comment, is_approved: true });
    if (error) toast.error('Failed to submit');
    else { toast.success('Review submitted! 🎉'); setReviewForm({ rating: 5, comment: '' }); fetchMyReviews(); }
    setSubmittingReview(false);
  }

  const daysLeft = membership?.end_date
    ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / 86400000)) : 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  const tabs = [
    { id: 'overview',   label: 'Overview',      icon: FiActivity },
    { id: 'bookings',   label: 'My Bookings',   icon: FiCalendar },
    { id: 'classes',    label: 'Browse Classes', icon: FiCheckCircle },
    { id: 'reviews',    label: 'Reviews',        icon: FiStar },
    { id: 'aichat',     label: 'AI Assistant',   icon: FiMessageSquare },
    { id: 'billing',    label: 'Billing',        icon: FiDollarSign },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {profile?.full_name?.[0]?.toUpperCase() || 'M'}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{profile?.full_name}</p>
              <p className="text-brand-400 text-xs font-medium">Member</p>
            </div>
          </div>
          {membership && (
            <div className="mt-4 p-3 bg-brand-500/10 border border-brand-500/30 rounded-lg">
              <p className="text-brand-400 text-xs font-medium">{membership.plans?.name}</p>
              <p className="text-white text-xs mt-1">{daysLeft} days remaining</p>
              <div className="w-full bg-dark-600 rounded-full h-1.5 mt-2">
                <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-brand-500 text-white' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-700 space-y-2">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white text-sm font-medium transition-colors">
            <FiHome className="w-4 h-4" />Back to Home
          </button>
          <button onClick={async () => { try { await signOut(); } catch(_){} navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-colors">
            <FiLogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'bookings' && (
              <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <FiPlus className="w-4 h-4" />Book a Class
              </button>
            )}
            <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
              Welcome, {profile?.full_name?.split(' ')[0]}! 💪
            </p>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isExpiringSoon && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-300 dark:border-yellow-500/30 rounded-xl flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Membership expires in <strong>{daysLeft} days</strong>.
                  </p>
                  <button onClick={() => navigate('/plans')} className="ml-auto btn-primary text-sm py-1.5 px-4 shrink-0">Renew</button>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Plan',           value: membership?.plans?.name || 'No Plan', icon: FiActivity, color: 'text-brand-500', bg: 'bg-brand-500/10' },
                  { label: 'Days Left',      value: membership ? `${daysLeft}d` : '—',    icon: FiClock,    color: 'text-blue-500',  bg: 'bg-blue-500/10'  },
                  { label: 'Classes Booked', value: bookings.length,                       icon: FiCalendar, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'My Reviews',     value: myReviews.length,                      icon: FiStar,     color: 'text-yellow-500',bg: 'bg-yellow-500/10'},
                ].map((s, i) => (
                  <div key={i} className="card p-5">
                    <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Membership Card */}
              {membership ? (
                <div className="card p-6 bg-gradient-to-br from-brand-500 to-orange-700 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-orange-200 text-sm font-medium uppercase tracking-wider">Membership Card</p>
                      <h2 className="text-2xl font-bold mt-1">{membership.plans?.name}</h2>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🏋️</div>
                  </div>
                  <p className="font-bold text-lg">{profile?.full_name}</p>
                  <div className="flex flex-wrap gap-6 mt-4 text-sm">
                    <div><p className="text-orange-200">Started</p><p className="font-semibold">{format(new Date(membership.start_date), 'MMM d, yyyy')}</p></div>
                    <div><p className="text-orange-200">Expires</p><p className="font-semibold">{format(new Date(membership.end_date), 'MMM d, yyyy')}</p></div>
                    <div><p className="text-orange-200">Price</p><p className="font-semibold">PKR {membership.plans?.price?.toLocaleString()}/mo</p></div>
                  </div>
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-5xl mb-4">🏋️</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">No Active Membership</h3>
                  <p className="text-gray-500 text-sm mb-4">Join PowerFit and start your fitness journey!</p>
                  <button onClick={() => navigate('/plans')} className="btn-primary">View Plans</button>
                </div>
              )}

              {/* Recent Bookings */}
              {bookings.length > 0 && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Recent Bookings</h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-sm text-brand-500 hover:underline">View all</button>
                  </div>
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{b.classes?.name}</p>
                          <p className="text-xs text-gray-500">
                            {b.classes?.schedule ? format(new Date(b.classes.schedule), 'EEE, MMM d · h:mm a') : 'TBD'}
                            {b.profiles?.full_name ? ` · ${b.profiles.full_name}` : ''}
                          </p>
                        </div>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MY BOOKINGS (CRUD) ── */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="card p-12 text-center">
                  <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-1">No bookings yet</p>
                  <p className="text-gray-400 text-sm mb-4">Book your first class and start training!</p>
                  <button onClick={openAdd} className="btn-primary">
                    <FiPlus className="w-4 h-4" />Book a Class
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {bookings.map(b => (
                    <div key={b.id} className="card p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{b.classes?.name}</h3>
                          <span className={`badge mt-1 ${b.status === 'confirmed' ? 'badge-success' : b.status === 'attended' ? 'badge-info' : 'badge-warning'}`}>{b.status}</span>
                        </div>
                        {/* Edit & Delete buttons */}
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(b)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit booking"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Cancel booking"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <p>🕐 {b.classes?.schedule ? format(new Date(b.classes.schedule), 'EEE, MMM d · h:mm a') : 'TBD'}</p>
                        <p>📍 {b.classes?.location || 'Main Hall'}</p>
                        <p>🏷 Level: {b.classes?.level || 'All Levels'}</p>
                        {/* Trainer badge */}
                        {b.profiles?.full_name ? (
                          <p className="flex items-center gap-1.5 mt-2">
                            <span className="w-6 h-6 bg-brand-500 rounded-full inline-flex items-center justify-center text-white text-xs font-bold">
                              {b.profiles.full_name[0]}
                            </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{b.profiles.full_name}</span>
                            <span className="text-gray-400 text-xs">(Trainer)</span>
                          </p>
                        ) : (
                          <p className="text-gray-400 text-xs italic">No trainer selected</p>
                        )}
                        {b.notes && <p className="text-xs text-gray-500 mt-1 italic">📝 {b.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BROWSE CLASSES ── */}
          {activeTab === 'classes' && (
            <div className="space-y-4">
              {!membership && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-300 dark:border-yellow-500/30 rounded-xl">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    ⚠️ You need an active membership to book classes.{' '}
                    <button onClick={() => navigate('/plans')} className="underline font-semibold">Get a plan</button>
                  </p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableClasses.map(c => {
                  const isBooked = bookings.some(b => b.class_id === c.id);
                  return (
                    <div key={c.id} className="card p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
                        <span className={`badge ${c.level === 'Beginner' ? 'badge-success' : c.level === 'Intermediate' ? 'badge-warning' : 'badge-danger'}`}>{c.level}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{c.description}</p>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <p>🕐 {c.schedule ? format(new Date(c.schedule), 'EEE, MMM d · h:mm a') : 'TBD'}</p>
                        <p>⏱ {c.duration_minutes || 60} min &nbsp;·&nbsp; 👥 {c.capacity || 20} spots</p>
                        <p>📍 {c.location || 'Main Hall'}</p>
                      </div>
                      {isBooked ? (
                        <div className="w-full py-2 rounded-lg text-sm font-semibold bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-center">
                          ✓ Already Booked
                        </div>
                      ) : (
                        <button
                          onClick={() => { if (!membership) { toast.error('Membership required'); return; } setEditBooking(null); setModalOpen(true); setTimeout(() => { document.querySelector('select')?.focus(); }, 100); }}
                          disabled={!membership}
                          className="w-full btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          // Pre-select this class when opening modal
                          data-class-id={c.id}
                          onClick={() => {
                            if (!membership) { toast.error('Active membership required to book classes'); return; }
                            setEditBooking(null);
                            setModalOpen(true);
                          }}
                        >
                          Book This Class
                        </button>
                      )}
                    </div>
                  );
                })}
                {availableClasses.length === 0 && <p className="text-gray-400 col-span-3">No classes available yet</p>}
              </div>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiPlus className="text-brand-500" />Write a Review</h3>
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          className={`text-2xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>★</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Review</label>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      rows={4} placeholder="Share your PowerFit experience..." className="input-field resize-none" />
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn-primary flex items-center gap-2">
                    <FiSend className="w-4 h-4" />{submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
              {myReviews.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">My Reviews ({myReviews.length})</h3>
                  <div className="space-y-4">
                    {myReviews.map(r => (
                      <div key={r.id} className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                          <span className="text-xs text-gray-500">{r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : '—'}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AI CHAT ── */}
          {activeTab === 'aichat' && (
            <div className="max-w-3xl">
              <div className="card p-6 mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">🤖 AI Fitness Assistant</h3>
                <p className="text-sm text-gray-500">Get personalized workout plans, diet advice, and fitness tips powered by AI.</p>
              </div>
              <AIChat inline={true} />
            </div>
          )}

          {/* ── BILLING ── */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {membership && (
                <div className="card p-6 border-l-4 border-brand-500">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Current Plan</h3>
                  <div className="grid sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Plan',    value: membership.plans?.name },
                      { label: 'Price',   value: `PKR ${membership.plans?.price?.toLocaleString()}/mo` },
                      { label: 'Started', value: format(new Date(membership.start_date), 'MMM d, yyyy') },
                      { label: 'Expires', value: format(new Date(membership.end_date), 'MMM d, yyyy') },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                  <h3 className="font-bold text-gray-900 dark:text-white">Payment History</h3>
                </div>
                {payments.length === 0 ? (
                  <p className="text-center text-gray-400 py-12">No payment records</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-dark-700">
                    {payments.map(p => (
                      <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{p.plans?.name}</p>
                          <p className="text-xs text-gray-500">TXN: {p.transaction_id} · {p.created_at ? format(new Date(p.created_at), 'MMM d, yyyy') : '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">PKR {p.amount?.toLocaleString()}</p>
                          <span className={`badge ${p.status === 'verified' ? 'badge-success' : p.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!membership && (
                <div className="text-center py-4">
                  <button onClick={() => navigate('/plans')} className="btn-primary">Get a Membership Plan</button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editBooking={editBooking}
        availableClasses={availableClasses}
        trainers={trainers}
        profile={profile}
        onSaved={fetchBookings}
      />
    </div>
  );
}
