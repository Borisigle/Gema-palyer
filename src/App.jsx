import React, { useState, useRef, useEffect } from "react";

const folders = {
  GOLDENS: ["MATRIX.mp3"],
  ADULT: ["WATER.mp3"],
};

function App() {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  // Cuando cambia la canción: resetear estados, aplicar speed y (opcional) intentar play
  useEffect(() => {
    const audio = audioRef.current;
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    if (!audio) return;

    // forzar recarga del src si se actualizó
    audio.load();
    audio.playbackRate = speed;

    // Intentar autoplay (seleccionar canción es un gesto de usuario, suele permitir play)
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      // en navegadores que no retornan promesas
      // no asumimos que se reproduce automáticamente
    }
  }, [currentSong]); // se ejecuta cada vez que seleccionás otra canción

  // Registrar listeners cuando existe el elemento audio (y cuando cambie la canción)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const dur = audio.duration || 0;
      const cur = audio.currentTime || 0;
      setCurrentTime(cur);
      setProgress(dur ? (cur / dur) * 100 : 0);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    // cleanup
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [currentSong]);

  // Aplicar velocidad cuando cambia `speed`
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const playPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    }
  };

  const changeSpeed = (value) => {
    setSpeed(value);
    const audio = audioRef.current;
    if (audio) audio.playbackRate = value;
  };

  const goBack = () => {
    setCurrentSong(null);
    setCurrentFolder(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  // Seek - compatible click (mouse) y touch (mobile)
  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();

    // obtener clientX robusto (mouse / touch)
    let clientX = 0;
    if (e.nativeEvent && e.nativeEvent.touches && e.nativeEvent.touches.length) {
      clientX = e.nativeEvent.touches[0].clientX;
    } else if (typeof e.clientX === "number") {
      clientX = e.clientX;
    } else if (e.nativeEvent && typeof e.nativeEvent.clientX === "number") {
      clientX = e.nativeEvent.clientX;
    } else {
      return;
    }

    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = pct * audio.duration;
      // actualizar estado local inmediatamente para respuesta UI
      setProgress(pct * 100);
      setCurrentTime(pct * audio.duration);
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {!currentFolder && !currentSong && (
          <div className="folder-list">
            {Object.keys(folders).map((folder) => (
              <div
                key={folder}
                className="folder"
                onClick={() => setCurrentFolder(folder)}
              >
                📁 {folder}
              </div>
            ))}
          </div>
        )}

        {currentFolder && !currentSong && (
          <div className="folder">
            <button className="back-btn" onClick={() => setCurrentFolder(null)}>
              ⬅ Volver
            </button>
            <h3>{currentFolder}</h3>
            {folders[currentFolder].map((song) => (
              <div
                key={song}
                className="song"
                onClick={() => setCurrentSong(song)}
              >
                🎵 {song}
              </div>
            ))}
          </div>
        )}

        {currentSong && (
          <div className="player-card">
            <button className="back-btn" onClick={goBack}>
              ⬅ Volver
            </button>

            <div className="track-display">{currentSong}</div>

            <div className="controls">
              <button className="control-btn" onClick={playPause}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                className="control-btn"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setProgress(0);
                    setCurrentTime(0);
                  }
                }}
              >
                ⏮
              </button>
            </div>

            <div
              className="progress-bar"
              onClick={handleSeek}
              onTouchStart={handleSeek}
              role="presentation"
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <div className="speed-controls">
              {[0.5, 0.75, 1.0].map((s) => (
                <button
                  key={s}
                  className={`speed-btn ${speed === s ? "active" : ""}`}
                  onClick={() => changeSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* audio estático en DOM; su src depende de currentFolder/currentSong */}
            <audio
              ref={audioRef}
              src={currentFolder && currentSong ? `/${currentFolder}/${currentSong}` : ""}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
