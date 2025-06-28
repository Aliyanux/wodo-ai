import { useState, useEffect } from 'react';
import { BeforeInstallPromptEvent } from '../types';

const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
        setDeferredPrompt(null);
        setCanInstall(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const installPrompt = () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
  };

  return { installPrompt, canInstall };
};

export default useInstallPrompt;
