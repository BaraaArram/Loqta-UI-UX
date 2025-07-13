// useAppDispatch: Typed version of useDispatch for Redux Toolkit.
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';

export const useAppDispatch = () => useDispatch<AppDispatch>(); 