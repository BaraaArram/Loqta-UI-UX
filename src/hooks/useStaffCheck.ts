import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/lib/axios';

export function useStaffCheck() {
  const { accessToken, hydrated, isAuthenticated } = useAuth();
  const [isStaff, setIsStaff] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (hydrated && isAuthenticated && accessToken) {
      setIsStaff(undefined); // loading
      axios.get('/auth/staff-check/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => {
          setIsStaff(res.status === 200);
        })
        .catch(() => setIsStaff(false));
    } else {
      setIsStaff(false);
    }
  }, [hydrated, isAuthenticated, accessToken]);

  return isStaff;
} 