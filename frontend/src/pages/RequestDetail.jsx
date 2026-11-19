import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { advanceStatus, getHistory, getRequest } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { ErrorMessage, Loading } from '../components/Feedback.jsx';
import { PriorityBadge, StatusBadge } from '../components/Badge.jsx';
import { formatDateTime } from '../utils/format.js';

const loadDetail = (id) => Promise.all([getRequest(id), getHistory(id)]).then(([request, history]) => ({ request, history }));

export default function RequestDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { data, loading, error, reload } = useAsync(() => loadDetail(id), [id]);
  const [advancing, setAdvancing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState(location.state?.created ? 'Solicitação cadastrada com sucesso.' : '');

  async function handleAdvance() {
    setAdvancing(true);
    setActionError('');
    try {
      const updated = await advanceStatus(id, data.request.nextStatus);
      setNotice(`Status atualizado para "${updated.status}".`);
      reload();
    } catch (err) {
      setNotice('');
      setActionError(err.message);
    } finally {
      setAdvancing(false);
    }
  }

  const backLink = (
    <Link to="/solicitacoes" className="btn btn--secondary"><ArrowLeft size={16} /> Voltar para solicitações</Link>
  );

  if (loading && !data) return <Loading />;
  if (error) return <><ErrorMessage message={error.message} onRetry={reload} />{backLink}</>;

  const { request, history } = data;

  return (
    <>
      {notice && <div className="alert alert--success" role="status"><CheckCircle2 size={18} /> {notice}</div>}
      {actionError && <div className="alert alert--error" role="alert">{actionError}</div>}

      <div className="two-col two-col--detail">
        <section className="card">
          <div className="detail__badges"><StatusBadge status={request.status} /><PriorityBadge priority={request.priority} /></div>
          <h2 className="detail__title">{request.title}</h2>
          <p className="detail__description">{request.description}</p>
          <dl className="meta">
            <div><dt>Categoria</dt><dd>{request.category}</dd></div>
            <div><dt>Criada em</dt><dd>{formatDateTime(request.createdAt)}</dd></div>
            <div><dt>Última atualização</dt><dd>{formatDateTime(request.updatedAt)}</dd></div>
          </dl>
          <div className="form__actions">
            {backLink}
            {request.nextStatus && (
              <button type="button" className="btn btn--primary" onClick={handleAdvance} disabled={advancing}>
                {advancing ? 'Atualizando...' : `Avançar para ${request.nextStatus}`} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </section>

        <section className="card">
          <h3>Histórico de alterações</h3>
          {history.length === 0 ? (
            <p className="muted">Nenhuma mudança de status registrada ainda.</p>
          ) : (
            <ol className="timeline">
              {history.map((entry) => (
                <li key={entry.id}>
                  <span>{entry.previousStatus} → <strong>{entry.newStatus}</strong></span>
                  <span className="muted">{formatDateTime(entry.changedAt)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
