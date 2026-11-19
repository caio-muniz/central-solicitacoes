import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../services/api.js';
import useMeta from '../hooks/useMeta.js';

const INITIAL_FORM = { title: '', description: '', category: '', priority: '' };
const REQUIRED_MESSAGES = {
  title: 'Informe o título.',
  description: 'Informe a descrição.',
  category: 'Selecione a categoria.',
  priority: 'Selecione a prioridade.',
};

function findEmptyFields(form) {
  return Object.fromEntries(
    Object.keys(REQUIRED_MESSAGES)
      .filter((field) => !form[field].trim())
      .map((field) => [field, REQUIRED_MESSAGES[field]])
  );
}

export default function NewRequest() {
  const navigate = useNavigate();
  const { categories, priorities } = useMeta();
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    const emptyFields = findEmptyFields(form);
    setFieldErrors(emptyFields);
    if (Object.keys(emptyFields).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createRequest(form);
      navigate(`/solicitacoes/${created.id}`, { state: { created: true } });
    } catch (error) {
      setFieldErrors(error.fields);
      setFormError(error.message);
      setSubmitting(false);
    }
  }

  const field = (name, label, control) => (
    <div className={`field ${fieldErrors[name] ? 'field--invalid' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {control}
      {fieldErrors[name] && <span className="field__error">{fieldErrors[name]}</span>}
    </div>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Nova solicitação</h2>
          <p className="muted">Descreva a demanda. Ela será criada com o status Aberta.</p>
        </div>
      </div>

      <form className="card form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="alert alert--error" role="alert">{formError}</div>}
        {field('title', 'Título', <input id="title" value={form.title} onChange={update('title')} maxLength={120} placeholder="Ex.: Notebook não liga" />)}
        {field('description', 'Descrição', <textarea id="description" rows={5} value={form.description} onChange={update('description')} maxLength={2000} placeholder="Explique o que precisa ser feito" />)}
        <div className="form__row">
          {field('category', 'Categoria', (
            <select id="category" value={form.category} onChange={update('category')}>
              <option value="">Selecione</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          ))}
          {field('priority', 'Prioridade', (
            <select id="priority" value={form.priority} onChange={update('priority')}>
              <option value="">Selecione</option>
              {priorities.map((item) => <option key={item}>{item}</option>)}
            </select>
          ))}
        </div>
        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={() => navigate('/solicitacoes')}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Cadastrando...' : 'Cadastrar solicitação'}</button>
        </div>
      </form>
    </>
  );
}
