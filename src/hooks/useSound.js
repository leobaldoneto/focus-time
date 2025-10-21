import { useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { settingsAtom } from '../atoms/settingsAtoms';

export const useSound = () => {
  const settings = useAtomValue(settingsAtom);
  const soundsRef = useRef({});

  useEffect(() => {
    // Preload sounds
    soundsRef.current = {
      click: new Audio('/sounds/click.mp3'),
      interrupt: new Audio('/sounds/interrupt.mp3'),
      finishRest: new Audio('/sounds/finish_rest.mp3'),
      finishFocus: new Audio('/sounds/finish_focus.mp3'),
      goalReached: new Audio('/sounds/goal-reached.mp3'),
    };

    // Set volume for all sounds
    Object.values(soundsRef.current).forEach(sound => {
      sound.volume = 0.5;
    });
  }, []);

  const playSound = (soundName) => {
    if (!settings.enableSounds) return;

    const sound = soundsRef.current[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
      });
    }
  };

  const playGoalReachedSequence = async () => {
    if (!settings.enableSounds) return;

    try {
      // Play goal-reached.mp3 first
      const goalSound = soundsRef.current.goalReached;
      if (goalSound) {
        goalSound.currentTime = 0;
        await goalSound.play();

        // Wait for it to finish, then play finish_focus.mp3
        goalSound.onended = () => {
          const finishSound = soundsRef.current.finishFocus;
          if (finishSound) {
            finishSound.currentTime = 0;
            finishSound.play().catch(() => {});
          }
        };
      }
    } catch (error) {
      // Ignore errors
    }
  };

  return { playSound, playGoalReachedSequence };
};
