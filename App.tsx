import React, { useState, useEffect, useCallback } from 'react';
import { View, Film } from './types';
import CameraView from './components/CameraView';
import DarkroomView from './components/DarkroomView';
import GalleryView from './components/GalleryView';
import { CameraIcon, BeakerIcon, ImageIcon } from './components/Icons';
import { getFilms, saveFilms } from './services/storage';
import { processFilm } from './services/photoProcessor';
import { TOTAL_FILM_HOLDERS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.CAMERA);
  const [shotsLeft, setShotsLeft] = useState(TOTAL_FILM_HOLDERS);
  const [films, setFilms] = useState<Film[]>([]);

  useEffect(() => {
    setFilms(getFilms());
  }, []);

  useEffect(() => {
    saveFilms(films);
    const undevelopedFilmsCount = films.filter(f => !f.isDeveloped).length;
    setShotsLeft(TOTAL_FILM_HOLDERS - undevelopedFilmsCount);
  }, [films]);
  
  const addFilm = useCallback((film: Film) => {
    setFilms(prevFilms => [...prevFilms, film]);
  }, []);

  const updateFilm = useCallback((filmId: string, updates: Partial<Film>) => {
    setFilms(prevFilms =>
      prevFilms.map(f => (f.id === filmId ? { ...f, ...updates } : f))
    );
  }, []);
  
  const batchUpdateFilms = useCallback((processedFilms: Film[]) => {
    setFilms(currentFilms => {
        const processedMap = new Map(processedFilms.map(f => [f.id, f]));
        return currentFilms.map(f => processedMap.get(f.id) || f);
    });
  }, []);


  const renderView = () => {
    switch (view) {
      case View.DARKROOM:
        return <DarkroomView films={films} batchUpdateFilms={batchUpdateFilms} processFilm={processFilm} />;
      case View.GALLERY:
        return <GalleryView films={films} updateFilm={updateFilm} />;
      case View.CAMERA:
      default:
        return <CameraView shotsLeft={shotsLeft} addFilm={addFilm} />;
    }
  };

  const NavItem: React.FC<{
    targetView: View;
    icon: React.ReactNode;
    label: string;
  }> = ({ targetView, icon, label }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        view === targetView ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-screen bg-black flex flex-col font-sans">
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
      <nav className="flex justify-around items-center h-16 bg-zinc-900 border-t border-zinc-800">
        <NavItem targetView={View.CAMERA} icon={<CameraIcon />} label="Camera" />
        <NavItem targetView={View.DARKROOM} icon={<BeakerIcon />} label="Bathroom" />
        <NavItem targetView={View.GALLERY} icon={<ImageIcon />} label="Negatives" />
      </nav>
    </div>
  );
};

export default App;
