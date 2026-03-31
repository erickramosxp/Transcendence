import "@testing-library/jest-dom";
import { vi } from "vitest";

const storage = {
  lang: "pt",
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
    storage.lang = "pt";
  }),
};

vi.stubGlobal("localStorage", localStorageMock);
// vi.stubGlobal("window", { localStorage: localStorageMock });

beforeAll(async () => {
  await import("@/i18n");
});