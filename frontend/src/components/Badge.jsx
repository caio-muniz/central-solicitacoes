const STATUS_TONE = { Aberta: 'blue', 'Em andamento': 'amber', 'Concluída': 'green' };
const PRIORITY_TONE = { Baixa: 'gray', 'Média': 'amber', Alta: 'red' };

export function StatusBadge({ status }) {
  return <span className={`badge badge--${STATUS_TONE[status] ?? 'gray'}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge--${PRIORITY_TONE[priority] ?? 'gray'}`}>{priority}</span>;
}
