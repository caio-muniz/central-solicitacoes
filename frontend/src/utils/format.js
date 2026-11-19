const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const formatDate = (iso) => dateFormatter.format(new Date(iso));
export const formatDateTime = (iso) => dateTimeFormatter.format(new Date(iso));
