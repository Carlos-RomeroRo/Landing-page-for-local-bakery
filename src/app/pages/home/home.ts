import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { WhatsappButton } from '../../components/whatsapp-button/whatsapp-button';
import { About } from '../../components/about-us/about-us';
import { Product } from '../../components/product/product';
@Component({
  selector: 'app-home',
  imports: [Navbar, Hero, WhatsappButton, About, Product],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
