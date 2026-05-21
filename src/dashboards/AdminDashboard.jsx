import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiDollarSign, FiActivity, FiClock, FiCheckCircle, FiXCircle,
  FiLogOut, FiMenu, FiUserCheck, FiUserX, FiRefreshCw,
  FiCalendar, FiTool, FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiX, FiHome, FiAward
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

/* ─── Shared Modal Shell ───────────────────────────────────── */
function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-700 sticky top-0 bg-white dark:bg-dark-800 z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Classes Tab (full CRUD + schedule edit) ──────────────── */
function ClassesTab() {
  const [classes, setClasses]   = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModal]   = useState(false);
  const [editing, setEditing]   = useState(null);
  const blankForm = { name:'', description:'', category:'General', level:'All Levels', schedule:'', duration_minutes:60, capacity:20, location:'Main Hall', trainer_id:'', is_active:true };
  const [form, setForm]         = useState(blankForm);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { load(); loadTrainers(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('classes').select('*, profiles(full_name)').order('schedule', { ascending: true });
    if (error) toast.error('Failed to load classes');
    setClasses(data || []);
    setLoading(false);
  }

  async function loadTrainers() {
    const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'trainer');
    setTrainers(data || []);
  }

  function openAdd() {
    setEditing(null);
    // Default schedule = tomorrow 9am
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0);
    setForm({ ...blankForm, schedule: toLocal(d) });
    setModal(true);
  }

  function openEdit(cls) {
    setEditing(cls);
    setForm({
      name:             cls.name || '',
      description:      cls.description || '',
      category:         cls.category || 'General',
      level:            cls.level || 'All Levels',
      schedule:         cls.schedule ? toLocal(new Date(cls.schedule)) : '',
      duration_minutes: cls.duration_minutes || 60,
      capacity:         cls.capacity || 20,
      location:         cls.location || 'Main Hall',
      trainer_id:       cls.trainer_id || '',
      is_active:        cls.is_active !== false,
    });
    setModal(true);
  }

  // Convert Date to "YYYY-MM-DDThh:mm" for datetime-local input
  function toLocal(d) {
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function save() {
    if (!form.name.trim())     { toast.error('Class name required'); return; }
    if (!form.schedule)        { toast.error('Schedule date & time required'); return; }
    setSaving(true);
    const payload = {
      name:             form.name.trim(),
      description:      form.description.trim(),
      category:         form.category,
      level:            form.level,
      schedule:         new Date(form.schedule).toISOString(),
      duration_minutes: parseInt(form.duration_minutes) || 60,
      capacity:         parseInt(form.capacity) || 20,
      location:         form.location.trim() || 'Main Hall',
      trainer_id:       form.trainer_id || null,
      is_active:        form.is_active,
    };
    const { error } = editing
      ? await supabase.from('classes').update(payload).eq('id', editing.id)
      : await supabase.from('classes').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? '✅ Class schedule updated!' : '✅ Class created!'); setModal(false); load(); }
    setSaving(false);
  }

  async function del(id, name) {
    const result = await Swal.fire({ title: `Delete "${name}"?`, text: 'This will also remove all bookings.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, delete!', background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff', color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937' });
    if (!result.isConfirmed) return;
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Class deleted'); load(); }
  }

  async function toggleActive(cls) {
    await supabase.from('classes').update({ is_active: !cls.is_active }).eq('id', cls.id);
    load();
  }

  const levelColor = { Beginner:'badge-success', Intermediate:'badge-warning', Advanced:'badge-danger', 'All Levels':'badge-info' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{classes.length} classes total</p>
        <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <FiPlus className="w-4 h-4" />Add Class
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <div key={c.id} className={`card p-5 transition-all ${!c.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{c.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{c.category}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <span className={`badge text-xs ${levelColor[c.level] || 'badge-info'}`}>{c.level}</span>
                </div>
              </div>

              {c.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{c.description}</p>}

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <p className="flex items-center gap-1.5">
                  <span className="text-brand-500">🕐</span>
                  {c.schedule ? format(new Date(c.schedule), 'EEE, MMM d · h:mm a') : <span className="text-red-400">No schedule set</span>}
                </p>
                <p>⏱ {c.duration_minutes || 60} min</p>
                <p>📍 {c.location || 'Main Hall'}</p>
                <p>👥 Capacity: {c.capacity || 20}</p>
                {c.profiles?.full_name && <p>👤 {c.profiles.full_name}</p>}
                <p className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${c.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-xs">{c.is_active ? 'Active' : 'Inactive'}</span>
                </p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-dark-700">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg font-medium transition-colors">
                  <FiEdit2 className="w-3.5 h-3.5" />Edit
                </button>
                <button onClick={() => toggleActive(c)} className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-colors ${c.is_active ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'}`}>
                  {c.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => del(c.id, c.name)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {classes.length === 0 && <p className="text-gray-400 col-span-3 text-center py-12">No classes yet. Add your first class!</p>}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} title={editing ? `Edit: ${editing.name}` : 'Add New Class'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Class Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. HIIT Blast" className="input-field" />
          </div>

          {/* Schedule — date + time picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date &amp; Time *
              <span className="ml-2 text-xs font-normal text-brand-500">← Admin can change this to reschedule</span>
            </label>
            <input
              type="datetime-local"
              value={form.schedule}
              onChange={e => setForm(p => ({...p, schedule: e.target.value}))}
              className="input-field"
            />
            {form.schedule && (
              <p className="text-xs text-gray-400 mt-1">
                📅 {format(new Date(form.schedule), 'EEEE, MMMM d, yyyy')} at {format(new Date(form.schedule), 'h:mm a')}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Short class description..." className="input-field resize-none" />
          </div>

          {/* Row: Category + Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="input-field">
                {['General','Cardio','Strength','Yoga','HIIT','Core','Martial Arts','CrossFit','Cycling','Pilates'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Level</label>
              <select value={form.level} onChange={e => setForm(p => ({...p, level: e.target.value}))} className="input-field">
                {['All Levels','Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Duration + Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Duration (min)</label>
              <input type="number" min="15" max="180" value={form.duration_minutes} onChange={e => setForm(p => ({...p, duration_minutes: e.target.value}))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Capacity (spots)</label>
              <input type="number" min="1" max="100" value={form.capacity} onChange={e => setForm(p => ({...p, capacity: e.target.value}))} className="input-field" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location / Room</label>
            <input type="text" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="e.g. Cardio Zone, Studio B" className="input-field" />
          </div>

          {/* Trainer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Assign Trainer</label>
            <select value={form.trainer_id} onChange={e => setForm(p => ({...p, trainer_id: e.target.value}))} className="input-field">
              <option value="">-- Unassigned --</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Class is Active</span>
            <button type="button" onClick={() => setForm(p => ({...p, is_active: !p.is_active}))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-brand-500' : 'bg-gray-300 dark:bg-dark-600'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`}></span>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary text-sm py-2.5">{saving ? 'Saving...' : editing ? 'Update Schedule' : 'Create Class'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Trainers Tab (view + create profile + edit + delete) ── */
function TrainersTab() {
  const [trainers, setTrainers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModal]     = useState(false);
  const [editing, setEditing]     = useState(null);
  const blank = {
    full_name: '', email: '', phone: '',
    specialization: '', bio: '', experience_years: 1,
    certifications: '', image_url: '', instagram: '',
    rating: 4.5, total_clients: 0,
  };
  const [form, setForm]   = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      // Join profiles (role=trainer) with trainer_profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, created_at, trainer_profiles(*)')
        .eq('role', 'trainer')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTrainers(data || []);
    } catch (err) {
      console.error('Trainers load error:', err);
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(blank);
    setModal(true);
  }

  function openEdit(trainer) {
    const tp = trainer.trainer_profiles?.[0] || {};
    setEditing(trainer);
    setForm({
      full_name:        trainer.full_name || '',
      email:            trainer.email || '',
      phone:            trainer.phone || '',
      specialization:   tp.specialization || '',
      bio:              tp.bio || '',
      experience_years: tp.experience_years || 1,
      certifications:   (tp.certifications || []).join(', '),
      image_url:        tp.image_url || '',
      instagram:        tp.instagram || '',
      rating:           tp.rating || 4.5,
      total_clients:    tp.total_clients || 0,
    });
    setModal(true);
  }

  async function save() {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const certs = form.certifications
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (editing) {
        // Update profile info
        const { error: profErr } = await supabase
          .from('profiles')
          .update({ full_name: form.full_name.trim(), phone: form.phone.trim() })
          .eq('id', editing.id);
        if (profErr) throw profErr;

        // Upsert trainer_profile
        const { error: tpErr } = await supabase
          .from('trainer_profiles')
          .upsert({
            profile_id:       editing.id,
            specialization:   form.specialization.trim(),
            bio:              form.bio.trim(),
            experience_years: parseInt(form.experience_years) || 1,
            certifications:   certs,
            image_url:        form.image_url.trim(),
            instagram:        form.instagram.trim(),
            rating:           parseFloat(form.rating) || 4.5,
            total_clients:    parseInt(form.total_clients) || 0,
          }, { onConflict: 'profile_id' });
        if (tpErr) throw tpErr;
        toast.success('Trainer updated!');
      } else {
        // Create Supabase auth user first, then set role
        // Since admin can't create auth users via client SDK,
        // we insert directly into profiles for trainers registered via /register
        toast.error('To add a trainer, ask them to register at /register and select Trainer role. Then their profile will appear here for editing.');
        setModal(false);
        setSaving(false);
        return;
      }

      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
    setSaving(false);
  }

  async function del(trainer) {
    const result = await Swal.fire({
      title: `Delete ${trainer.full_name}?`,
      text: 'This will remove the trainer profile. The account will still exist.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete Profile',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937',
    });
    if (!result.isConfirmed) return;

    // Delete trainer_profile record; profile stays
    const { error } = await supabase
      .from('trainer_profiles')
      .delete()
      .eq('profile_id', trainer.id);
    if (error) toast.error(error.message);
    else { toast.success('Trainer profile deleted'); load(); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{trainers.length} trainer{trainers.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <FiPlus className="w-4 h-4" />Add Trainer Profile
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : trainers.length === 0 ? (
        <div className="card p-12 text-center">
          <FiAward className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No trainers yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Trainers appear here after registering at <span className="text-brand-500">/register</span> with the Trainer role
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map(trainer => {
            const tp = trainer.trainer_profiles?.[0];
            return (
              <div key={trainer.id} className="card p-5 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative shrink-0">
                    {tp?.image_url ? (
                      <img
                        src={tp.image_url}
                        alt={trainer.full_name}
                        loading="lazy"
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold">
                        {trainer.full_name?.[0]?.toUpperCase() || 'T'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{trainer.full_name}</h3>
                    <p className="text-sm text-brand-500 font-medium truncate">{tp?.specialization || 'General Trainer'}</p>
                    <p className="text-xs text-gray-400 truncate">{trainer.email}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {trainer.phone && <p>📞 {trainer.phone}</p>}
                  <p>⏳ {tp?.experience_years || 1} yr{(tp?.experience_years || 1) !== 1 ? 's' : ''} experience</p>
                  <p>👥 {tp?.total_clients || 0} clients</p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{parseFloat(tp?.rating || 4.5).toFixed(1)}</span>
                    <span className="text-gray-400">/ 5.0</span>
                  </div>
                  {tp?.instagram && (
                    <p className="text-brand-500 truncate">📷 @{tp.instagram.replace('@', '')}</p>
                  )}
                </div>

                {/* Bio */}
                {tp?.bio && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2 mb-3">{tp.bio}</p>
                )}

                {/* Certifications */}
                {tp?.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tp.certifications.slice(0, 3).map((cert, i) => (
                      <span key={i} className="px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs rounded-full font-medium">
                        {cert}
                      </span>
                    ))}
                    {tp.certifications.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-dark-700 text-gray-500 text-xs rounded-full">
                        +{tp.certifications.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-dark-700">
                  <button
                    onClick={() => openEdit(trainer)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg font-medium transition-colors"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />Edit
                  </button>
                  <button
                    onClick={() => del(trainer)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editing ? `Edit: ${editing.full_name}` : 'Add Trainer Profile'}
        onClose={() => setModal(false)}
      >
        <div className="space-y-4">
          {!editing && (
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl text-sm text-blue-700 dark:text-blue-400">
              ℹ️ To add a trainer, they must first <strong>register at /register</strong> with the <strong>Trainer role</strong>. Once registered, their card will appear here for you to fill in their profile details.
            </div>
          )}
          {editing && (
            <>
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input type="text" value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))} className="input-field" placeholder="Trainer name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input-field" placeholder="0300-0000000" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                <input type="text" value={form.specialization} onChange={e => setForm(p => ({...p, specialization: e.target.value}))} className="input-field" placeholder="e.g. Strength & Conditioning" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea rows={3} value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} className="input-field resize-none" placeholder="Short bio about this trainer..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Experience (yrs)</label>
                  <input type="number" min="0" max="50" value={form.experience_years} onChange={e => setForm(p => ({...p, experience_years: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Clients</label>
                  <input type="number" min="0" value={form.total_clients} onChange={e => setForm(p => ({...p, total_clients: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Rating (0–5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm(p => ({...p, rating: e.target.value}))} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Certifications <span className="font-normal text-gray-400">(comma-separated)</span></label>
                <input type="text" value={form.certifications} onChange={e => setForm(p => ({...p, certifications: e.target.value}))} className="input-field" placeholder="e.g. ISSA CPT, Nutrition Coach, CrossFit L1" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Profile Photo URL</label>
                <input type="url" value={form.image_url} onChange={e => setForm(p => ({...p, image_url: e.target.value}))} className="input-field" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Instagram Handle</label>
                <input type="text" value={form.instagram} onChange={e => setForm(p => ({...p, instagram: e.target.value}))} className="input-field" placeholder="@handle" />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">Cancel</button>
            {editing && (
              <button onClick={save} disabled={saving} className="flex-1 btn-primary text-sm py-2.5">
                {saving ? 'Saving...' : 'Update Trainer'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}


/* ─── Equipment Tab ────────────────────────────────────────── */
function EquipmentTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const blank = { name:'', type:'Cardio', condition:'Good', quantity:1, location:'Main Hall', purchase_price:'', notes:'' };
  const [form, setForm]       = useState(blank);
  const [saving, setSaving]   = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('equipment').select('*').order('created_at', { ascending: false });
    setItems(data || []); setLoading(false);
  }
  function openAdd()  { setEditing(null); setForm(blank); setModal(true); }
  function openEdit(i){ setEditing(i); setForm({ name:i.name, type:i.type||'Cardio', condition:i.condition||'Good', quantity:i.quantity||1, location:i.location||'Main Hall', purchase_price:i.purchase_price||'', notes:i.notes||'' }); setModal(true); }

  async function save() {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    const payload = { ...form, quantity: parseInt(form.quantity)||1, purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null };
    const { error } = editing
      ? await supabase.from('equipment').update(payload).eq('id', editing.id)
      : await supabase.from('equipment').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? 'Updated!' : 'Added!'); setModal(false); load(); }
    setSaving(false);
  }

  async function del(id) {
    const result = await Swal.fire({ title: 'Delete Equipment?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Delete', background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff', color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937' });
    if (!result.isConfirmed) return;
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  }

  const condColor = { Excellent:'badge-success', Good:'badge-success', Fair:'badge-warning', Poor:'badge-danger', 'Out of Service':'badge-danger' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} items</p>
        <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><FiPlus className="w-4 h-4" />Add Equipment</button>
      </div>
      {loading ? <div className="text-center py-12"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>{['Name','Type','Condition','Qty','Location','Price','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {items.map(i=>(
                  <tr key={i.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                    <td className="px-4 py-3"><p className="font-medium text-gray-900 dark:text-white text-sm">{i.name}</p>{i.notes&&<p className="text-xs text-gray-400">{i.notes}</p>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{i.type}</td>
                    <td className="px-4 py-3"><span className={`badge ${condColor[i.condition]||'badge-warning'}`}>{i.condition}</span></td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{i.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{i.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{i.purchase_price?`PKR ${Number(i.purchase_price).toLocaleString()}`:'—'}</td>
                    <td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>openEdit(i)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"><FiEdit2 className="w-3.5 h-3.5"/></button><button onClick={()=>del(i.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-3.5 h-3.5"/></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length===0&&<p className="text-center text-gray-400 py-12">No equipment yet</p>}
          </div>
        </div>
      )}
      <Modal open={modalOpen} title={editing?'Edit Equipment':'Add Equipment'} onClose={()=>setModal(false)}>
        <div className="space-y-4">
          {[{label:'Name *',key:'name',type:'text',ph:'e.g. Treadmill Pro X200'},{label:'Location',key:'location',type:'text',ph:'e.g. Cardio Zone'},{label:'Purchase Price (PKR)',key:'purchase_price',type:'number',ph:'85000'}].map(f=>(
            <div key={f.key}><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{f.label}</label><input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="input-field"/></div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="input-field">{['Cardio','Free Weights','Machines','Bodyweight','Stretching','Other'].map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Condition</label><select value={form.condition} onChange={e=>setForm(p=>({...p,condition:e.target.value}))} className="input-field">{['Excellent','Good','Fair','Poor','Out of Service'].map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantity</label><input type="number" min="1" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} className="input-field"/></div>
          <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label><textarea rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className="input-field resize-none"/></div>
          <div className="flex gap-3 pt-2">
            <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 font-semibold text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary text-sm py-2.5">{saving?'Saving...':editing?'Update':'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Finance Tab ──────────────────────────────────────────── */
function FinanceTab({ adminId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter]   = useState('all');
  const blank = { type:'income', category:'Membership', amount:'', description:'', date: format(new Date(),'yyyy-MM-dd') };
  const [form, setForm]       = useState(blank);
  const [saving, setSaving]   = useState(false);
  const incCats  = ['Membership','Classes','Personal Training','Merchandise','Other'];
  const expCats  = ['Utilities','Rent','Staff Salaries','Equipment','Maintenance','Supplies','Marketing','Other'];

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('finance_records').select('*').order('date', { ascending: false });
    setRecords(data||[]); setLoading(false);
  }
  function openAdd()  { setEditing(null); setForm(blank); setModal(true); }
  function openEdit(r){ setEditing(r); setForm({ type:r.type, category:r.category, amount:r.amount, description:r.description, date:r.date?format(new Date(r.date),'yyyy-MM-dd'):format(new Date(),'yyyy-MM-dd') }); setModal(true); }

  async function save() {
    if (!form.amount || !form.description.trim()) { toast.error('Amount and description required'); return; }
    setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount), created_by: adminId };
    const { error } = editing
      ? await supabase.from('finance_records').update(payload).eq('id', editing.id)
      : await supabase.from('finance_records').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing?'Updated!':'Added!'); setModal(false); load(); }
    setSaving(false);
  }

  async function del(id) {
    const result = await Swal.fire({ title: 'Delete Record?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Delete', background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff', color: document.documentElement.classList.contains('dark') ? '#fff' : '#1f2937' });
    if (!result.isConfirmed) return;
    const { error } = await supabase.from('finance_records').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  }

  const filtered   = filter === 'all' ? records : records.filter(r => r.type === filter);
  const totalIn    = records.filter(r=>r.type==='income').reduce((s,r)=>s+Number(r.amount||0),0);
  const totalEx    = records.filter(r=>r.type==='expense').reduce((s,r)=>s+Number(r.amount||0),0);
  const net        = totalIn - totalEx;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Total Income', value:`PKR ${totalIn.toLocaleString()}`, color:'text-green-600', bg:'bg-green-50 dark:bg-green-500/10', border:'border-green-200 dark:border-green-500/30'},
          {label:'Total Expenses',value:`PKR ${totalEx.toLocaleString()}`,color:'text-red-600',  bg:'bg-red-50 dark:bg-red-500/10',     border:'border-red-200 dark:border-red-500/30'},
          {label:'Net Balance',  value:`PKR ${net.toLocaleString()}`,     color:net>=0?'text-brand-600':'text-red-600', bg:'bg-brand-50 dark:bg-brand-500/10', border:'border-brand-200 dark:border-brand-500/30'},
        ].map((s,i)=>(
          <div key={i} className={`card p-4 ${s.bg} border ${s.border}`}><p className="text-xs text-gray-500 mb-1">{s.label}</p><p className={`text-lg font-bold ${s.color}`}>{s.value}</p></div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">{['all','income','expense'].map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter===f?'bg-brand-500 text-white':'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-600 hover:border-brand-500'}`}>{f}</button>)}</div>
        <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><FiPlus className="w-4 h-4"/>Add Record</button>
      </div>
      {loading ? <div className="text-center py-12"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"/></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>{['Date','Type','Category','Description','Amount','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {filtered.map(r=>(
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                    <td className="px-4 py-3 text-sm text-gray-500">{r.date?format(new Date(r.date),'MMM d, yyyy'):'—'}</td>
                    <td className="px-4 py-3"><span className={`badge ${r.type==='income'?'badge-success':'badge-danger'}`}>{r.type}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{r.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.description}</td>
                    <td className={`px-4 py-3 text-sm font-bold ${r.type==='income'?'text-green-600':'text-red-500'}`}>{r.type==='income'?'+':'-'}PKR {Number(r.amount).toLocaleString()}</td>
                    <td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>openEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"><FiEdit2 className="w-3.5 h-3.5"/></button><button onClick={()=>del(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-3.5 h-3.5"/></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0&&<p className="text-center text-gray-400 py-12">No {filter!=='all'?filter:''} records</p>}
          </div>
        </div>
      )}
      <Modal open={modalOpen} title={editing?'Edit Finance Record':'Add Finance Record'} onClose={()=>setModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['income','expense'].map(t=><button key={t} type="button" onClick={()=>setForm(p=>({...p,type:t,category:t==='income'?'Membership':'Utilities'}))} className={`py-2.5 rounded-xl font-semibold text-sm capitalize transition-colors border-2 ${form.type===t?(t==='income'?'bg-green-500 text-white border-green-500':'bg-red-500 text-white border-red-500'):'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300'}`}>{t==='income'?'↑ Income':'↓ Expense'}</button>)}
            </div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="input-field">{(form.type==='income'?incCats:expCats).map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount (PKR) *</label><input type="number" min="0" placeholder="5000" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} className="input-field"/></div>
          <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description *</label><input type="text" placeholder="e.g. Monthly batch payment" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="input-field"/></div>
          <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="input-field"/></div>
          <div className="flex gap-3 pt-2">
            <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 font-semibold text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 btn-primary text-sm py-2.5">{saving?'Saving...':editing?'Update':'Add'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Main Admin Dashboard ─────────────────────────────────── */
export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]   = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading]       = useState(true);

  const [stats, setStats]             = useState({ totalMembers:0, activeMembers:0, totalRevenue:0, pendingPayments:0, leftMembers:0 });
  const [members, setMembers]         = useState([]);
  const [payments, setPayments]       = useState([]);
  const [pendingPayments, setPending] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [planData, setPlanData]       = useState([]);
  const [bookings, setBookings]       = useState([]);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchMembers(), fetchPaymentsData(), fetchBookings()]);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    const [{ data: allMembers }, { data: memberships }, { data: allPayments }, { data: pendingPay }] = await Promise.all([
      supabase.from('profiles').select('id').eq('role','member'),
      supabase.from('memberships').select('member_id, plans(name)').eq('status','active'),
      supabase.from('payments').select('amount, status, created_at'),
      supabase.from('payments').select('id').eq('status','pending'),
    ]);
    const total   = allMembers?.length || 0;
    const active  = memberships?.length || 0;
    const revenue = allPayments?.filter(p=>p.status==='verified').reduce((s,p)=>s+(p.amount||0),0) || 0;
    const pending = pendingPay?.length || 0;
    setStats({ totalMembers:total, activeMembers:active, totalRevenue:revenue, pendingPayments:pending, leftMembers:total-active });
    const last7 = Array.from({length:7},(_,i)=>{
      const d = subDays(new Date(), 6-i);
      const ds = format(d,'yyyy-MM-dd');
      return { day:format(d,'MMM d'), revenue: allPayments?.filter(p=>p.status==='verified'&&p.created_at?.startsWith(ds)).reduce((s,p)=>s+(p.amount||0),0)||0 };
    });
    setRevenueData(last7);
    const planCounts={};
    memberships?.forEach(m=>{ const n=m.plans?.name||'Unknown'; planCounts[n]=(planCounts[n]||0)+1; }); // member_id correct
    setPlanData(Object.entries(planCounts).map(([name,value])=>({name,value})));
  }

  async function fetchMembers() {
    const { data } = await supabase.from('profiles').select('*, memberships(status,end_date,plans(name))').eq('role','member').order('created_at',{ascending:false});
    setMembers(data||[]);
  }

  async function fetchPaymentsData() {
    const [{ data:all },{ data:pend }] = await Promise.all([
      supabase.from('payments').select('*, profiles(full_name,email), plans(name)').order('created_at',{ascending:false}),
      supabase.from('payments').select('*, profiles(full_name,email), plans(name)').eq('status','pending').order('created_at',{ascending:false}),
    ]);
    setPayments(all||[]); setPending(pend||[]);
  }

  async function fetchBookings() {
    const { data } = await supabase.from('class_bookings')
      .select('*, member:profiles!class_bookings_member_id_fkey(full_name,email), classes(name,schedule), trainer:profiles!class_bookings_trainer_id_fkey(full_name)')
      .order('booked_at',{ascending:false});
    setBookings(data||[]);
  }

  async function verifyPayment(paymentId, userId, planId, amount) {
    const start=new Date(); const end=new Date(); end.setMonth(end.getMonth()+1);
    await supabase.from('payments').update({status:'verified'}).eq('id',paymentId);
    await supabase.from('memberships').upsert({member_id:userId,plan_id:planId,status:'active',start_date:start.toISOString().split('T')[0],end_date:end.toISOString().split('T')[0]},{onConflict:'member_id'});
    toast.success('Payment verified & membership activated!'); fetchAll();
  }

  async function rejectPayment(paymentId) {
    await supabase.from('payments').update({status:'failed'}).eq('id',paymentId);
    toast.error('Payment rejected'); fetchAll();
  }

  async function handleSignOut() {
    try { await signOut(); } catch (_) { /* ignore */ }
    navigate('/');
  }

  const COLORS = ['#FF6B00','#ff9240','#2563eb','#22c55e'];

  const tabs = [
    { id:'overview',  label:'Overview',               icon:FiActivity  },
    { id:'members',   label:'Members',                icon:FiUsers     },
    { id:'payments',  label:'Payments',               icon:FiDollarSign},
    { id:'pending',   label:`Pending (${stats.pendingPayments})`, icon:FiClock },
    { id:'classes',   label:'Classes',                icon:FiCalendar  },
    { id:'bookings',  label:'Bookings',               icon:FiUserCheck },
    { id:'trainers',  label:'Trainers',               icon:FiAward     },
    { id:'equipment', label:'Equipment',              icon:FiTool      },
    { id:'finance',   label:'Finance',                icon:FiTrendingUp},
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 transform transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-lg">A</span></div>
            <div><p className="text-white font-bold text-sm">Admin Panel</p><p className="text-gray-400 text-xs">{profile?.full_name}</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>{setActiveTab(t.id);setSidebarOpen(false);}}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab===t.id?'bg-brand-500 text-white':'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
              <t.icon className="w-4 h-4"/>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-700 space-y-2">
          <button onClick={()=>navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white text-sm font-medium transition-colors">
            <FiHome className="w-4 h-4"/>Back to Home
          </button>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-colors">
            <FiLogOut className="w-4 h-4"/>Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen&&<div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700" onClick={()=>setSidebarOpen(true)}><FiMenu/></button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {activeTab==='overview'?'Dashboard Overview':tabs.find(t=>t.id===activeTab)?.label}
            </h1>
          </div>
          <button onClick={fetchAll} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors"><FiRefreshCw className="w-4 h-4"/>Refresh</button>
        </header>

        <main className="flex-1 p-6 overflow-auto">

          {/* OVERVIEW */}
          {activeTab==='overview'&&(
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {label:'Total Members',  value:stats.totalMembers,                          icon:FiUsers,    color:'text-blue-500', bg:'bg-blue-500/10'},
                  {label:'Active Members', value:stats.activeMembers,                         icon:FiUserCheck,color:'text-green-500',bg:'bg-green-500/10'},
                  {label:'Total Revenue',  value:`PKR ${stats.totalRevenue.toLocaleString()}`, icon:FiDollarSign,color:'text-brand-500',bg:'bg-brand-500/10'},
                  {label:'Pending Pay',    value:stats.pendingPayments,                       icon:FiClock,    color:'text-yellow-500',bg:'bg-yellow-500/10'},
                  {label:'Left Members',   value:stats.leftMembers,                           icon:FiUserX,   color:'text-red-500',  bg:'bg-red-500/10'},
                ].map((s,i)=>(
                  <div key={i} className="card p-4">
                    <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`}/></div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Revenue (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueData}>
                      <defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/><stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3}/>
                      <XAxis dataKey="day" tick={{fontSize:11,fill:'#9ca3af'}}/><YAxis tick={{fontSize:11,fill:'#9ca3af'}}/>
                      <Tooltip contentStyle={{background:'#1e293b',border:'none',borderRadius:8,color:'#fff'}}/>
                      <Area type="monotone" dataKey="revenue" stroke="#FF6B00" fill="url(#rv)" strokeWidth={2} isAnimationActive={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Plan Distribution</h3>
                  {planData.length>0?(
                    <><ResponsiveContainer width="100%" height={160}><PieChart><Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" isAnimationActive={false}>{planData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip contentStyle={{background:'#1e293b',border:'none',borderRadius:8,color:'#fff'}}/></PieChart></ResponsiveContainer>
                    <div className="space-y-2 mt-2">{planData.map((p,i)=><div key={i} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{background:COLORS[i%COLORS.length]}}></div><span className="text-gray-600 dark:text-gray-400">{p.name}</span></div><span className="font-semibold text-gray-900 dark:text-white">{p.value}</span></div>)}</div></>
                  ):<p className="text-gray-400 text-sm text-center py-8">No active memberships yet</p>}
                </div>
              </div>
              {pendingPayments.length>0&&(
                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiClock className="text-yellow-500"/>Pending ({pendingPayments.length})</h3>
                  <div className="space-y-3">
                    {pendingPayments.slice(0,5).map(p=>(
                      <div key={p.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border border-yellow-200 dark:border-yellow-500/20">
                        <div><p className="font-medium text-gray-900 dark:text-white text-sm">{p.profiles?.full_name}</p><p className="text-xs text-gray-500">TXN: {p.transaction_id} · {p.plans?.name} · PKR {p.amount}</p></div>
                        <div className="flex gap-2">
                          <button onClick={()=>verifyPayment(p.id,p.member_id, p.plan_id, p.amount)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><FiCheckCircle className="w-4 h-4"/></button>
                          <button onClick={()=>rejectPayment(p.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><FiXCircle className="w-4 h-4"/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MEMBERS */}
          {activeTab==='members'&&(
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-dark-700"><h3 className="font-bold text-gray-900 dark:text-white">All Members ({members.length})</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-700"><tr>{['Name','Email','Plan','Status','Joined','Expiry'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                    {members.map(m=>{const ms=m.memberships?.[0];const isActive=ms?.status==='active';const isExpired=ms?.end_date&&new Date(ms.end_date)<new Date();return(
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{m.full_name?.[0]?.toUpperCase()||'M'}</div><span className="text-sm font-medium text-gray-900 dark:text-white">{m.full_name}</span></div></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{m.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ms?.plans?.name||'—'}</td>
                        <td className="px-4 py-3"><span className={`badge ${isActive&&!isExpired?'badge-success':isExpired?'badge-danger':'badge-warning'}`}>{isActive&&!isExpired?'Active':isExpired?'Expired':'No Plan'}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{m.created_at?format(new Date(m.created_at),'MMM d, yyyy'):'—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{ms?.end_date?format(new Date(ms.end_date),'MMM d, yyyy'):'—'}</td>
                      </tr>);
                    })}
                  </tbody>
                </table>
                {members.length===0&&<p className="text-center text-gray-400 py-12">No members yet</p>}
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {activeTab==='payments'&&(
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">All Payments ({payments.length})</h3>
                <span className="text-sm font-semibold text-brand-500">Verified: PKR {payments.filter(p=>p.status==='verified').reduce((s,p)=>s+(p.amount||0),0).toLocaleString()}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-700"><tr>{['Member','Plan','Amount','Transaction ID','Status','Date','Action'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                    {payments.map(p=>(
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.profiles?.full_name||'—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{p.plans?.name||'—'}</td>
                        <td className="px-4 py-3 text-sm font-semibold">PKR {p.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.transaction_id}</td>
                        <td className="px-4 py-3"><span className={`badge ${p.status==='verified'?'badge-success':p.status==='failed'?'badge-danger':p.status==='verified'?'badge-success':'badge-warning'}`}>{p.status}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{p.created_at?format(new Date(p.created_at),'MMM d, yyyy'):'—'}</td>
                        <td className="px-4 py-3">{p.status==='pending'&&<div className="flex gap-1"><button onClick={()=>verifyPayment(p.id,p.member_id, p.plan_id, p.amount)} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"><FiCheckCircle className="w-3.5 h-3.5"/></button><button onClick={()=>rejectPayment(p.id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"><FiXCircle className="w-3.5 h-3.5"/></button></div>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length===0&&<p className="text-center text-gray-400 py-12">No payments yet</p>}
              </div>
            </div>
          )}

          {/* PENDING */}
          {activeTab==='pending'&&(
            <div className="space-y-4">
              {pendingPayments.length===0?(
                <div className="card p-12 text-center"><FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4"/><p className="text-gray-500">All caught up! No pending payments.</p></div>
              ):pendingPayments.map(p=>(
                <div key={p.id} className="card p-6 border-l-4 border-yellow-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2"><div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold">{p.profiles?.full_name?.[0]?.toUpperCase()||'M'}</div><div><p className="font-bold text-gray-900 dark:text-white">{p.profiles?.full_name}</p><p className="text-sm text-gray-500">{p.profiles?.email}</p></div></div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">{[{label:'Plan',value:p.plans?.name},{label:'Amount',value:`PKR ${p.amount?.toLocaleString()}`},{label:'Transaction ID',value:p.transaction_id},{label:'Submitted',value:p.created_at?format(new Date(p.created_at),'MMM d, h:mm a'):'—'}].map((item,i)=><div key={i} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">{item.label}</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p></div>)}</div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={()=>verifyPayment(p.id,p.member_id, p.plan_id, p.amount)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm"><FiCheckCircle className="w-4 h-4"/>Verify</button>
                      <button onClick={()=>rejectPayment(p.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm"><FiXCircle className="w-4 h-4"/>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CLASSES — full CRUD component */}
          {activeTab==='classes'&&<ClassesTab/>}

          {/* BOOKINGS */}
          {activeTab==='bookings'&&(
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-dark-700"><h3 className="font-bold text-gray-900 dark:text-white">All Bookings ({bookings.length})</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-700"><tr>{['Member','Class','Trainer','Schedule','Status','Booked On'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                    {bookings.map(b=>(
                      <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{b.member?.full_name||'—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{b.classes?.name||'—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{b.trainer?.full_name||<span className="italic text-gray-400">Not selected</span>}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{b.classes?.schedule?format(new Date(b.classes.schedule),'MMM d, h:mm a'):'—'}</td>
                        <td className="px-4 py-3"><span className={`badge ${b.status==='confirmed'?'badge-success':'badge-warning'}`}>{b.status}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{b.booked_at?format(new Date(b.booked_at),'MMM d, yyyy'):'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length===0&&<p className="text-center text-gray-400 py-12">No bookings yet</p>}
              </div>
            </div>
          )}

          {activeTab==='trainers'&&<TrainersTab/>}
          {activeTab==='equipment'&&<EquipmentTab/>}
          {activeTab==='finance'&&<FinanceTab adminId={profile?.id}/>}

        </main>
      </div>
    </div>
  );
}
