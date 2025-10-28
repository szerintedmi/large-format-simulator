import { Film } from '../types';

const FILM_HOLDERS_KEY = 'lf_filmHolders';

export const getFilms = (): Film[] => {
  const filmsStr = localStorage.getItem(FILM_HOLDERS_KEY);
  return filmsStr ? JSON.parse(filmsStr) : [];
};

export const saveFilms = (films: Film[]) => {
  localStorage.setItem(FILM_HOLDERS_KEY, JSON.stringify(films));
};
