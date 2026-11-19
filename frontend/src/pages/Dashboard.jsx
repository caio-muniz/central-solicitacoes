import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, FilePlus2, Inbox, Layers } from 'lucide-react';
import { getDashboard } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback.jsx';
import { PriorityBadge, StatusBadge } from '../components/Badge.jsx';
import { formatDate } from '../utils/format.js';

const STATUS_BAR_COLOR = { Aberta: 'var(--blue)', 'Em andamento': 'var(--amber)', 'Concluída': 'var(--green)' };

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(getDashboard, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} onRetry={reload} />;

  const { total, byStatus, recent } = data;
  const cards = [
    { label: 'Total de solicitações', value: total, icon: Layers, tone: 'navy' },
    { label: 'Abertas', value: byStatus['Aberta'], icon: Inbox, tone: 'blue' },
    { label: 'Em andamento', value: byStatus['Em andamento'], icon: Clock3, tone: 'amber' },
    { label: 'Concluídas', value: byStatus['Concluída'], icon: CheckCircle2, tone: 'green' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Visão geral</h2>
          <p className="muted">Acompanhe o andamento das solicitações internas da organização.</p>
        </div>
        <Link to="/solicitacoes/nova" className="btn btn--primary">
          <FilePlus2 size={18} /> Nova solicitação
        </Link>
      </div>

      <section className="stat-grid">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div className="card stat" key={label}>
            <span className={`stat__icon stat__icon--${tone}`}><Icon size={20} /></span>
            <div>
              <span className="stat__value">{value}</span>
              <span className="muted">{label}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="two-col">
        <section className="card">
          <h3>Solicitações recentes</h3>
          {recent.length === 0 ? (
            <EmptyState title="Nenhuma solicitação ainda" text="Cadastre a primeira para começar." />
          ) : (
            <ul className="recent">
              {recent.map((item) => (
                <li key={item.id}>
                  <Link to={`/solicitacoes/${item.id}`} className="recent__link">
                    <span className="recent__title">{item.title}</span>
                    <span className="muted">{item.category} · {formatDate(item.createdAt)}</span>
                  </Link>
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h3>Distribuição por status</h3>
          <div className="distribution">
            {Object.entries(byStatus).map(([status, count]) => {
              const percent = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="distribution__row">
                    <span>{status}</span>
                    <span className="muted">{count} ({percent}%)</span>
                  </div>
                  <div className="bar"><div className="bar__fill" style={{ width: `${percent}%`, background: STATUS_BAR_COLOR[status] }} /></div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
