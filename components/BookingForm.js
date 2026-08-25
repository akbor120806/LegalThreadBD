'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingForm({ lawyerId }) {
  const [form, setForm] = useState({ mode: 'online', appointment_date: '', appointment_time: '', notes: '' });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lawyer_id: lawyerId }),
      });
      const data = await res.json();
      if (!data.ok) {
        if (res.status === 401) {
          router.push('/login?next=/lawyers/' + lawyerId);
          return;
        }
        setStatus('error');
        setMessage(data.message);
        return;
      }
      setStatus('sent');
      setMessage('Your appointment request has been sent! Check your dashboard for status updates.');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  if (status === 'sent') {
    return <div className="alert alert-success">{message}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {status === 'error' && <div className="alert alert-error">{message}</div>}
      <div className="form-group">
        <label>Consultation Type</label>
        <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
          <option value="online">Online</option>
          <option value="offline">Offline (in person)</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            required
            value={form.appointment_date}
            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            required
            value={form.appointment_time}
            onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Notes (optional)</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Briefly describe your case..."
        />
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={status === 'sending'}>
        {status === 'sending' ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}
