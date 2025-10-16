export const genreColours = {
  music: { background: "#e3f2fd", text: "#1565c0", border: "#bbdefb" },
  performance: { background: "#f3e5f5", text: "#7b1fa2", border: "#e1bee7" },
  talk: { background: "#e8f5e8", text: "#2e7d32", border: "#c8e6c9" },
  exhibition: { background: "#fff3e0", text: "#ef6c00", border: "#ffcc80" },
  workshop: { background: "#e0f2f1", text: "#00695c", border: "#b2dfdb" },
  social: { background: "#fce4ec", text: "#c2185b", border: "#f8bbd9" },
  other: { background: "#f5f5f5", text: "#424242", border: "#e0e0e0" },
  ticketmaster: {
    background: "#614dd1ff",
    text: "#f8f2e9ff",
    border: "#ffecb3",
  },
};

export const getGenreColour = (genre) => {
  return genreColours[genre] || genreColours.other;
};

export const getGenreColourClass = (genre) => {
  return `genre-${genre}`;
};
