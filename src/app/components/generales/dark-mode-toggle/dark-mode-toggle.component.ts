import { Component, inject } from '@angular/core';

import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-dark-mode-toggle',
  standalone: true,
  templateUrl: './dark-mode-toggle.component.html',
  styleUrl: './dark-mode-toggle.component.css',
})
export class DarkModeToggleComponent {
  readonly theme = inject(ThemeService);
}
