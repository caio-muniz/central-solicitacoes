import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  loadingLabel = 'Aguarde...',
  loading = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [loading, onCancel]);

  return (
    <div className="modal-backdrop" onClick={() => !loading && onCancel()}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__icon"><AlertTriangle size={22} /></div>
        <h3 id="confirm-title">{title}</h3>
        <p id="confirm-message" className="muted">{message}</p>
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={loading} autoFocus>
            Cancelar
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
