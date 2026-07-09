export const THEMES = [
  { value: 'vs', label: 'Light', icon: 'IconSun' },
  { value: 'vs-dark', label: 'Dark', icon: 'IconMoon' },
  { value: 'hc-black', label: 'High Contrast', icon: 'IconContrast' },
];
export const BASE_OPTIONS = { minimap: { enabled: false }, scrollBeyondLastLine: false, formatOnPaste: true, fixedOverflowWidgets: true };
export const DIFF_OPTIONS = { ...BASE_OPTIONS, readOnly: true };
export const EDITOR_HEIGHT = '60vh';

export const getStats = (raw) => {
  const lines = raw?.split('\n').length;
  const bytes = new TextEncoder().encode(raw ?? '').length;
  const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  return `${lines} lines · ${size}`;
};
