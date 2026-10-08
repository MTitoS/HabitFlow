import { useEffect, useState } from 'react';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { RetroEditCard } from '@/components/feature/RetroEditCard';
import { getRetroEditEnabled, setRetroEditEnabled } from '@/services/prefs';

export default function AdvancedScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getRetroEditEnabled().then((value) => {
      setEnabled(value);
      setLoaded(true);
    });
  }, []);

  const onChange = (value: boolean) => {
    setEnabled(value);
    void setRetroEditEnabled(value);
  };

  return (
    <AppScaffold title="Avançado">
      {loaded ? <RetroEditCard enabled={enabled} onChange={onChange} /> : null}
    </AppScaffold>
  );
}
