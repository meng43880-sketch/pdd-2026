import { useEffect, useState } from 'react';
import { useProgressStore } from '../store/progressStore';

export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useProgressStore.persist?.hasHydrated?.() ?? false);
  useEffect(() => {
    if (!useProgressStore.persist) return;
    const unsub = useProgressStore.persist.onFinishHydration(() => setHydrated(true));
    if (useProgressStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
