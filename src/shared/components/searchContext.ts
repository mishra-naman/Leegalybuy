import { createContext } from 'react';

export const SearchContext = createContext<{
  term: string;
  change: (value: string) => void;
  submit: () => void;
}>({ term: '', change: () => {}, submit: () => {} });
