import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getRequest, updateRequest } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { ErrorMessage, Loading } from '../components/Feedback.jsx';
import RequestForm from '../components/RequestForm.jsx';

export default function EditRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: request, loading, error, reload } = useAsync(() => getRequest(id), [id]);

  const backLink = (
    <Link to={`/solicitacoes/${id}`} className="btn btn--secondary"><ArrowLeft size={16} /> Voltar para a solicitação</Link>
  );

  if (loading && !request) return <Loading />;
  if (error) return <><ErrorMessage message={error.message} onRetry={reload} />{backLink}</>;

  async function handleSubmit(form) {
    await updateRequest(id, form);
    navigate(`/solicitacoes/${id}`, { state: { updated: true } });
  }

  const { title, description, category, priority } = request;

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Editar solicitação</h2>
          <p className="muted">Altere título, descrição, categoria ou prioridade. O status não é modificado aqui.</p>
        </div>
      </div>

      <RequestForm
        initialValues={{ title, description, category, priority }}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/solicitacoes/${id}`)}
      />
    </>
  );
}
