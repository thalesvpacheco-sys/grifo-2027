'use client';

import { useEffect } from 'react';
import { track, type GrifoEvent } from '@/lib/analytics';

export function TrackView({ event, params }: { event: GrifoEvent; params: Record<string, string> }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    track(event, { ...JSON.parse(key), page_path: location.pathname });
  }, [event, key]);
  return null;
}
