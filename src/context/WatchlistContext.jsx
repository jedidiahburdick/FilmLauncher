import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fl_watchlist') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fl_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const isInWatchlist = (id) => watchlist.some((item) => item.id === id);

  const toggleWatchlist = (item) => {
    setWatchlist((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, { id: item.id, title: item.title, poster: item.poster, type: item.type, year: item.year, duration: item.duration, genre: item.genre }]
    );
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, isInWatchlist, toggleWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
