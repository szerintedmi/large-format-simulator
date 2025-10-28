import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Film } from '../types';
import { DEVELOP_WAIT_MS } from '../constants';
import { BeakerIcon, DevTankIcon } from './Icons';

interface DarkroomViewProps {
  films: Film[];
  batchUpdateFilms: (processedFilms: Film[]) => void;
  processFilm: (film: Film, allFilms: Film[]) => Promise<Film>;
}

const DarkroomChore: React.FC<{ label: string; done: boolean; onToggle: () => void; disabled: boolean }> = ({ label, done, onToggle, disabled }) => (
    <div className="flex items-center my-3 bg-zinc-800 p-3 rounded-md">
        <BeakerIcon className="w-6 h-6 text-zinc-500 mr-3" />
        <label className={`flex-grow font-mono ${done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{label}</label>
        <input type="checkbox" checked={done} onChange={onToggle} disabled={disabled} className="w-6 h-6 accent-green-500 bg-zinc-700 rounded border-zinc-600 focus:ring-green-600"/>
    </div>
);

const UndevelopedFilmItem: React.FC<{ film: Film; onSelect: (id: string) => void; isSelected: boolean; canSelect: boolean; }> = ({ film, onSelect, isSelected, canSelect }) => {
    const [timeLeft, setTimeLeft] = useState('');

    const canDevelop = useMemo(() => {
        const timeSinceCapture = Date.now() - film.captureTime;
        return timeSinceCapture >= DEVELOP_WAIT_MS;
    }, [film.captureTime]);

    useEffect(() => {
        if (canDevelop) {
            setTimeLeft('Ready');
            return;
        }
        const interval = setInterval(() => {
            const timeSinceCapture = Date.now() - film.captureTime;
            const remaining = DEVELOP_WAIT_MS - timeSinceCapture;
            if (remaining > 0) {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft('Ready');
                clearInterval(interval);
            }
        }, 60000); // Update every minute
         return () => clearInterval(interval);
    }, [film.captureTime, canDevelop]);

    const isDisabled = !canDevelop || (!isSelected && !canSelect);

    return (
        <div className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${isSelected ? 'bg-blue-900/50 border-blue-700' : 'bg-zinc-800 border-zinc-700'} ${isDisabled && !isSelected ? 'opacity-50' : ''}`}>
             <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={isSelected} onChange={() => onSelect(film.id)} disabled={isDisabled} className="w-5 h-5 accent-blue-500 bg-zinc-700 rounded border-zinc-600 focus:ring-blue-600"/>
                <div>
                    <p className="font-mono text-zinc-300">Graflok Holder</p>
                    <p className={`text-sm ${canDevelop ? 'text-green-400' : 'text-zinc-400'}`}>{timeLeft}</p>
                </div>
            </label>
        </div>
    );
};

const DevelopingModal: React.FC<{ films: Film[]; onFinish: (films: Film[]) => void }> = ({ films, onFinish }) => {
    const [chores, setChores] = useState([
        { label: 'Mix Developer', done: false },
        { label: 'Check Temperature', done: false },
        { label: 'Mix Stop Bath', done: false },
        { label: 'Mix Fixer', done: false },
    ]);
    const [isAgitating, setIsAgitating] = useState(false);
    const [shakeCount, setShakeCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const allChoresDone = chores.every(c => c.done);

    const handleToggleChore = (index: number) => {
        const newChores = [...chores];
        newChores[index].done = !newChores[index].done;
        setChores(newChores);
    };

    const handleShake = useCallback(() => {
        setShakeCount(prev => prev + 1);
    }, []);
    
    const handleManualShake = () => {
        handleShake();
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 800); // Animation duration
    }

    useEffect(() => {
        if (!isAgitating) return;
        const SHAKE_THRESHOLD = 15;
        
        const motionHandler = (event: DeviceMotionEvent) => {
            const acceleration = event.accelerationIncludingGravity;
            if (acceleration && (Math.abs(acceleration.x ?? 0) > SHAKE_THRESHOLD || Math.abs(acceleration.y ?? 0) > SHAKE_THRESHOLD || Math.abs(acceleration.z ?? 0) > SHAKE_THRESHOLD)) {
                handleShake();
            }
        };

        window.addEventListener('devicemotion', motionHandler);
        return () => window.removeEventListener('devicemotion', motionHandler);
    }, [isAgitating, handleShake]);

    const startAgitation = () => {
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            (DeviceMotionEvent as any).requestPermission().then((permissionState: string) => {
                if (permissionState === 'granted') {
                    setIsAgitating(true);
                } else {
                    setIsAgitating(true);
                }
            });
        } else {
             setIsAgitating(true);
        }
    };

    const agitationProgress = Math.min(100, (shakeCount / 30) * 100);

    useEffect(() => {
        if(agitationProgress >= 100) {
            setTimeout(() => {
                onFinish(films);
            }, 1000);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agitationProgress]);
    
    const shakeAnimation = `
        @keyframes gentle-shake {
            0%, 100% { transform: rotate(0); }
            25% { transform: rotate(-4deg); }
            75% { transform: rotate(4deg); }
        }
        .shake-animation {
            animation: gentle-shake 0.8s ease-in-out;
        }
    `;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <style>{shakeAnimation}</style>
            <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg max-w-sm w-full">
                <h3 className="text-xl font-mono mb-4 text-center">Developing {films.length} sheets</h3>
                {!allChoresDone && (
                    <div>
                        <p className="text-zinc-400 mb-3">Prepare the chemicals:</p>
                        {chores.map((chore, i) => <DarkroomChore key={i} {...chore} onToggle={() => handleToggleChore(i)} disabled={false} />)}
                    </div>
                )}
                {allChoresDone && !isAgitating && (
                     <div className="text-center">
                        <p className="text-zinc-300 mb-4">Chemicals ready. Time to agitate.</p>
                        <button onClick={startAgitation} className="px-6 py-3 bg-blue-600 text-white rounded-md font-mono hover:bg-blue-500">
                            Start Agitation
                        </button>
                    </div>
                )}
                 {isAgitating && agitationProgress < 100 && (
                    <div className="text-center">
                        <DevTankIcon onClick={handleManualShake} className={`w-24 h-24 mx-auto text-zinc-400 mb-4 cursor-pointer ${isAnimating ? 'shake-animation' : ''}`} />
                        <p className="text-lg font-mono mb-2 text-yellow-400 animate-pulse">AGITATE GENTLY</p>
                        <p className="text-sm text-zinc-400 mb-4">(Shake device or tap tank)</p>
                        <div className="w-full bg-zinc-700 rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${agitationProgress}%` }}></div>
                        </div>
                        <p className="mt-2 text-sm font-mono text-zinc-500">{Math.round(agitationProgress)}%</p>
                    </div>
                )}
                {agitationProgress >= 100 && (
                     <p className="text-center text-green-400 font-mono">Development Complete!</p>
                )}
            </div>
        </div>
    );
};


