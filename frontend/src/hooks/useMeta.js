import { getMeta } from '../services/api.js';
import useAsync from './useAsync.js';

export default function useMeta() {
  const { data } = useAsync(getMeta, []);
  return data ?? { categories: [], priorities: [], statuses: [] };
}
