import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) {
      navigate('/', { replace: true });
    } else {
      setIsAuth(true);
    }
  }, [navigate]);

  if (isAuth === null) return null;
  return <>{children}</>;
};

export default AuthGuard;
