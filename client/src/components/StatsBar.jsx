import { STATUSES } from '../constants';

export default function StatsBar({ stats, active, onSelect }) {
  const total = stats?.total ?? 0;
  const toggle = (status) => onSelect(active === status ? '' : status);

  return (
    <section className="stats" aria-label="Leads by status">
      <div className="stats-head">
        <h2>
          <span className="stats-number">{total}</span> {total === 1 ? 'lead' : 'leads'}
        </h2>
        {active && (
          <button className="text-button" onClick={() => onSelect('')}>
            Show all
          </button>
        )}
      </div>

      <ul className="stats-cards">
        {STATUSES.map((s) => (
          <li key={s}>
            <button
              className={`stat-card stat-${s.toLowerCase()} ${active === s ? 'is-active' : ''}`}
              aria-pressed={active === s}
              onClick={() => toggle(s)}
            >
              <span className="stat-count">{stats?.[s] ?? 0}</span>
              <span className="stat-label">{s}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
