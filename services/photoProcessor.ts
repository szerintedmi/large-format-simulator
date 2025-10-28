import { Film, PhotoError } from '../types';
import {
    BLANK_CHANCE,
    DOUBLE_EXPOSURE_CHANCE,
    EXPOSURE_ERROR_CHANCE,
    LIGHT_LEAK_CHANCE,
    SCRATCH_CHANCE,
    FINGERPRINT_CHANCE,
    FINGERPRINT_B64
} from '../constants';

const APERTURES = ['f/5.6', 'f/8', 'f/11', 'f/16', 'f/22', 'f/32', 'f/45', 'f/64'];
const SHUTTER_SPEEDS = ['1s', '1/2', '1/4', '1/8', '1/15', '1/30', '1/60', '1/125', '1/250'];

function applyGrayscale(context: CanvasRenderingContext2D, width: number, height: number) {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
    context.putImageData(imageData, 0, 0);
}

function applyBlur(context: CanvasRenderingContext2D, radius: number) {
    context.filter = `blur(${radius}px)`;
}

function applyMotionBlur(context: CanvasRenderingContext2D, width: number, height: number) {
    context.globalAlpha = 0.5;
    const offsets = [-4, -2, 2, 4];
    for (const offset of offsets) {
        context.drawImage(context.canvas, offset, 0, width, height);
    }
    context.globalAlpha = 1.0;
}


function applyExposure(context: CanvasRenderingContext2D, isOver: boolean) {
    context.filter = isOver ? 'brightness(2.5) contrast(0.7)' : 'brightness(0.2) contrast(1.3)';
}

function applyDoubleExposure(context: CanvasRenderingContext2D, width: number, height: number) {
    // Simulates catastrophic overexposure by blending with white
    context.globalCompositeOperation = 'lighter';
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'source-over';
}

function applyBlank(context: CanvasRenderingContext2D, width: number, height: number, isWhite: boolean) {
    context.fillStyle = isWhite ? 'white' : 'black';
    context.fillRect(0, 0, width, height);
}

