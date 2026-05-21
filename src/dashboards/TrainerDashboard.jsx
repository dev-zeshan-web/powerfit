import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiActivity, FiLogOut, FiMenu, FiClock, FiMapPin, FiHome, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';

export default function TrainerDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState('schedule');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [myClasses, setMyClasses]     = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => { if (profile?.id) fetchAll(); }, [profile]);

  async function fetchAll() {
    setLoading(true);
    try {
      await Promise.all([fetchMyClasses(), fetchBookings()]);
    } catch (err) {
      console.error('Trainer fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyClasses() {
    // Use trainer_id FK — correct column (not trainer_name which doesn't exist)
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('trainer_id', profile.id)   // ← correct
      .order('schedule', { ascending: true });  // ← correct column
    if (error) console.error('fetchMyClasses error:', error);
    setMyClasses(data || []);
  }

  async function fetchBookings() {
    // Use correct column names: schedule (not schedule_time), no trainer_name
    const { data, error } = await supabase
      .from('class_bookings')
      .select(`
        *,
        member:profiles!class_bookings_member_id_fkey(full_name, email),
        selected_trainer:profiles!class_bookings_trainer_id_fkey(full_name),
        classes(name, schedule, location, level, capacity)
      `)
      .order('booked_at', { ascending: false });
    if (error) console.error('fetchBookings error:', error);
    setAllBookings(data || []);
  }

  const myClassIds  = myClasses.map(c => c.id);
  const myBookings  = allBookings.filter(b => myClassIds.includes(b.class_id));
  const bookingsForClass = selectedClass
    ? myBookings.filter(b => b.class_id === selectedClass.id)
    : [];

  const tabs = [
    { id: 'schedule', label: 'My Schedule',    icon: FiCalendar },
    { id: 'members',  label: 'Booked Members', icon: FiUsers    },
    { id: 'stats',    label: 'Stats',           icon: FiActivity },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading...</p>
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
              {profile?.full_name?.[0]?.toUpperCase() || 'T'}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{profile?.full_name}</p>
              <p className="text-brand-400 text-xs font-medium">Trainer</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{tabs.find(t => t.id === activeTab)?.label}</h1>
          </div>
          <p className="text-sm text-gray-500 hidden sm:block">Trainer Dashboard</p>
        </header>

        <main className="flex-1 p-6 overflow-auto">

          {/* MY SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {myClasses.length === 0 ? (
                <div className="card p-12 text-center">
                  <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No classes assigned yet</p>
                  <p className="text-gray-400 text-sm mt-1">Contact admin to assign classes to you</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myClasses.map(cls => {
                    const classBookings = myBookings.filter(b => b.class_id === cls.id);
                    const isPast = cls.schedule && new Date(cls.schedule) < new Date();
                    const pct = Math.min(100, Math.round((classBookings.length / (cls.capacity || 20)) * 100));
                    return (
                      <div key={cls.id} onClick={() => { setSelectedClass(cls); setActiveTab('members'); }}
                        className={`card p-5 cursor-pointer hover:shadow-lg transition-all hover:border-brand-500/50 ${isPast ? 'opacity-70' : ''}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{cls.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{cls.category}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`badge ${cls.level === 'Beginner' ? 'badge-success' : cls.level === 'Intermediate' ? 'badge-warning' : 'badge-danger'}`}>{cls.level}</span>
                            {isPast && <span className="badge bg-gray-100 dark:bg-dark-600 text-gray-500 text-xs">Past</span>}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <FiClock className="w-4 h-4 text-brand-500 shrink-0" />
                            <span>{cls.schedule ? format(new Date(cls.schedule), 'EEE, MMM d · h:mm a') : 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4 text-brand-500 shrink-0" />
                            <span>{cls.location || 'Main Hall'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiUsers className="w-4 h-4 text-brand-500 shrink-0" />
                            <span>{classBookings.length}/{cls.capacity || 20} booked</span>
                          </div>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">{pct}% full</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* BOOKED MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedClass(null)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedClass ? 'bg-brand-500 text-white' : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-600 hover:border-brand-500'}`}>
                  All Classes ({myBookings.length})
                </button>
                {myClasses.map(cls => {
                  const count = myBookings.filter(b => b.class_id === cls.id).length;
                  return (
                    <button key={cls.id} onClick={() => setSelectedClass(cls)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedClass?.id === cls.id ? 'bg-brand-500 text-white' : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-600 hover:border-brand-500'}`}>
                      {cls.name} ({count})
                    </button>
                  );
                })}
              </div>

              {selectedClass && (
                <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-xl">
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedClass.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedClass.schedule ? format(new Date(selectedClass.schedule), 'EEEE, MMMM d at h:mm a') : 'TBD'}
                    {selectedClass.location ? ` • ${selectedClass.location}` : ''}
                  </p>
                </div>
              )}

              <div className="card overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-dark-700">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {selectedClass ? `Members in ${selectedClass.name}` : 'All Booked Members'} ({(selectedClass ? bookingsForClass : myBookings).length})
                  </h3>
                </div>
                {(selectedClass ? bookingsForClass : myBookings).length === 0 ? (
                  <p className="text-center text-gray-400 py-12">No members booked {selectedClass ? 'for this class' : 'yet'}</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-dark-700">
                    {(selectedClass ? bookingsForClass : myBookings).map(b => (
                      <div key={b.id} className="px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {b.member?.full_name?.[0]?.toUpperCase() || 'M'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{b.member?.full_name || '—'}</p>
                            <p className="text-xs text-gray-500">{b.member?.email || ''}</p>
                            {/* Show selected trainer if different from this trainer */}
                            {b.selected_trainer?.full_name && (
                              <p className="text-xs text-brand-500 mt-0.5 flex items-center gap-1">
                                <FiUser className="w-3 h-3" />
                                Trainer: {b.selected_trainer.full_name}
                              </p>
                            )}
                            {b.notes && <p className="text-xs text-gray-400 mt-0.5 italic">📝 {b.notes}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          {!selectedClass && (
                            <p className="text-xs text-gray-500 mb-1 font-medium">{b.classes?.name}</p>
                          )}
                          <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span>
                          <p className="text-xs text-gray-400 mt-1">
                            {b.booked_at ? format(new Date(b.booked_at), 'MMM d') : '—'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'My Classes',     value: myClasses.length,  icon: FiCalendar, color: 'text-brand-500', bg: 'bg-brand-500/10' },
                  { label: 'Total Bookings', value: myBookings.length, icon: FiUsers,    color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Upcoming',       value: myClasses.filter(c => c.schedule && new Date(c.schedule) > new Date()).length, icon: FiClock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((s, i) => (
                  <div key={i} className="card p-6 text-center">
                    <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Classes Performance</h3>
                <div className="space-y-3">
                  {myClasses.map(cls => {
                    const count = myBookings.filter(b => b.class_id === cls.id).length;
                    const max = cls.capacity || 20;
                    const pct = Math.min(100, Math.round((count / max) * 100));
                    return (
                      <div key={cls.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{cls.name}</span>
                          <span className="text-gray-500">{count}/{max} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-brand-500' : 'bg-yellow-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {myClasses.length === 0 && <p className="text-gray-400 text-sm">No classes assigned yet</p>}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