const DarkroomView: React.FC<DarkroomViewProps> = ({ films, batchUpdateFilms, processFilm }) => {
  const [developingFilms, setDevelopingFilms] = useState<Film[] | null>(null);
  const [selectedFilmIds, setSelectedFilmIds] = useState<string[]>([]);
  
  const undevelopedFilms = useMemo(() => films.filter(f => !f.isDeveloped), [films]);

  const shuffledUndevelopedFilms = useMemo(() => {
    const array = [...undevelopedFilms];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, [undevelopedFilms]);

  const handleSelectFilm = (id: string) => {
      setSelectedFilmIds(prev => {
          if (prev.includes(id)) {
              return prev.filter(filmId => filmId !== id);
          }
          if (prev.length < 6) {
              return [...prev, id];
          }
          return prev;
      });
  };

  const handleStartDevelopment = () => {
      const filmsToDevelop = films.filter(f => selectedFilmIds.includes(f.id));
      setDevelopingFilms(filmsToDevelop);
  };

  const handleFinishBatchDevelopment = async (filmsToProcess: Film[]) => {
      const processedFilms = await Promise.all(
          filmsToProcess.map(film => processFilm(film, films))
      );
      
      const updatedFilmsWithStartTime = processedFilms.map(film => ({
          ...film,
          isDeveloping: true,
          developStartTime: Date.now()
      }));

      batchUpdateFilms(updatedFilmsWithStartTime);
      setDevelopingFilms(null);
      setSelectedFilmIds([]);
  };

  const canSelectMore = selectedFilmIds.length < 6;

  return (
    <div className="p-4 h-full w-full bg-zinc-900 flex flex-col">
      <h2 className="text-2xl font-mono mb-6 text-center text-zinc-300">Bathroom</h2>
      {shuffledUndevelopedFilms.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3 max-w-md mx-auto w-full pb-24">
            {shuffledUndevelopedFilms.map(film => (
                <UndevelopedFilmItem 
                    key={film.id} 
                    film={film} 
                    onSelect={handleSelectFilm}
                    isSelected={selectedFilmIds.includes(film.id)}
                    canSelect={canSelectMore}
                />
            ))}
        </div>
      ) : (
        <p className="text-center text-zinc-500 font-mono mt-10">No film to develop. Go take some photos.</p>
      )}

      {selectedFilmIds.length > 0 && (
          <div className="fixed bottom-16 left-0 w-full p-4 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-700 flex justify-center">
              <button 
                onClick={handleStartDevelopment}
                className="px-6 py-3 bg-green-700 text-white font-mono rounded-md hover:bg-green-600 transition-colors w-full max-w-md"
              >
                Develop {selectedFilmIds.length} Selected
              </button>
          </div>
      )}

      {developingFilms && <DevelopingModal films={developingFilms} onFinish={handleFinishBatchDevelopment} />}
    </div>
  );
};

export default DarkroomView;
