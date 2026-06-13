/// <reference types="vite/client" />

declare module "*.css" {}

declare const bootstrap: {
  Toast: { getOrCreateInstance: (el: HTMLElement) => { show: () => void } };
  Modal: { new (el: HTMLElement): { show: () => void; hide: () => void }; getInstance: (el: HTMLElement) => { hide: () => void } | null };
  Offcanvas: new (el: HTMLElement) => { show: () => void };
};
