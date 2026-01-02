import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback';
import { HomeComponent } from './pages/home/home';
import { authGuard } from './auth-guard';
import { loginRedirectGuard } from './loginRedirect-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect to auth for now TODO: Fix routing
  { path: 'auth', component: AuthComponent, canActivate: [loginRedirectGuard] },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
];
