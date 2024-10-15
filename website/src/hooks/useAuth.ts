import { AuthContext } from '@/app/context/JWTAuthContext';
import { useContext } from 'react';

export const useAuth = () => useContext(AuthContext);
