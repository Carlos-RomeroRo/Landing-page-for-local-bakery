import { Component } from '@angular/core';
import { ProductSearch } from '../../components/product_Page/product-search/product-search';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [ProductSearch, Footer],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsPage {}
