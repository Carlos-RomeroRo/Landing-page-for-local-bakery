import { Component } from '@angular/core';
import { Hero } from '../../components/PageInit/hero/hero';
import { About } from '../../components/PageInit/about-us/about-us';
import { Product } from '../../components/PageInit/product/product';
import { Footer } from '../../components/generales/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, About, Product, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
