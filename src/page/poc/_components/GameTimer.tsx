import { useEffect, useRef } from 'react';
import { showNotification } from './Notifications';
import useStore from './store';
import { GameMilestone } from './ProgressBar';

// Constants for game timer
export const GAME_SESSION_TIME = 30 * 60; // 30 minutes in seconds
export const WARNING_TIME = 5 * 60; // 5 minutes warning

export interface GameTimerProps {
  gameDialog: {
    isOpen: boolean;
    milestone: GameMilestone;
    timeRemaining: number;
  } | null;
  onGameEnd: () => void;
}

export function GameTimer({ gameDialog, onGameEnd }: GameTimerProps) {
  const { updateMilestones, setGameDialog } = useStore();
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (gameDialog?.timeRemaining === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      showNotification(
        "Time's Up!",
        { body: "Your gaming break has ended. Time to get back to work!" }
      );
      updateMilestones(gameDialog.milestone.percentage);
      setGameDialog(null);
      onGameEnd();
      return;
    }

    if (gameDialog) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        setGameDialog(prev => {
          if (!prev) return null;
          const newTime = prev.timeRemaining - 1;
          
          if (newTime === WARNING_TIME) {
            showNotification(
              "5 Minutes Remaining",
              { body: "Your gaming break will end in 5 minutes!" }
            );
          }
          
          return {
            ...prev,
            timeRemaining: newTime
          };
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameDialog?.timeRemaining]);

  return null;
} 