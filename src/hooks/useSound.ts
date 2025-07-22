import { useState, useEffect, useCallback, useRef } from "react";

type PlayOptions = {
  volume?: number;
  loop?: boolean;
};

const useSound = (src: string, options?: PlayOptions) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false); // To track if a sound is currently playing from this instance

  useEffect(() => {
    // Only create Audio object on the client side
    if (typeof window !== "undefined") {
      const newAudio = new Audio(src);
      if (options?.volume !== undefined) {
        newAudio.volume = options.volume;
      }
      if (options?.loop !== undefined) {
        newAudio.loop = options.loop;
      }
      setAudio(newAudio);

      // Clean up on component unmount
      return () => {
        if (newAudio) {
          newAudio.pause();
          newAudio.currentTime = 0;
          isPlayingRef.current = false;
        }
      };
    }
    return () => {}; // No-op cleanup for server-side
  }, [src, options?.volume, options?.loop]);

  const play = useCallback(() => {
    if (audio && !isPlayingRef.current) {
      audio.currentTime = 0; // Reset to start
      audio
        .play()
        .then(() => {
          isPlayingRef.current = true;
        })
        .catch((error) => {
          console.error("Error playing sound:", error);
        });
    } else if (audio && isPlayingRef.current) {
      // If sound is already playing, stop and restart (or do nothing depending on desired behavior)
      audio.pause();
      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          isPlayingRef.current = true;
        })
        .catch((error) => {
          console.error("Error playing sound:", error);
        });
    }
  }, [audio]);

  const stop = useCallback(() => {
    if (audio && isPlayingRef.current) {
      audio.pause();
      audio.currentTime = 0;
      isPlayingRef.current = false;
    }
  }, [audio]);

  const toggle = useCallback(() => {
    if (audio) {
      if (isPlayingRef.current) {
        stop();
      } else {
        play();
      }
    }
  }, [audio, play, stop]);

  // Update isPlayingRef when the audio ends
  useEffect(() => {
    if (audio) {
      const handleEnded = () => {
        isPlayingRef.current = false;
      };
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [audio]);

  return { play, stop, toggle, isPlaying: isPlayingRef.current };
};

export default useSound;
