import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Film } from '../types';
import { TOTAL_FILM_HOLDERS, DEV_MODE } from '../constants';
import { FilmHolderIcon } from './Icons';

interface CameraViewProps {
  shotsLeft: number;
  addFilm: (film: Film) => void;
}

const APERTURES = ['f/5.6', 'f/8', 'f/11', 'f/16', 'f/22', 'f/32', 'f/45', 'f/64'];
const SHUTTER_SPEEDS = ['1s', '1/2', '1/4', '1/8', '1/15', '1/30', '1/60', '1/125', '1/250'];

const APERTURE_BRIGHTNESS_MAP: Record<string, number> = {
    'f/5.6': 0.7,
    'f/8': 0.75,
    'f/11': 0.8,
    'f/16': 0.85,
    'f/22': 0.9,
    'f/32': 0.93,
    'f/45': 0.96,
    'f/64': 0.98,
};

const LensRingDial: React.FC<{ label: string, options: string[], value: string, onChange: (value: string) => void }> = ({ label, options, value, onChange }) => {
    const currentIndex = options.indexOf(value);
    
    const prevIndex = (currentIndex - 1 + options.length) % options.length;
    const nextIndex = (currentIndex + 1) % options.length;

    const prevValue = options[prevIndex];
    const nextValue = options[nextIndex];

    return (
        <div className="flex flex-col items-center select-none">
            <span className="font-mono text-xs text-zinc-400 mb-2">{label}</span>
            <div className="flex items-center justify-center w-40 h-12">
                <span 
                    onClick={() => onChange(prevValue)}
                    className="font-mono text-base text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors transform -rotate-12 translate-y-1"
                >
                    {prevValue}
                </span>
                <span className="font-mono text-xl text-zinc-100 font-bold mx-3 w-16 text-center">
                    {value}
                </span>
                <span 
                    onClick={() => onChange(nextValue)}
                    className="font-mono text-base text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors transform rotate-12 translate-y-1"
                >
                    {nextValue}
                </span>
            </div>
        </div>
    );
};

const FocusDial: React.FC<{ value: number, onChange: (value: number) => void, disabled: boolean }> = ({ value, onChange, disabled }) => {
    const handleDecrement = () => {
        if (!disabled) onChange(Math.max(0, value - 1));
    };
    const handleIncrement = () => {
        if (!disabled) onChange(Math.min(100, value + 1));
    };

    return (
        <div className="flex flex-col items-center select-none">
            <span className="font-mono text-xs text-zinc-400 mb-2">Focus</span>
            <div className="flex items-center justify-center w-40 h-12">
                <span
                    onClick={handleDecrement}
                    className={`font-mono text-3xl text-zinc-500 transition-colors transform -rotate-12 translate-y-1 ${!disabled ? 'cursor-pointer hover:text-zinc-300' : 'cursor-not-allowed opacity-50'}`}
                >
                    -
                </span>
                <span className="font-mono text-xl text-zinc-100 font-bold mx-3 w-12 text-center">
                    {value}
                </span>
                <span
                    onClick={handleIncrement}
                    className={`font-mono text-3xl text-zinc-500 transition-colors transform rotate-12 translate-y-1 ${!disabled ? 'cursor-pointer hover:text-zinc-300' : 'cursor-not-allowed opacity-50'}`}
                >
                    +
                </span>
            </div>
        </div>
    );
};


