import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Film, Print } from '../types';
import { NEGATIVE_FRAME_B64 } from '../constants';

interface EnlargerViewProps {
  films: Film[];
  prints: Print[];
  addPrint: (print: Print) => void;
}

interface TestStrip {
  id: string;
  exposures: number[];
  contrastGrade: number;
}

const toneOptions: Print['tone'][] = ['Neutral', 'Warm', 'Cool'];
const contrastGrades = [0, 1, 2, 3, 4, 5];

const getPrintFilter = (print: Print) => {
  const brightness = Math.min(1.35, Math.max(0.65, 1.08 - (print.exposureSeconds - 12) / 40));
  const contrast = 1 + (print.contrastGrade - 2) * 0.12;

  let toneFilter = '';
  switch (print.tone) {
    case 'Warm':
      toneFilter = 'sepia(0.35) saturate(1.05)';
      break;
    case 'Cool':
      toneFilter = 'hue-rotate(195deg) saturate(1.1)';
      break;
    default:
      toneFilter = 'saturate(1)';
      break;
  }

  return {
    filter: `brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)}) ${toneFilter}`,
  };
};

const negativeFilterStyle = {
  filter: 'invert(0.92) saturate(0.85) contrast(1.35) brightness(0.95)',
};

const NegativeCard: React.FC<{
  film: Film;
  selected: boolean;
  onSelect: () => void;
}> = ({ film, selected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`relative overflow-hidden rounded-lg border transition-all flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
      selected ? 'border-blue-500/80 shadow-[0_0_0_2px_rgba(59,130,246,0.35)]' : 'border-zinc-700 hover:border-zinc-500'
    }`}
  >
    <div className="relative aspect-[5/4] w-full bg-zinc-900 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${NEGATIVE_FRAME_B64})` }}
      />
      {film.developedImageData && (
        <img
          src={film.developedImageData}
          alt="Negative preview"
          className="absolute inset-[8%] w-auto h-auto max-w-[84%] max-h-[84%] object-contain mix-blend-screen"
          style={negativeFilterStyle}
        />
      )}
      {!film.developedImageData && (
        <div className="absolute inset-[20%] border border-dashed border-zinc-600/70 rounded-md" />
      )}
    </div>
    <div className="p-3 text-left">
      <p className="text-sm font-mono text-zinc-300 mb-1">Sheet #{film.id.split('-').pop()}</p>
      <p className="text-xs text-zinc-500">{film.isFocused ? 'In focus' : 'Soft focus'}</p>
    </div>
    {selected && (
      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-mono px-2 py-1 rounded">
        Selected
      </div>
    )}
  </button>
);

const TestStripRow: React.FC<{ strip: TestStrip }> = ({ strip }) => (
  <div className="flex items-center space-x-2">
    <div className="flex items-stretch space-x-1">
      {strip.exposures.map((val, idx) => (
        <div
          key={`${strip.id}-${idx}`}
          className="w-10 h-10 rounded-sm bg-gradient-to-b from-zinc-200/60 to-zinc-900/80 border border-zinc-700 flex flex-col items-center justify-center text-[10px] font-mono text-zinc-200"
          style={{
            filter: `brightness(${Math.max(0.6, Math.min(1.3, 1.05 - (val - strip.exposures[1]) / 35))})`,
          }}
        >
          <span>{val}s</span>
        </div>
      ))}
    </div>
    <span className="text-xs font-mono text-zinc-500">Grade {strip.contrastGrade}</span>
  </div>
);

