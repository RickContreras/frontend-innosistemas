import { useEffect, useCallback, useRef } from 'react';

interface RealtimeMessage {
  type: 'comment' | 'reply' | 'update';
  data: any;
  timestamp: string;
}

export const useRealtime = (channelName: string, onMessage: (message: RealtimeMessage) => void) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    // Try to use BroadcastChannel for real-time updates
    if (typeof BroadcastChannel !== 'undefined') {
      channelRef.current = new BroadcastChannel(channelName);
      
      channelRef.current.onmessage = (event) => {
        onMessage(event.data);
      };
    } else {
      // Fallback to polling localStorage
      pollingIntervalRef.current = setInterval(() => {
        const updates = localStorage.getItem(`${channelName}_updates`);
        if (updates) {
          const parsed = JSON.parse(updates);
          if (parsed.timestamp > lastCheckRef.current) {
            onMessage(parsed);
            lastCheckRef.current = parsed.timestamp;
          }
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [channelName, onMessage]);

  const broadcast = useCallback((message: RealtimeMessage) => {
    if (channelRef.current) {
      channelRef.current.postMessage(message);
    } else {
      // Fallback: write to localStorage
      localStorage.setItem(`${channelName}_updates`, JSON.stringify(message));
    }
  }, [channelName]);

  return { broadcast };
};
