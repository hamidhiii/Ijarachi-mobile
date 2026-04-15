import { useAuth } from '../context/AuthContext';

export function useCurrentUser() {
    const { user, isLoggedIn, loading } = useAuth();
    return { user, isLoggedIn, loading };
}
