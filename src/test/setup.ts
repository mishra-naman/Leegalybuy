import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});
Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  value: function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  },
});
Object.defineProperty(HTMLDialogElement.prototype, 'close', {
  value: function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  },
});
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
});
