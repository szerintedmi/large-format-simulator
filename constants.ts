// A flag to disable timers for easier e2e testing.
export const DEV_MODE = true; 

export const TOTAL_FILM_HOLDERS = 24;

export const DEVELOP_WAIT_MS = DEV_MODE ? 1000 : 6 * 60 * 60 * 1000;
export const DRY_WAIT_MS = DEV_MODE ? 2000 : 1 * 60 * 60 * 1000;


// Error Probabilities
export const BLANK_CHANCE = 0.05; // 5% (split between black and white)
export const DOUBLE_EXPOSURE_CHANCE = 0.02; // 2%
// Out of focus chance is now dynamic based on aperture in photoProcessor.ts
export const EXPOSURE_ERROR_CHANCE = 0.15; // 15% (split between under and over)
export const SCRATCH_CHANCE = 0.2; // 20%
export const LIGHT_LEAK_CHANCE = 0.2; // 20%
// Motion blur chance is dynamic based on shutter speed in photoProcessor.ts
export const FINGERPRINT_CHANCE = 0.1; // 10%

// Base64 for a transparent fingerprint image
export const FINGERPRINT_B64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAABFUlEQVR4nO3BAQEAAACAkP6v7ggKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICHwR0MAAG34eLpAAAAAElFTkSuQmCC';

// Base64 for the negative frame, required by GalleryView
export const NEGATIVE_FRAME_B64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
