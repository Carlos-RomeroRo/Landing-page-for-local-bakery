import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NosotrosPage } from './pages/nosotros/nosotros';
import { ProductsPage } from './pages/products/products';
import { ContactPage } from './pages/contact/contact';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'nosotros', component: NosotrosPage },
  { path: 'productos', component: ProductsPage },
  { path: 'contacto', component: ContactPage },
];
