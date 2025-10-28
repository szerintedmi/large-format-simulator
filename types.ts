export enum View {
  CAMERA,
  DARKROOM,
  GALLERY,
}

export enum PhotoError {
  BLANK_WHITE = 'BLANK_WHITE',
  BLANK_BLACK = 'BLANK_BLACK',
  DOUBLE_EXPOSURE = 'DOUBLE_EXPOSURE',
  OUT_OF_FOCUS = 'OUT_OF_FOCUS',
  UNDER_EXPOSED = 'UNDER_EXPOSED',
  OVER_EXPOSED = 'OVER_EXPOSED',
  SCRATCHES = 'SCRATCHES',
  LIGHT_LEAK = 'LIGHT_LEAK',
  MOTION_BLUR = 'MOTION_BLUR',
  FINGERPRINT = 'FINGERPRINT',
}

export interface Film {
  id: string;
  imageData: string;
  captureTime: number;
  isFocused: boolean;
  aperture: string;
  shutterSpeed: string;
  developedImageData?: string;
  isDeveloped: boolean;
  isDeveloping: boolean;
  developStartTime?: number;
  isDry: boolean;
  errors: PhotoError[];
}