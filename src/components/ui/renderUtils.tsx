import { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme/Provider';
import { ToastProvider } from '@/components/ui/Toast';

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

export async function renderWithProviders(ui: ReactElement) {
  const result = await render(ui, { wrapper: AllProviders });
  return result;
}