function applyScratches(context: CanvasRenderingContext2D, width: number, height: number) {
    const numScratches = Math.floor(Math.random() * 3) + 1;
    for(let i = 0; i < numScratches; i++) {
        context.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`;
        context.lineWidth = Math.random() * 1.5 + 0.5;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = Math.random() * height * 0.5 + height * 0.1;
        const angle = Math.random() * Math.PI * 2;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        context.stroke();
    }
}

function applyLightLeak(context: CanvasRenderingContext2D, width: number, height: number) {
    const side = Math.floor(Math.random() * 4);
    let x1=0, y1=0, x2=0, y2=0;

    switch(side) {
        case 0: // top
            x1 = Math.random() * width; y1 = 0; x2 = x1; y2 = height * (Math.random() * 0.4 + 0.1); break;
        case 1: // right
            x1 = width; y1 = Math.random() * height; x2 = width * (1 - (Math.random() * 0.4 + 0.1)); y2 = y1; break;
        case 2: // bottom
            x1 = Math.random() * width; y1 = height; x2 = x1; y2 = height * (1 - (Math.random() * 0.4 + 0.1)); break;
        case 3: // left
            x1 = 0; y1 = Math.random() * height; x2 = width * (Math.random() * 0.4 + 0.1); y2 = y1; break;
    }

    const grad = context.createLinearGradient(x1, y1, x2, y2);
    const color = ['255,100,0', '255,0,0', '200,200,255'][Math.floor(Math.random() * 3)];

    grad.addColorStop(0, `rgba(${color}, 0.6)`);
    grad.addColorStop(1, `rgba(${color}, 0)`);

    context.fillStyle = grad;
    context.fillRect(0, 0, width, height);
}

async function applyFingerprint(context: CanvasRenderingContext2D, width: number, height: number) {
    const fingerprintImg = new Image();
    fingerprintImg.src = FINGERPRINT_B64;
    await new Promise(resolve => {
        fingerprintImg.onload = resolve;
        fingerprintImg.onerror = resolve; // Continue even if it fails
    });

    const numPrints = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numPrints; i++) {
        context.save();
        context.globalAlpha = Math.random() * 0.15 + 0.05;
        const size = width * (Math.random() * 0.2 + 0.2);
        const x = Math.random() * (width - size);
        const y = Math.random() * (height - size);
        context.translate(x + size / 2, y + size / 2);
        context.rotate(Math.random() * Math.PI * 2);
        context.drawImage(fingerprintImg, -size / 2, -size / 2, size, size);
        context.restore();
    }
}

const getShutterSpeedValue = (speed: string): number => {
    if (speed.includes('s')) {
        return parseFloat(speed.replace('s', ''));
    }
    const parts = speed.split('/');
    return parseInt(parts[0], 10) / parseInt(parts[1], 10);
}

export const processFilm = (film: Film, allFilms: Film[]): Promise<Film> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return resolve(film);

        const img = new Image();
        img.src = film.imageData;
        img.onload = async () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            
            const errors: PhotoError[] = [];

            // Blank is a catastrophic failure, no other errors apply
            if (Math.random() < BLANK_CHANCE) {
                if(Math.random() < 0.5){
                    errors.push(PhotoError.BLANK_WHITE);
                    applyBlank(context, canvas.width, canvas.height, true);
                } else {
                    errors.push(PhotoError.BLANK_BLACK);
                    applyBlank(context, canvas.width, canvas.height, false);
                }
            } else {
                 if (Math.random() < LIGHT_LEAK_CHANCE) {
                    errors.push(PhotoError.LIGHT_LEAK);
                    applyLightLeak(context, canvas.width, canvas.height);
                }

                if (Math.random() < DOUBLE_EXPOSURE_CHANCE) {
                    errors.push(PhotoError.DOUBLE_EXPOSURE);
                    applyDoubleExposure(context, canvas.width, canvas.height);
                }
                
                applyGrayscale(context, canvas.width, canvas.height);

                // Dynamic Out of Focus Chance
                if (!film.isFocused) {
                    const apertureIndex = APERTURES.indexOf(film.aperture);
                    const minChance = 0.1; // at f/64
                    const maxChance = 0.7; // at f/5.6
                    // Higher chance for wider apertures (lower index)
                    const chance = maxChance - (apertureIndex / (APERTURES.length - 1)) * (maxChance - minChance);
                    if (Math.random() < chance) {
                        errors.push(PhotoError.OUT_OF_FOCUS);
                        applyBlur(context, 8);
                    }
                }

                // Dynamic Motion Blur Chance
                const shutterValue = getShutterSpeedValue(film.shutterSpeed);
                let motionBlurChance = 0.05; // Base chance
                if (shutterValue > 1/125) motionBlurChance = 0.1;
                if (shutterValue > 1/15) motionBlurChance = 0.4;
                if (shutterValue >= 1) motionBlurChance = 0.9;
                
                if (Math.random() < motionBlurChance) {
                    errors.push(PhotoError.MOTION_BLUR);
                    applyMotionBlur(context, canvas.width, canvas.height);
                }

                if (Math.random() < EXPOSURE_ERROR_CHANCE) {
                    if (Math.random() < 0.5) {
                        errors.push(PhotoError.OVER_EXPOSED);
                        applyExposure(context, true);
                    } else {
                        errors.push(PhotoError.UNDER_EXPOSED);
                        applyExposure(context, false);
                    }
                }

                if (Math.random() < SCRATCH_CHANCE) {
                    errors.push(PhotoError.SCRATCHES);
                    applyScratches(context, canvas.width, canvas.height);
                }

                if (Math.random() < FINGERPRINT_CHANCE) {
                    errors.push(PhotoError.FINGERPRINT);
                    await applyFingerprint(context, canvas.width, canvas.height);
                }
            }

            const processedFilm: Film = {
                ...film,
                developedImageData: canvas.toDataURL('image/jpeg'),
                isDeveloped: true,
                isDeveloping: false,
                isDry: false,
                errors,
            };
            resolve(processedFilm);
        };
        img.onerror = () => resolve(film);
    });
};