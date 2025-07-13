// useStaffCheck: Custom hook to check if the current user has staff privileges.
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchStaffStatus, resetStaffStatus } from '@/features/auth/authSlice';

export function useStaffCheck() {
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated, isStaff, isStaffLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only fetch if authenticated, hydrated, staff status is undefined, and not currently loading
    if (isAuthenticated && hydrated && isStaff === undefined && !isStaffLoading) {
      console.log('useStaffCheck: Fetching staff status...', { isAuthenticated, hydrated, isStaff, isStaffLoading });
      dispatch(fetchStaffStatus() as any);
    }
  }, [isAuthenticated, hydrated, isStaff, dispatch]); // Removed isStaffLoading from dependencies

  const refreshStaffStatus = () => {
    console.log('useStaffCheck: Forcing staff status refresh...');
    dispatch(resetStaffStatus());
    dispatch(fetchStaffStatus() as any);
  };

  return {
    isStaff,
    isStaffLoading,
    isAuthenticated,
    hydrated,
    refreshStaffStatus
  };
} 