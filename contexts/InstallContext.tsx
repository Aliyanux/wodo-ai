import React, { createContext, useContext, ReactNode } from 'react';
import useInstallPrompt from '../hooks/useInstallPrompt';

interface InstallContextType {
  installPrompt: () => void;
  canInstall: boolean;
}

const InstallContext = createContext<InstallContextType | undefined>(undefined);

export const InstallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { installPrompt, canInstall } = useInstallPrompt();

  return (
    <InstallContext.Provider value={{ installPrompt, canInstall }}>
      {children}
    </InstallContext.Provider>
  );
};

export const useInstall = (): InstallContextType => {
  const context = useContext(InstallContext);
  if (context === undefined) {
    throw new Error('useInstall must be used within an InstallProvider');
  }
  return context;
};
