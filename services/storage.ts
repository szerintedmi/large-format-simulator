import { Film, Print } from '../types';

const FILM_HOLDERS_KEY = 'lf_filmHolders';
const PRINTS_KEY = 'lf_prints';

export const getFilms = (): Film[] => {
  const filmsStr = localStorage.getItem(FILM_HOLDERS_KEY);
  return filmsStr ? JSON.parse(filmsStr) : [];
};

export const saveFilms = (films: Film[]) => {
  localStorage.setItem(FILM_HOLDERS_KEY, JSON.stringify(films));
};

export const getPrints = (): Print[] => {
  const printsStr = localStorage.getItem(PRINTS_KEY);
  return printsStr ? JSON.parse(printsStr) : [];
};

export const savePrints = (prints: Print[]) => {
  localStorage.setItem(PRINTS_KEY, JSON.stringify(prints));
};
