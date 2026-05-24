import { Component } from '@angular/core';

import { Contact } from '../../components/PageInit/contact/contact';
import { Footer } from '../../components/generales/footer/footer';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [Contact, Footer],
  templateUrl: './contact.html',
})
export class ContactPage {}
