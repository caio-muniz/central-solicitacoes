import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FilePlus2, Search, X } from 'lucide-react';
import { listRequests } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import useMeta from '../hooks/useMeta.js';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback.jsx';
import { PriorityBadge, StatusBadge } from '../components/Badge.jsx';
import { formatDate } from '../utils/format.js';

const INITIAL_FILTERS = { search: '', status: '', priority: '', sort: 'recent' };

export default function RequestList() {
  const { statuses, priorities } = useMeta();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { status, priority, sort } = filters;
  const { data, loading, error, reload } = useAsync(
    () => listRequests({ status, priority, sort, search: debouncedSearch }),
    [status, priority, sort, debouncedSearch]
  );

  const update = (field) => (event) => setFilters((previous) => ({ ...previous, [field]: event.target.value }));
  const hasFilters = filters.search || filters.status || filters.priority;
  const newRequestButton = (
    <Link to="/solicitacoes/nova" className="btn btn--primary"><FilePlus2 size={18} /> Nova solicitação</Link>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Solicitações</h2>
          <p className="muted">Consulte, filtre e acompanhe todas as solicitações registradas.</p>
        </div>
        {newRequestButton}
      </div>

      <section className="card">
        <div className="filters">
          <label className="search">
            <Search size={16} />
            <input type="search" placeholder="Buscar por título ou descrição" value={filters.search} onChange={update('search')} />
          </label>
          <select aria-label="Filtrar por status" value={filters.status} onChange={update('status')}>
            <option value="">Todos os status</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Filtrar por prioridade" value={filters.priority} onChange={update('priority')}>
            <option value="">Todas as prioridades</option>
            {priorities.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Ordenar por data" value={filters.sort} onChange={update('sort')}>
            <option value="recent">Mais recentes primeiro</option>
            <option value="oldest">Mais antigas primeiro</option>
          </select>
          {hasFilters && (
            <button type="button" className="btn btn--ghost" onClick={() => setFilters(INITIAL_FILTERS)}>
              <X size={16} /> Limpar
            </button>
          )}
        </div>

        {loading && <Loading label="Carregando solicitações..." />}
        {error && <ErrorMessage message={error.message} onRetry={reload} />}
        {data && data.data.length === 0 && (
          <EmptyState
            title={hasFilters ? 'Nenhuma solicitação encontrada' : 'Nenhuma solicitação cadastrada'}
            text={hasFilters ? 'Ajuste a busca ou os filtros.' : 'Cadastre a primeira solicitação para começar.'}
            action={!hasFilters && newRequestButton}
          />
        )}
        {data && data.data.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Título</th><th>Categoria</th><th>Prioridade</th><th>Status</th><th>Criada em</th><th><span className="sr-only">Ações</span></th></tr>
              </thead>
              <tbody>
                {data.data.map((item) => (
                  <tr key={item.id}>
                    <td className="table__title">{item.title}</td>
                    <td>{item.category}</td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td><Link to={`/solicitacoes/${item.id}`} className="btn btn--secondary btn--sm"><Eye size={15} /> Ver detalhes</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted table__count">{data.total} {data.total === 1 ? 'solicitação' : 'solicitações'}</p>
          </div>
        )}
      </section>
    </>
  );
}
