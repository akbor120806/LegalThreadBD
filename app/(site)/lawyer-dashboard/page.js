'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LawyerDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, rescheduleRequested: 0 });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rescheduleFor, setRescheduleFor] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ proposed_date: '', proposed_time: '', lawyer_note: '' });
  const router = useRouter();

  async function loadAll() {
    const [p, c, a] = await Promise.all([
      fetch('/api/lawyer/profile').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/lawyer/appointments').then((r) => r.json()),
    ]);
    if (p.ok) { setProfile(p.lawyer); setForm(p.lawyer); }
    setCategories(c.categories || []);
    if (a.ok) { setAppointments(a.appointments); setStats(a.stats); }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/lawyer/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(false);
    loadAll();
  }

  async function act(id, action, extra = {}) {
    await fetch(`/api/lawyer/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    setRescheduleFor(null);
    setRescheduleForm({ proposed_date: '', proposed_time: '', lawyer_note: '' });
    loadAll();
  }

  if (!profile) {
    return <div className="section"><div className="container empty-state">Loading your dashboard...</div></div>;
  }

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ color: 'var(--navy)', margin: '0 0 4px' }}>Lawyer Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Welcome back, {profile.name}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-primary btn-sm">Logout</button>
        </div>

        <div className="stat-grid">
          <div className="card stat-card">
            <div className="label">Total Requests</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="card stat-card">
            <div className="label">Cases Accepted</div>
            <div className="value" style={{ color: 'var(--success)' }}>{stats.accepted}</div>
          </div>
          <div className="card stat-card">
            <div className="label">Cases Rejected</div>
            <div className="value" style={{ color: 'var(--danger)' }}>{stats.rejected}</div>
          </div>
          <div className="card stat-card">
            <div className="label">Awaiting Your Response</div>
            <div className="value" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
          </div>
        </div>

        {/* Profile / Bio */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: 'var(--navy)' }}>My Profile</h3>
            {!editing && <button className="btn btn-outline btn-sm" style={{ color: 'var(--navy)', borderColor: 'var(--border)' }} onClick={() => { setForm(profile); setEditing(true); }}>Edit Profile</button>}
          </div>

          {!editing ? (
            <>
              <div style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>{profile.expertise} · {profile.category_name}</div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{profile.bio || 'No bio yet — click Edit Profile to add one.'}</p>
              <div className="grid grid-2">
                <div>
                  <div className="lawyer-meta">📍 {profile.address}, {profile.district}</div>
                  <div className="lawyer-meta">🎓 {profile.experience_years}+ years experience</div>
                </div>
                <div>
                  <div className="lawyer-meta">🪪 Bar Council ID: {profile.bar_council_id}</div>
                  <div className="lawyer-meta">💰 Fee: ৳{Number(profile.consultation_fee).toFixed(0)}</div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={saveProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label>Practice Area</label>
                  <select value={form.category_id || ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Expertise / Title</label>
                  <input value={form.expertise || ''} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input type="number" value={form.experience_years || ''} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Consultation Fee (৳)</label>
                  <input type="number" value={form.consultation_fee || ''} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>District</label>
                  <input value={form.district || ''} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Bar Council ID</label>
                  <input value={form.bar_council_id || ''} onChange={(e) => setForm({ ...form, bar_council_id: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Office Address</label>
                <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea rows={3} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn btn-outline" style={{ color: 'var(--navy)', borderColor: 'var(--border)' }} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Appointment requests */}
        <div className="card">
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: 16 }}>Appointment Requests</h3>
          </div>

          {appointments.length ? (
            <div>
              {appointments.map((a) => (
                <div key={a.id} style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{a.client_name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.client_phone} · {a.client_email}</div>
                      <div style={{ fontSize: 13, marginTop: 6 }}>
                        📅 {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time} · <span style={{ textTransform: 'capitalize' }}>{a.mode}</span>
                      </div>
                      {a.notes && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Note: {a.notes}</div>}
                      {a.status === 'reschedule_requested' && (
                        <div style={{ fontSize: 13, color: 'var(--warning)', marginTop: 6 }}>
                          You proposed: {new Date(a.proposed_date).toLocaleDateString()} at {a.proposed_time} — waiting for client response
                        </div>
                      )}
                      {a.status === 'cancelled' && a.cancelled_by === 'client' && (
                        <div style={{ fontSize: 13, color: 'var(--danger)', marginTop: 6 }}>Cancelled by client</div>
                      )}
                    </div>
                    <span className={`status-pill status-${a.status === 'reschedule_requested' ? 'pending' : a.status}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>

                  {a.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => act(a.id, 'accept')}>Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => act(a.id, 'reject')}>Reject</button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--navy)', borderColor: 'var(--border)' }}
                        onClick={() => setRescheduleFor(rescheduleFor === a.id ? null : a.id)}
                      >
                        Propose New Time
                      </button>
                    </div>
                  )}

                  {a.status === 'confirmed' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-navy btn-sm" onClick={() => act(a.id, 'complete')}>Mark as Completed</button>
                    </div>
                  )}

                  {rescheduleFor === a.id && (
                    <div className="card card-pad" style={{ marginTop: 12, background: 'var(--bg)' }}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>New Date</label>
                          <input
                            type="date"
                            value={rescheduleForm.proposed_date}
                            onChange={(e) => setRescheduleForm({ ...rescheduleForm, proposed_date: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>New Time</label>
                          <input
                            type="time"
                            value={rescheduleForm.proposed_time}
                            onChange={(e) => setRescheduleForm({ ...rescheduleForm, proposed_time: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Note to client (optional)</label>
                        <input
                          value={rescheduleForm.lawyer_note}
                          onChange={(e) => setRescheduleForm({ ...rescheduleForm, lawyer_note: e.target.value })}
                          placeholder="e.g. I have a court hearing that day"
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => act(a.id, 'reschedule', rescheduleForm)}
                        disabled={!rescheduleForm.proposed_date || !rescheduleForm.proposed_time}
                      >
                        Send Proposal
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No appointment requests yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
