import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ProductsPage } from './pages/products/products';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'productos', component: ProductsPage },
];
