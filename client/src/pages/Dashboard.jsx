import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import LeadForm from '../components/LeadForm';
import LeadRow from '../components/LeadRow';
import StatsBar from '../components/StatsBar';

export default function Dashboard() {
  const { admin, logout } = useAuth();

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    try {
      const [leadList, summary] = await Promise.all([
        api.getLeads({ status: statusFilter, search: debouncedSearch }),
        api.getStats(),
      ]);
      setLeads(leadList);
      setStats(summary);
      setError('');
    } catch (err) {
      if (err.status === 401) return logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, logout]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingLead(null);
    setFormOpen(true);
  };
  const openEdit = (lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingLead(null);
  };

  const handleSave = async (data) => {
    if (editingLead) await api.updateLead(editingLead._id, data);
    else await api.createLead(data);
    closeForm();
    await load();
  };

  const handleStatusChange = async (lead, status) => {
    try {
      await api.updateLead(lead._id, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Delete lead "${lead.name}"?`)) return;
    try {
      await api.deleteLead(lead._id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = Boolean(statusFilter || debouncedSearch);

  return (
    <div className="app">
      <header className="topbar">
        <p className="brand">Mini CRM</p>
        <div className="topbar-user">
          <span>{admin?.name}</span>
          <button className="text-button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="content">
        <StatsBar stats={stats} active={statusFilter} onSelect={setStatusFilter} />

        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search by name or email"
            aria-label="Search leads"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openAdd}>
            Add lead
          </button>
        </div>

        {formOpen && (
          <LeadForm key={editingLead?._id || 'new'} lead={editingLead} onSave={handleSave} onCancel={closeForm} />
        )}

        {error && <p className="error" role="alert">{error}</p>}

        {loading ? (
          <p className="muted">Loading leads</p>
        ) : leads.length === 0 ? (
          <div className="empty">
            <p>{filtered ? 'No leads match this filter.' : 'No leads yet.'}</p>
            {!filtered && (
              <button className="btn btn-primary" onClick={openAdd}>
                Add your first lead
              </button>
            )}
          </div>
        ) : (
          <ul className="lead-list">
            {leads.map((lead) => (
              <LeadRow
                key={lead._id}
                lead={lead}
                onStatusChange={handleStatusChange}
                onEdit={openEdit}
                onDelete={handleDelete}
                onRefresh={load}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
