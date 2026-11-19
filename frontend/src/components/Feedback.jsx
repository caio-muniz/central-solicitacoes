import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

export function Loading({ label = 'Carregando...' }) {
  return (
    <div className="feedback" role="status">
      <Loader2 className="spin" size={22} />
      <p>{label}</p>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="feedback feedback--error" role="alert">
      <AlertCircle size={22} />
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="feedback">
      <Inbox size={26} />
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
