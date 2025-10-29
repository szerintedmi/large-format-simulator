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
    const dialRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const normalizedValue = Math.min(100, Math.max(0, value));
    const angle = (normalizedValue / 100) * 270 - 135;

    const updateValueFromPointer = useCallback((clientX: number, clientY: number) => {
        const rect = dialRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = clientX - centerX;
        const deltaY = centerY - clientY;

        let degrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        if (degrees < -180) {
            degrees += 360;
        }

        const clampedDegrees = Math.max(-135, Math.min(135, degrees));
        const nextValue = Math.round(((clampedDegrees + 135) / 270) * 100);

        onChange(nextValue);
    }, [onChange]);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.preventDefault();
        if (dialRef.current) {
            dialRef.current.setPointerCapture(event.pointerId);
        }
        setIsDragging(true);
        updateValueFromPointer(event.clientX, event.clientY);
    }, [disabled, updateValueFromPointer]);

    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || disabled) return;
        event.preventDefault();
        updateValueFromPointer(event.clientX, event.clientY);
    }, [disabled, isDragging, updateValueFromPointer]);

    const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        if (dialRef.current && dialRef.current.hasPointerCapture(event.pointerId)) {
            dialRef.current.releasePointerCapture(event.pointerId);
        }
        setIsDragging(false);
    }, [isDragging]);

    const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.preventDefault();
        const step = event.deltaY > 0 ? -1 : 1;
        const nextValue = Math.min(100, Math.max(0, normalizedValue + step));
        if (nextValue !== normalizedValue) {
            onChange(nextValue);
        }
    }, [disabled, normalizedValue, onChange]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        let nextValue = normalizedValue;

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowRight':
                nextValue = Math.min(100, normalizedValue + 1);
                break;
            case 'ArrowDown':
            case 'ArrowLeft':
                nextValue = Math.max(0, normalizedValue - 1);
                break;
            case 'Home':
                nextValue = 0;
                break;
            case 'End':
                nextValue = 100;
                break;
            default:
                return;
        }

        event.preventDefault();
        if (nextValue !== normalizedValue) {
            onChange(nextValue);
        }
    }, [disabled, normalizedValue, onChange]);

    useEffect(() => {
        if (disabled && isDragging) {
            setIsDragging(false);
        }
    }, [disabled, isDragging]);

    return (
        <div className="flex flex-col items-center select-none">
            <span className="font-mono text-xs text-zinc-400 mb-2">Focus</span>
            <div
                ref={dialRef}
                role="slider"
                aria-label="Focus"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={normalizedValue}
                aria-valuetext={`${normalizedValue} focus units`}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                className={`relative flex items-center justify-center w-32 h-32 rounded-full border border-zinc-800 bg-zinc-950 transition-opacity ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab focus:outline-none focus:ring-2 focus:ring-zinc-300/40 active:cursor-grabbing'}`}
                style={{
                    background: 'radial-gradient(circle at 50% 42%, rgba(82,82,91,0.22), rgba(10,10,12,0.96) 70%)',
                    boxShadow: disabled ? '0 10px 26px rgba(0,0,0,0.4)' : '0 18px 40px rgba(0,0,0,0.55)'
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerLeave={endDrag}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute inset-[9%] rounded-full border border-zinc-900/60 bg-zinc-900/80 shadow-[inset_0_6px_14px_rgba(0,0,0,0.65)] overflow-hidden"
                        style={{
                            transform: `rotate(${angle}deg)`,
                            transition: isDragging ? 'none' : 'transform 120ms ease-out'
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-90"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, rgba(113,113,122,0.35) 0px 6px, rgba(24,24,27,0.96) 6px 12px)'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/35 via-transparent to-black/45" />
                    </div>
                    <div
                        className="absolute inset-[28%] rounded-full border border-zinc-900/50 bg-gradient-to-br from-zinc-700/25 via-zinc-900 to-black shadow-[inset_0_5px_10px_rgba(0,0,0,0.75)]"
                    >
                        <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-zinc-200/12 via-transparent to-black/45 mix-blend-screen" />
                    </div>
                    <div className="absolute left-1/2 top-[7%] h-[13%] w-[10%] -translate-x-1/2 rounded-b-full bg-gradient-to-b from-zinc-200/80 via-zinc-100/20 to-transparent shadow-[0_2px_6px_rgba(255,255,255,0.12)]" />
                    <div className="absolute inset-0 rounded-full border border-zinc-900/35 shadow-[inset_0_0_18px_rgba(0,0,0,0.6)]" />
                </div>
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
