import { useEffect, useRef } from 'react';

interface WakeLockProps {
  isActive: boolean;
  onWakeLockError?: (error: Error) => void;
}

export function WakeLock({ isActive, onWakeLockError }: WakeLockProps) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let mounted = true;

    const requestWakeLock = async () => {
      try {
        if (!('wakeLock' in navigator)) {
          console.warn('Wake Lock API is not supported in this browser');
          return;
        }

        if (isActive && !wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active');
        }
      } catch (err) {
        console.error('Error requesting wake lock:', err);
        if (onWakeLockError && err instanceof Error) {
          onWakeLockError(err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock released');
        } catch (err) {
          console.error('Error releasing wake lock:', err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    if (isActive) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      releaseWakeLock();
    }

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isActive, onWakeLockError]);

  return null;
} 