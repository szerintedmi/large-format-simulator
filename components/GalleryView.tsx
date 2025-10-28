
import React, { useState, useEffect, useMemo } from 'react';
import { Film, PhotoError } from '../types';
import { DRY_WAIT_MS, NEGATIVE_FRAME_B64 } from '../constants';

// A map for user-friendly error messages
const errorDescriptions: Record<string, string> = {
  [PhotoError.BLANK_WHITE]: 'Blank Frame (White)',
  [PhotoError.BLANK_BLACK]: 'Blank Frame (Black)',
  [PhotoError.DOUBLE_EXPOSURE]: 'Double Exposure',
  [PhotoError.OUT_OF_FOCUS]: 'Out of Focus',
  [PhotoError.UNDER_EXPOSED]: 'Underexposed',
  [PhotoError.OVER_EXPOSED]: 'Overexposed',
  [PhotoError.SCRATCHES]: 'Scratched Negative',
  [PhotoError.LIGHT_LEAK]: 'Light Leak',
  [PhotoError.MOTION_BLUR]: 'Motion Blur',
  [PhotoError.FINGERPRINT]: 'Fingerprint Mark',
};


interface GalleryViewProps {
  films: Film[];
  updateFilm: (filmId: string, updates: Partial<Film>) => void;
}

const FilmStrip: React.FC<{ film: Film; onSelect: () => void; }> = ({ film, onSelect }) => {
    const [isDry, setIsDry] = useState(film.isDry);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (film.isDry) {
            setIsDry(true);
            return;
        }

        const checkTime = () => {
            const timeSinceDevelop = Date.now() - (film.developStartTime ?? 0);
            const remaining = DRY_WAIT_MS - timeSinceDevelop;

            if (remaining <= 0) {
                setIsDry(true);
                setTimeLeft('');
                // The parent component will eventually update the film prop
            } else {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours > 0 ? `${hours}h ` : ''}${minutes}m left`);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [film.isDry, film.developStartTime]);

    return (
        <div 
            className="relative aspect-[5/4] w-full cursor-pointer group bg-zinc-800 bg-cover bg-center"
            style={{ backgroundImage: `url(${NEGATIVE_FRAME_B64})` }}
            onClick={onSelect}
        >
            {film.developedImageData ? (
                <img
                    src={film.developedImageData}
                    alt={`Developed film ${film.id}`}
                    className={`absolute inset-0 w-full h-full object-contain p-[10%] filter invert transition-all duration-300 ${isDry ? 'grayscale' : 'grayscale-0 sepia'}`}
                />
            ) : (
                <div className="w-full h-full bg-zinc-800" />
            )}
             {!isDry && (
                <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center z-20">
                    <div className="text-center text-white font-mono p-2">
                        <p className="text-lg animate-pulse">Drying...</p>
                        <p className="text-xs">{timeLeft}</p>
                    </div>
                </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300 z-20" />
        </div>
    );
};

const PhotoDetailModal: React.FC<{ film: Film; onClose: () => void }> = ({ film, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-700 p-4 sm:p-6 rounded-lg max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <div>
                    <p className="font-mono text-zinc-400 text-sm mb-2 text-center">Negative</p>
                     <div 
                        className="relative aspect-[5/4] bg-black bg-cover bg-center border-2 border-zinc-600 p-2"
                        style={{ backgroundImage: `url(${NEGATIVE_FRAME_B64})` }}
                     >
                        {film.developedImageData && (
                             <img 
                                src={film.developedImageData} 
                                alt="Negative" 
                                className="absolute inset-0 w-full h-full object-contain filter invert grayscale p-[8%]"
                            />
                        )}
                    </div>
                </div>
                
                <div className="mt-6 border-t border-zinc-700 pt-4">
                    {film.errors.length > 0 ? (
                        <div>
                            <h4 className="font-mono text-lg text-yellow-400">Imperfections:</h4>
                            <ul className="list-disc list-inside mt-2 font-mono text-yellow-500/80 text-sm space-y-1">
                                {film.errors.map(err => <li key={err}>{errorDescriptions[err] || err}</li>)}
                            </ul>
                        </div>
                    ) : (
                        <p className="font-mono text-center text-green-400">A rare, perfect negative.</p>
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2 bg-zinc-700 text-zinc-200 rounded-md font-mono hover:bg-zinc-600">Close</button>
            </div>
        </div>
    );
};


const GalleryView: React.FC<GalleryViewProps> = ({ films, updateFilm }) => {
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  const developedFilms = useMemo(() => {
    return films.filter(f => f.isDeveloped).sort((a, b) => (b.developStartTime ?? 0) - (a.developStartTime ?? 0));
  }, [films]);
  
  useEffect(() => {
    const interval = setInterval(() => {
        developedFilms.forEach(film => {
            if (!film.isDry && film.developStartTime) {
                const timeSinceDevelop = Date.now() - film.developStartTime;
                if (timeSinceDevelop >= DRY_WAIT_MS) {
                    updateFilm(film.id, { isDry: true });
                }
            }
        });
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [developedFilms, updateFilm]);


  if (developedFilms.length === 0) {
    return <p className="text-center text-zinc-500 font-mono mt-20 p-4">You have no developed film. Process some in the bathroom first.</p>;
  }

  return (
    <div className="p-4 bg-zinc-900 min-h-full">
      <h2 className="text-2xl font-mono mb-6 text-center text-zinc-300">Film Negatives</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {developedFilms.map(film => (
          <FilmStrip key={film.id} film={film} onSelect={() => setSelectedFilm(film)} />
        ))}
      </div>
      {selectedFilm && <PhotoDetailModal film={selectedFilm} onClose={() => setSelectedFilm(null)} />}
    </div>
  );
};

export default GalleryView;