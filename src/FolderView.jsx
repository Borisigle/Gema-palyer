export default function FolderView({ onSelectSong }) {
  const folders = {
    GOLDENS: [{ name: "MATRIX", src: "/GOLDENS/MATRIX.mp3" }],
    ADULT: [{ name: "WATER", src: "/ADULT/WATER.mp3" }],
  };

  return (
    <div>
      <h1 style={{ color: "white", textAlign: "center", marginBottom: "20px" }}>
        📂 My Music
      </h1>
      <div className="folder-list">
        {Object.keys(folders).map((folder) => (
          <div key={folder} className="folder">
            <h2>{folder}</h2>
            <div className="song-list">
              {folders[folder].map((song) => (
                <div
                  key={song.name}
                  className="song"
                  onClick={() => onSelectSong(song)}
                >
                  🎵 {song.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
