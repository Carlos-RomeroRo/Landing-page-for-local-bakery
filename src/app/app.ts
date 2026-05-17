import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/generales/navbar/navbar';
import { WhatsappButton } from './components/whatsapp-button/whatsapp-button';
import { Modal } from './components/modal/modal';
import { PageIntroSplashComponent } from './components/generales/page-intro-splash/page-intro-splash.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, WhatsappButton, Modal, PageIntroSplashComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('zapatoca-landing');
}
