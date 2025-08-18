import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from 'react-responsive';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { toast } = useToast();

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed && isMobile) setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isMobile]);

  if (!visible || !deferredPrompt) return null;

  const install = async () => {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({ title: 'App installed', description: 'Rush Delivery was added to your home screen.' });
      }
      setVisible(false);
      setDeferredPrompt(null);
    } catch (e) {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    localStorage.setItem('pwa_install_dismissed', '1');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-6 md:bottom-6 md:w-96">
      <div className="bg-background border shadow-lg rounded-lg p-4 flex items-center gap-3">
        <img src="/logo.png" alt="Rush Delivery" className="h-10 w-10 rounded" />
        <div className="flex-1">
          <p className="font-medium">Install Rush Delivery</p>
          <p className="text-sm text-muted-foreground">Get quick access from your home screen.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={dismiss} aria-label="Dismiss install">
            Not now
          </Button>
          <Button size="sm" onClick={install} aria-label="Install app">
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
