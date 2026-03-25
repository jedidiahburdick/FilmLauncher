import React, { createContext, useContext, useState, useEffect } from 'react';
import { allContent } from '../data/content';

const LibraryContext = createContext(null);

/* ── Seed mock data so tabs aren't empty on first load ────────────────────── */
function buildMockRentals() {
  const sendProof = allContent.find((c) => c.id === 28);
  if (!sendProof) return [];
  return [{
    id: sendProof.id,
    title: sendProof.title,
    poster: sendProof.poster,
    year: sendProof.year,
    genre: sendProof.genre,
    duration: sendProof.duration,
    rentalPrice: sendProof.rentalPrice ?? 3.99,
    rentedAt: Date.now() - 2 * 60 * 60 * 1000,          // rented 2h ago
    expiresAt: Date.now() + 46 * 60 * 60 * 1000,         // expires in 46h
  }];
}

function buildMockHistory() {
  const ids = [2, 4];  // Dune Part Two, Saltburn
  return ids.map((id, idx) => {
    const item = allContent.find((c) => c.id === id);
    if (!item) return null;
    return {
      id: item.id,
      title: item.title,
      poster: item.poster,
      year: item.year,
      genre: item.genre,
      duration: item.duration,
      watchedAt: Date.now() - (idx === 0 ? 3 : 8) * 24 * 60 * 60 * 1000,
    };
  }).filter(Boolean);
}

export function LibraryProvider({ children }) {
  const [rentals, setRentals] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('fl_rentals'));
      return stored ?? buildMockRentals();
    } catch { return buildMockRentals(); }
  });

  const [history, setHistory] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('fl_history'));
      return stored ?? buildMockHistory();
    } catch { return buildMockHistory(); }
  });

  useEffect(() => {
    localStorage.setItem('fl_rentals', JSON.stringify(rentals));
  }, [rentals]);

  useEffect(() => {
    localStorage.setItem('fl_history', JSON.stringify(history));
  }, [history]);

  const isRented = (id) =>
    rentals.some((r) => r.id === id && r.expiresAt > Date.now());

  const getRental = (id) =>
    rentals.find((r) => r.id === id && r.expiresAt > Date.now()) ?? null;

  const addRental = (item) => {
    const entry = {
      id: item.id,
      title: item.title,
      poster: item.poster,
      year: item.year,
      genre: item.genre,
      duration: item.duration,
      rentalPrice: item.rentalPrice ?? 3.99,
      rentedAt: Date.now(),
      expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    };
    setRentals((prev) => [entry, ...prev.filter((r) => r.id !== item.id)]);
  };

  const addToHistory = (item) => {
    const entry = {
      id: item.id,
      title: item.title,
      poster: item.poster,
      year: item.year,
      genre: item.genre,
      duration: item.duration,
      watchedAt: Date.now(),
    };
    setHistory((prev) => [entry, ...prev.filter((h) => h.id !== item.id)]);
  };

  return (
    <LibraryContext.Provider value={{ rentals, history, isRented, getRental, addRental, addToHistory }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);
