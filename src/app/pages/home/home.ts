import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { About } from '../../components/about-us/about-us';
import { Product } from '../../components/product/product';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, About, Product, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
