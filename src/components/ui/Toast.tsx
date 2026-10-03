import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { ColorToken } from '@/theme/types';
import { OPEN } from '@/config/opens';

export type ToastKind = 'success' | 'error' | 'skip' | 'info';

interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
}

interface ToastContextValue {
  showToast: (kind: ToastKind, title: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_META: Record<ToastKind, { token: ColorToken; symbol: string }> = {
  success: { token: 'success', symbol: '✓' },
  error: { token: 'danger', symbol: '✕' },
  skip: { token: 'accent', symbol: '—' },
  info: { token: 'primary', symbol: 'ℹ' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((kind: ToastKind, title: string) => {
    counter.current += 1;
    const id = counter.current;
    setToasts((current) => [...current.slice(-2), { id, kind, title }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="none"
        style={[
          styles.host,
          { justifyContent: OPEN.TOAST_POSITION === 'top' ? 'flex-start' : 'flex-end' },
        ]}
      >
        {toasts.map((toast) => (
          <ToastView key={toast.id} toast={toast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastView({ toast }: { toast: ToastMessage }) {
  const theme = useTheme();
  const meta = KIND_META[toast.kind];
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        {
          backgroundColor: theme.color('surfaceElevated'),
          borderColor: theme.color(meta.token),
        },
      ]}
    >
      <RNText style={[styles.symbol, { color: theme.color(meta.token) }]}>{meta.symbol}</RNText>
      <RNText style={{ color: theme.color('textPrimary'), flex: 1 }}>{toast.title}</RNText>
    </View>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingTop: spacing.huge,
    gap: spacing.sm,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 240,
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
  },
});