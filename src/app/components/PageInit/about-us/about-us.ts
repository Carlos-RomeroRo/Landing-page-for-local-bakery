import { Component } from '@angular/core';
import { Carousel, CarouselItem } from './carousel-item/carousel-item';

@Component({
  selector: 'app-about',
  standalone: true, 
  imports: [Carousel],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css'
})
export class About {
  carouselItems: CarouselItem[] = [
    {
      number: '01',
      image: 'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777735324/Carrousel-img3_bnykzv.png',
      title: 'Nuestra Historia',
      description: 'Desde 1995, horneando tradición en Zapatoca. Empezamos como una familia y seguimos siendo familia para nuestros clientes.'
    },
    {
      number: '02',
      image: 'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777735324/Carrousel-img2_cnmlxr.png',
      title: 'Pan Artesanal',
      description: 'Cada pieza es amasada a mano con ingredientes locales. Sin aditivos, sin prisas, solo el sabor auténtico del pan tradicional.'
    },
    {
      number: '03',
      image: 'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777735324/Carrousel-img1_aqvn6h.png',
      title: 'Ingredientes Selectos',
      description: 'Harina de trigo local, mantequilla de primera, y el tiempo necesario para que cada hornada sea perfecta.'
    }
  ];
}