import { useState } from 'react';
import { SOURCES, STATUSES } from '../constants';

export default function LeadForm({ lead, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || 'Website',
    status: lead?.status || 'New',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h2>{lead ? 'Edit lead' : 'Add a lead'}</h2>

      <div className="form-grid">
        <label className="field">
          Name
          <input value={form.name} onChange={update('name')} required autoFocus />
        </label>
        <label className="field">
          Email
          <input type="email" value={form.email} onChange={update('email')} required />
        </label>
        <label className="field">
          Phone
          <input value={form.phone} onChange={update('phone')} />
        </label>
        <label className="field">
          Source
          <select value={form.source} onChange={update('source')}>
            {SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Status
          <select value={form.status} onChange={update('status')}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving' : lead ? 'Save changes' : 'Add lead'}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
