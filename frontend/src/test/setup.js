import "@testing-library/jest-dom";
import { vi } from "vitest";

const storage = {
  lang: "pt-BR",
};

const localStorageMock = {
  getItem: vi.fn((key) => storage[key] ?? null),
  setItem: vi.fn((key, value) => {
    storage[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete storage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    storage.lang = "pt-BR";
  }),
};

vi.stubGlobal("localStorage", localStorageMock);

vi.stubGlobal('matchMedia', (query) => ({
  matches: query.includes('dark'),
  media: query,
  onchange: null,
  addListener: () => { },
  removeListener: () => { },
  addEventListener: () => { },
  removeEventListener: () => { },
  dispatchEvent: () => false,
}));

// vi.stubGlobal("window", { localStorage: localStorageMock });

beforeAll(async () => {
  await import("@/i18n");
});