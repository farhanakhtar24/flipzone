import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Server-only modules are mocked per-test; stub fetch JSON for hooks.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
