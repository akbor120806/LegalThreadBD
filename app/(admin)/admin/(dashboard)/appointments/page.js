'use client';

import { useEffect, useState } from 'react';
import DownloadAppointmentPdfButton from '@/components/DownloadAppointmentPdfButton';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/appointments');
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this appointment permanently?')) return;
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    load();
  }

  const statusClass = {
    pending: 'tag-amber',
    confirmed: 'tag-green',
    completed: 'tag',
    cancelled: 'tag-red',
  };

  const filtered = filter ? appointments.filter((a) => a.status === filter) : appointments;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Appointments</h1>
          <p style={{ margin: 0 }}>Confirm, complete, or cancel client bookings.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No appointments found.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Lawyer</th>
                <th>Date / Time</th>
                <th>Mode</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.client_name}</b></td>
                  <td style={{ fontSize: 12.5 }}>
                    {a.client_email}
                    <br />
                    {a.client_phone}
                  </td>
                  <td>
                    {a.lawyer_name}
                    <br />
                    <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>{a.expertise}</span>
                  </td>
                  <td>
                    {new Date(a.appointment_date).toLocaleDateString()}
                    <br />
                    {a.appointment_time}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{a.mode}</td>
                  <td>
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      className={`tag ${statusClass[a.status] || ''}`}
                      style={{ border: 'none', fontWeight: 700 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <DownloadAppointmentPdfButton appointment={a} className="btn btn-outline btn-sm" />
                      <button onClick={() => handleDelete(a.id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
