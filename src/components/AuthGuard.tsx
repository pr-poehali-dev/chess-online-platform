import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const USER_CHECK_URL = 'https://functions.poehali.dev/3a8fa375-82f7-41f7-823b-3910eafac641';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const savedUser = localStorage.getItem('chessUser');
      if (!savedUser) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const userData = JSON.parse(savedUser);
        const rawId = userData.email || userData.name || 'anonymous';
        const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        const res = await fetch(`${USER_CHECK_URL}?user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();

        if (data.exists) {
          setIsAuth(true);
        } else {
          localStorage.removeItem('chessUser');
          navigate('/', { replace: true });
        }
      } catch {
        setIsAuth(true);
      }
    };
    check();
  }, [navigate]);

  if (isAuth === null) return null;
  return <>{children}</>;
};

export default AuthGuard;
