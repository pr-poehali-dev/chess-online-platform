import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { NameStep, EmailStep, CityStep, CodeStep } from './RegistrationSteps';

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
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser && showAuthModal) {
      const userData = JSON.parse(savedUser);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setShowGameSettings(true);
    }
  }, [showAuthModal, setIsAuthenticated, setShowAuthModal, setShowGameSettings]);

  if (!showAuthModal) return null;

  const handleNextStep = () => {
    if (registrationStep === 1 && userName.trim()) {
      setRegistrationStep(2);
    } else if (registrationStep === 2 && selectedCity) {
      setRegistrationStep(3);
    } else if (registrationStep === 3 && userEmail.trim()) {
      setRegistrationStep(4);
    } else if (registrationStep === 4 && verificationCode.length === 6) {
      const userData = { name: userName, email: userEmail, city: selectedCity, verified: true };
      localStorage.setItem('chessUser', JSON.stringify(userData));
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setShowGameSettings(true);
      setRegistrationStep(1);
      setUserName('');
      setUserEmail('');
      setSelectedCity('');
      setCitySearch('');
      setVerificationCode('');
    }
  };

  const handleBack = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1);
    }
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
              {registrationStep === 1 && 'Как вас зовут?'}
              {registrationStep === 2 && 'Ваш город'}
              {registrationStep === 3 && 'Электронная почта'}
              {registrationStep === 4 && 'Код подтверждения'}
            </CardTitle>
            {registrationStep > 1 && <div className="w-10" />}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-1.5 w-10 rounded-full transition-colors ${
              registrationStep >= 1 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`h-1.5 w-10 rounded-full transition-colors ${
              registrationStep >= 2 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`h-1.5 w-10 rounded-full transition-colors ${
              registrationStep >= 3 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`h-1.5 w-10 rounded-full transition-colors ${
              registrationStep >= 4 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
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
            />
          )}

          {registrationStep === 4 && (
            <CodeStep
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              handleNextStep={handleNextStep}
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