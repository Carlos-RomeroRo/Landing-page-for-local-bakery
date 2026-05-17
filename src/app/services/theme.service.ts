import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'zapatoca-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isDark = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isDark.set(this.readStoredPreference());
    this.applyToDocument();
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isDark.update((dark) => !dark);
    this.persist();
    this.applyToDocument();
  }

  tooltipLabel(): string {
    return this.isDark() ? 'Activar modo claro' : 'Activar modo oscuro';
  }

  private readStoredPreference(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') {
      return true;
    }
    if (stored === 'light') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, this.isDark() ? 'dark' : 'light');
  }

  private applyToDocument(): void {
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
