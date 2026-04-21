export const THEMES = [
  { value: 'vs', label: 'Light Theme' },
  { value: 'vs-dark', label: 'Dark Theme' },
  { value: 'hc-black', label: 'High Contrast Theme' },
];
export const BASE_OPTIONS = { minimap: { enabled: false }, scrollBeyondLastLine: false, formatOnPaste: true, fixedOverflowWidgets: true };
export const DIFF_OPTIONS = { ...BASE_OPTIONS, readOnly: true };
export const EDITOR_HEIGHT = '60vh';

export const getStats = (raw) => {
  const lines = raw?.split('\n').length;
  const bytes = new Blob([raw]).size;
  const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  return `${lines} lines · ${size}`;
};