const PrintCard: React.FC<{ print: Print; isRecent: boolean }> = ({ print, isRecent }) => (
  <div
    className={`bg-zinc-900 border rounded-lg p-3 transition-all ${
      isRecent ? 'border-amber-400/70 shadow-[0_0_0_2px_rgba(251,191,36,0.35)]' : 'border-zinc-800'
    }`}
  >
    <div className="aspect-[5/4] bg-zinc-950 border border-zinc-800 rounded shadow-inner overflow-hidden">
      <img
        src={print.imageData}
        alt="Enlarged print"
        className="w-full h-full object-cover"
        style={getPrintFilter(print)}
      />
    </div>
    <div className="mt-3 text-xs text-zinc-400 font-mono space-y-1">
      <p>
        Exposure {print.exposureSeconds}s · Grade {print.contrastGrade}
      </p>
      <p>Tone: {print.tone}</p>
      <p>
        From negative #{print.sourceFilmId.split('-').pop()} ·{' '}
        {new Date(print.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
);

const EnlargerView: React.FC<EnlargerViewProps> = ({ films, prints, addPrint }) => {
  const finishedNegatives = useMemo(
    () => films.filter(f => f.isDeveloped && f.isDry && !!f.developedImageData),
    [films]
  );

  const [selectedNegativeId, setSelectedNegativeId] = useState<string | null>(null);
  const [exposureSeconds, setExposureSeconds] = useState(12);
  const [contrastGrade, setContrastGrade] = useState<number>(2);
  const [tone, setTone] = useState<Print['tone']>('Neutral');
  const [isExposing, setIsExposing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [testStrips, setTestStrips] = useState<TestStrip[]>([]);
  const [recentPrintId, setRecentPrintId] = useState<string | null>(null);

  const selectedNegative = useMemo(
    () => finishedNegatives.find(f => f.id === selectedNegativeId) ?? null,
    [finishedNegatives, selectedNegativeId]
  );

  useEffect(() => {
    if (!selectedNegativeId && finishedNegatives.length > 0) {
      setSelectedNegativeId(finishedNegatives[0].id);
    }
  }, [finishedNegatives, selectedNegativeId]);

  useEffect(() => {
    if (!isExposing || remainingSeconds <= 0) return;

    const timer = setTimeout(() => {
      setRemainingSeconds(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isExposing, remainingSeconds]);

  useEffect(() => {
    if (!isExposing || remainingSeconds > 0) return;
    if (!selectedNegative || !selectedNegative.developedImageData) {
      setIsExposing(false);
      return;
    }

    const newPrint: Print = {
      id: `print-${Date.now()}`,
      sourceFilmId: selectedNegative.id,
      createdAt: Date.now(),
      exposureSeconds,
      contrastGrade,
      tone,
      imageData: selectedNegative.developedImageData,
    };

    addPrint(newPrint);
    setRecentPrintId(newPrint.id);
    setIsExposing(false);
  }, [isExposing, remainingSeconds, selectedNegative, exposureSeconds, contrastGrade, tone, addPrint]);

  const handleExposePrint = useCallback(() => {
    if (!selectedNegative || !selectedNegative.developedImageData) return;
    const totalSeconds = Math.max(1, Math.round(exposureSeconds));
    setRemainingSeconds(totalSeconds);
    setIsExposing(true);
    setRecentPrintId(null);
  }, [selectedNegative, exposureSeconds]);

  const handleAddTestStrip = useCallback(() => {
    if (!selectedNegative) return;
    const base = exposureSeconds;
    const newStrip: TestStrip = {
      id: `strip-${Date.now()}`,
      exposures: [
        Math.max(2, Math.round(base * 0.6)),
        Math.max(2, Math.round(base)),
        Math.max(3, Math.round(base * 1.4)),
      ],
      contrastGrade,
    };
    setTestStrips(prev => [newStrip, ...prev].slice(0, 4));
  }, [selectedNegative, exposureSeconds, contrastGrade]);

  if (finishedNegatives.length === 0) {
    return (
      <div className="p-6 bg-zinc-900 min-h-full flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-mono text-zinc-200 mb-4">Enlarger</h2>
        <p className="text-zinc-500 font-mono max-w-sm">
          No dried negatives yet. Develop and dry a sheet in the bathroom to start printing.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-zinc-900 min-h-full space-y-8">
      <section>
        <h2 className="text-2xl font-mono text-zinc-200 mb-1 text-center md:text-left">Enlarger</h2>
        <p className="text-sm font-mono text-zinc-500 text-center md:text-left">
          Choose a negative, set time and contrast, then expose the paper to pull a fresh print.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-mono text-zinc-200 mb-4">1. Select Negative</h3>
          <div className="grid grid-cols-2 gap-4">
            {finishedNegatives.map(film => (
              <NegativeCard
                key={film.id}
                film={film}
                selected={film.id === selectedNegativeId}
                onSelect={() => setSelectedNegativeId(film.id)}
              />
            ))}
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 md:p-6 flex flex-col space-y-6">
          <div>
            <h3 className="text-lg font-mono text-zinc-200 mb-4">2. Exposure Controls</h3>
            <div className="space-y-4">
              <label className="block text-sm font-mono text-zinc-400">
                Exposure {Math.round(exposureSeconds)} seconds
              </label>
              <input
                type="range"
                min={4}
                max={40}
                value={exposureSeconds}
                onChange={event => setExposureSeconds(Number(event.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-mono text-zinc-400 flex flex-col">
                  Multigrade filter
                  <select
                    value={contrastGrade}
                    onChange={event => setContrastGrade(Number(event.target.value))}
                    className="mt-2 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
                  >
                    {contrastGrades.map(grade => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-mono text-zinc-400 flex flex-col">
                  Paper tone
                  <select
                    value={tone}
                    onChange={event => setTone(event.target.value as Print['tone'])}
                    className="mt-2 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
                  >
                    {toneOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h4 className="text-sm font-mono text-zinc-400 mb-3">Test Strips</h4>
            {testStrips.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500">
                Expose a strip to see incremental times before committing to a full sheet.
              </p>
            ) : (
              <div className="space-y-3">
                {testStrips.map(strip => (
                  <TestStripRow key={strip.id} strip={strip} />
                ))}
              </div>
            )}
            <button
              onClick={handleAddTestStrip}
              className="mt-4 w-full py-2 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded font-mono text-sm hover:bg-zinc-700 transition-colors"
              disabled={!selectedNegative || isExposing}
            >
              Burn Test Strip
            </button>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/80">
            <h3 className="text-lg font-mono text-zinc-200 mb-3">3. Expose Paper</h3>
            {selectedNegative ? (
              <div className="space-y-4">
                <div className="aspect-[5/4] rounded border border-zinc-800 bg-zinc-950 overflow-hidden shadow-inner">
                  <img
                    src={selectedNegative.developedImageData}
                    alt="Projection preview"
                    className="w-full h-full object-cover"
                    style={{
                      filter: `brightness(${1.1}) contrast(${1 + (contrastGrade - 2) * 0.08})`,
                    }}
                  />
                </div>
                <button
                  onClick={handleExposePrint}
                  disabled={isExposing}
                  className={`w-full py-3 font-mono text-sm rounded border transition-colors ${
                    isExposing
                      ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                      : 'bg-amber-400 text-black border-amber-300 hover:bg-amber-300'
                  }`}
                >
                  {isExposing ? `Exposing… ${remainingSeconds}s` : 'Expose Print'}
                </button>
                {isExposing && (
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{
                        width: `${100 - (remainingSeconds / Math.max(1, Math.round(exposureSeconds))) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-mono text-zinc-500">
                Pick a negative to preview and expose a sheet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h3 className="text-lg font-mono text-zinc-200">Prints Gallery</h3>
          <p className="text-xs font-mono text-zinc-500">
            {prints.length} {prints.length === 1 ? 'print' : 'prints'} on the drying rack
          </p>
        </div>
        {prints.length === 0 ? (
          <p className="text-sm font-mono text-zinc-500">
            Expose your first print to see it appear here.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prints.map(print => (
              <PrintCard key={print.id} print={print} isRecent={print.id === recentPrintId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EnlargerView;
