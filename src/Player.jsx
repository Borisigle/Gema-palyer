import { useState, useRef, useEffect } from "react";

export default function Player({ song, onBack }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const changeSpeed = (value) => {
    setSpeed(value);
    audioRef.current.playbackRate = value;
  };

  return (
    <div className="player-card">
      <div className="track-display">{song.name}</div>

      <audio ref={audioRef} src={song.src} />

      <div className="controls">
        <button className="control-btn" onClick={onBack}>⏮</button>
        <button className="control-btn" onClick={togglePlay}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          className="control-btn"
          onClick={() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
          }}
        >
          ⏹
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="speed-controls">
        <button
          className={`speed-btn ${speed === 0.5 ? "active" : ""}`}
          onClick={() => changeSpeed(0.5)}
        >
          🐌 0.5x
        </button>
        <button
          className={`speed-btn ${speed === 0.75 ? "active" : ""}`}
          onClick={() => changeSpeed(0.75)}
        >
          🌸 0.75x
        </button>
        <button
          className={`speed-btn ${speed === 1 ? "active" : ""}`}
          onClick={() => changeSpeed(1)}
        >
          ⭐ 1x
        </button>
      </div>
    </div>
  );
}
