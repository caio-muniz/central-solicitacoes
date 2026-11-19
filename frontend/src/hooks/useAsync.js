import { useCallback, useEffect, useState } from 'react';

export default function useAsync(asyncFn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const run = useCallback(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    asyncFn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));
    return () => {
      cancelled = true;
    };
    
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, reload: run };
}
