import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { NameStep, EmailStep, OtpStep, CityStep, SEND_OTP_URL, VERIFY_OTP_URL } from './RegistrationSteps';

interface AuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  setIsAuthenticated: (value: boolean) => void;
  setShowGameSettings: (value: boolean) => void;
}

export const AuthModal = ({ 
  showAuthModal, 
  setShowAuthModal, 
  setIsAuthenticated, 
  setShowGameSettings 
}: AuthModalProps) => {
  const [registrationStep, setRegistrationStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser && showAuthModal) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setShowGameSettings(true);
    }
  }, [showAuthModal, setIsAuthenticated, setShowAuthModal, setShowGameSettings]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const sendOtp = useCallback(async () => {
    setIsSending(true);
    setOtpError('');
    try {
      const res = await fetch(SEND_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrationStep(4);
        setResendTimer(60);
      } else {
        setOtpError(data.error || 'Не удалось отправить код');
      }
    } catch {
      setOtpError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setIsSending(false);
    }
  }, [userEmail]);

  const verifyOtp = useCallback(async () => {
    setIsVerifying(true);
    setOtpError('');
    try {
      const res = await fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail.trim().toLowerCase(),
          code: otpCode.trim(),
          name: userName.trim(),
          city: selectedCity
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const user = data.user;
        const userData = {
          name: user.username,
          email: userEmail.trim().toLowerCase(),
          city: user.city || selectedCity,
          rating: user.rating,
          id: user.id,
          games_played: user.games_played,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws
        };
        localStorage.setItem('chessUser', JSON.stringify(userData));
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setShowGameSettings(true);
        resetForm();
      } else {
        setOtpError(
          data.error === 'Invalid code' ? 'Неверный код. Проверьте и попробуйте снова.' :
          data.error === 'Code expired or not found' ? 'Код истёк. Запросите новый.' :
          data.error || 'Ошибка проверки кода'
        );
      }
    } catch {
      setOtpError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setIsVerifying(false);
    }
  }, [userEmail, otpCode, userName, selectedCity, setIsAuthenticated, setShowAuthModal, setShowGameSettings]);

  const resetForm = () => {
    setRegistrationStep(1);
    setUserName('');
    setUserEmail('');
    setOtpCode('');
    setSelectedCity('');
    setCitySearch('');
    setOtpError('');
  };

  if (!showAuthModal) return null;

  const handleNextStep = () => {
    if (registrationStep === 1 && userName.trim()) {
      setRegistrationStep(2);
    } else if (registrationStep === 2 && selectedCity) {
      setRegistrationStep(3);
    } else if (registrationStep === 3 && userEmail.trim() && userEmail.includes('@')) {
      sendOtp();
    } else if (registrationStep === 4 && otpCode.replace(/\s/g, '').length === 6) {
      verifyOtp();
    }
  };

  const handleBack = () => {
    setOtpError('');
    if (registrationStep === 4) {
      setRegistrationStep(3);
      setOtpCode('');
    } else if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtpCode('');
    setOtpError('');
    sendOtp();
  };

  const stepTitles: Record<number, string> = {
    1: 'Как вас зовут?',
    2: 'Ваш город',
    3: 'Электронная почта',
    4: 'Введите код'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowAuthModal(false)}>
      <Card className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            {registrationStep > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400"
              >
                <Icon name="ChevronLeft" size={24} />
              </Button>
            )}
            <CardTitle className="flex-1 text-center text-gray-900 dark:text-white">
              {stepTitles[registrationStep]}
            </CardTitle>
            {registrationStep > 1 && <div className="w-10" />}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`h-1.5 w-10 rounded-full transition-colors ${
                registrationStep >= step ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
              }`} />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {registrationStep === 1 && (
            <NameStep
              userName={userName}
              setUserName={setUserName}
              handleNextStep={handleNextStep}
            />
          )}

          {registrationStep === 2 && (
            <CityStep
              citySearch={citySearch}
              setCitySearch={setCitySearch}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              showCityDropdown={showCityDropdown}
              setShowCityDropdown={setShowCityDropdown}
              handleNextStep={handleNextStep}
            />
          )}

          {registrationStep === 3 && (
            <EmailStep
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              handleNextStep={handleNextStep}
              isSending={isSending}
            />
          )}

          {registrationStep === 4 && (
            <OtpStep
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              handleNextStep={handleNextStep}
              userEmail={userEmail}
              isVerifying={isVerifying}
              otpError={otpError}
              onResend={handleResend}
              resendTimer={resendTimer}
            />
          )}

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Регистрируясь, вы соглашаетесь с правилами сервиса
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