const CameraView: React.FC<CameraViewProps> = ({ shotsLeft, addFilm }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [focus, setFocus] = useState(50);
  const [targetFocus, setTargetFocus] = useState(50);
  const [isExposing, setIsExposing] = useState(false);
  const [isHolderInserted, setIsHolderInserted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [aperture, setAperture] = useState('f/11');
  const [shutterSpeed, setShutterSpeed] = useState('1/125');


  useEffect(() => {
    setTargetFocus(Math.floor(Math.random() * 80) + 10);
    
    const getCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access camera. Please check permissions and try again.");
      }
    };
    getCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blurAmount = Math.min(20, Math.abs(focus - targetFocus) / 4);
  const isFocused = Math.abs(focus - targetFocus) < 2;

  const hasShots = DEV_MODE || shotsLeft > 0;

  const takePhoto = useCallback(() => {
    if (!hasShots || !videoRef.current || !canvasRef.current || !isHolderInserted) return;

    setIsExposing(true);

    setTimeout(() => {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        const newFilm: Film = {
          id: `film-${Date.now()}`,
          imageData,
          captureTime: Date.now(),
          isFocused,
          aperture,
          shutterSpeed,
          isDeveloped: false,
          isDeveloping: false,
          isDry: false,
          errors: [],
        };
        addFilm(newFilm);
        setTargetFocus(Math.floor(Math.random() * 80) + 10);
      }
      setIsExposing(false);
      setIsHolderInserted(false);
    }, 1500);
  }, [hasShots, addFilm, isFocused, aperture, shutterSpeed, isHolderInserted]);
  
  const previewOpacity = APERTURE_BRIGHTNESS_MAP[aperture] ?? 0.8;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 bg-zinc-900">
        <div className="text-center w-full">
            <h2 className="text-xl font-mono mb-2">Ground Glass</h2>
            <p className="text-zinc-400 mb-4 font-mono">{DEV_MODE ? 'DEV MODE' : `${shotsLeft} / ${TOTAL_FILM_HOLDERS} film holders available`}</p>
        </div>

      <div className="relative w-full max-w-lg aspect-[5/4] bg-black border-4 border-zinc-700 rounded-md overflow-hidden shadow-lg">
        {cameraError ? (
          <div className="flex items-center justify-center h-full text-center text-red-400 p-4">{cameraError}</div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-all duration-300 ${isHolderInserted ? 'opacity-0' : 'opacity-100'}`}
              style={{ filter: `blur(${blurAmount}px)` }}
            />
            <div 
              className={`absolute inset-0 bg-black transition-opacity duration-300`}
              style={{ opacity: isHolderInserted ? 0 : previewOpacity }}
            />
            
            {isHolderInserted && !isExposing && (
                 <div className="absolute inset-0 bg-zinc-800 flex flex-col items-center justify-center">
                    <FilmHolderIcon className="w-24 h-24 text-zinc-600" />
                    <p className="text-zinc-500 font-mono mt-4">Film Holder Inserted</p>
                </div>
            )}

            {isExposing && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <p className="text-zinc-500 font-mono animate-pulse">Exposing...</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      <div className="w-full max-w-lg mt-6 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
        <div className="grid grid-cols-2 gap-4">
            <LensRingDial label="Aperture" options={APERTURES} value={aperture} onChange={setAperture} />
            <LensRingDial label="Shutter" options={SHUTTER_SPEEDS} value={shutterSpeed} onChange={setShutterSpeed} />
        </div>
        <div className="flex justify-center mt-2">
            <FocusDial value={focus} onChange={setFocus} disabled={isExposing || !hasShots || isHolderInserted}/>
        </div>
      </div>

      <div className="mt-6 h-16">
        {!isHolderInserted ? (
             <button
                onClick={() => setIsHolderInserted(true)}
                disabled={!hasShots || isExposing || !!cameraError}
                className="px-6 py-3 bg-zinc-700 border border-zinc-600 rounded-md text-sm font-mono tracking-wider text-zinc-200 hover:border-zinc-400 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Insert Film Holder
            </button>
        ) : (
            <button
                onClick={takePhoto}
                disabled={!hasShots || isExposing || !!cameraError}
                className="px-8 py-4 bg-red-800 border-2 border-red-600 rounded-full text-lg font-mono tracking-widest text-white hover:border-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
            >
                EXPOSE
            </button>
        )}
      </div>
    </div>
  );
};

export default CameraView;