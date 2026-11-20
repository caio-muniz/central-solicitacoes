import { useNavigate } from 'react-router-dom';
import { createRequest } from '../services/api.js';
import RequestForm from '../components/RequestForm.jsx';

export default function NewRequest() {
  const navigate = useNavigate();

  async function handleSubmit(form) {
    const created = await createRequest(form);
    navigate(`/solicitacoes/${created.id}`, { state: { created: true } });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Nova solicitação</h2>
          <p className="muted">Descreva a demanda. Ela será criada com o status Aberta.</p>
        </div>
      </div>

      <RequestForm
        submitLabel="Cadastrar solicitação"
        submittingLabel="Cadastrando..."
        onSubmit={handleSubmit}
        onCancel={() => navigate('/solicitacoes')}
      />
    </>
  );
}
