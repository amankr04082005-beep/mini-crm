import { useState } from 'react';
import { STATUSES } from '../constants';
import { api } from '../api';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function LeadRow({ lead, onStatusChange, onEdit, onDelete, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await api.addNote(lead._id, noteText.trim());
      setNoteText('');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="lead-row">
      <div className="lead-main" onClick={() => setOpen((o) => !o)}>
        <div>
          <h3>{lead.name}</h3>
          <p className="lead-meta">
            {lead.email} {lead.phone && `· ${lead.phone}`} · {lead.source} · added {formatDate(lead.createdAt)}
          </p>
        </div>
        <div className="lead-actions" onClick={(e) => e.stopPropagation()}>
          <select
            className="status-select"
            data-status={lead.status}
            value={lead.status}
            aria-label={`Status for ${lead.name}`}
            onChange={(e) => onStatusChange(lead, e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="text-button" onClick={() => onEdit(lead)}>
            Edit
          </button>
          <button className="text-button danger" onClick={() => onDelete(lead)}>
            Delete
          </button>
        </div>
      </div>

      {open && (
        <div className="lead-notes">
          {lead.notes.length === 0 ? (
            <p className="muted">No notes yet.</p>
          ) : (
            <ul>
              {lead.notes.map((n) => (
                <li key={n._id}>
                  <span>{n.text}</span>
                  <span className="note-date">{formatDate(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <form className="note-form" onSubmit={handleAddNote}>
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a follow-up note"
            />
            <button className="btn btn-ghost" type="submit" disabled={saving}>
              {saving ? 'Saving' : 'Add note'}
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
