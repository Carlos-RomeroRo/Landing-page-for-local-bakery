import { Component } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { AboutUs } from '../../components/about-us-page/about-us/about-us';

@Component({
  selector: 'app-nosotros-page',
  standalone: true,
  imports: [Footer, AboutUs],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
})
export class NosotrosPage {}
