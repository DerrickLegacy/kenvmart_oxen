/**
 * useApi — generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(fetcher, deps);
 *
 *   fetcher — a function that returns a Promise (usually from api.js)
 *   deps    — dependency array (like useEffect deps). Change them to re-fetch.
 *
 * The hook aborts the in-flight request cleanly when the component unmounts
 * or when deps change before the previous call resolves, preventing
 * state updates on unmounted components.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(fetcher, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const cancelRef = useRef(false);

  const run = useCallback(async () => {
    cancelRef.current = false;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (!cancelRef.current) setData(result);
    } catch (err) {
      if (!cancelRef.current) setError(err.message ?? 'Something went wrong.');
    } finally {
      if (!cancelRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => { cancelRef.current = true; };
  }, [run]);

  return { data, loading, error, refetch: run };
}
