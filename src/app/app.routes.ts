import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback';
import { HomeComponent } from './pages/home/home';
import { authGuard } from './auth-guard';
import { loginRedirectGuard } from './loginRedirect-guard';
import { CalendarComponent } from './pages/calendar/calendar';
import { BoardsComponent } from './pages/boards/boards';
import { ProfileComponent } from './pages/profile/profile';
import { AppLayoutComponent } from './layouts/app-layout/app-layout';
import { DayComponent } from './components/day/day';
import { BoardComponent } from './components/board/board';

export const routes: Routes = [
  // Auth routes (standalone layout)
  { path: 'auth', component: AuthComponent, canActivate: [loginRedirectGuard] },
  { path: 'auth/callback', component: AuthCallbackComponent },

  // App routes (shared layout)
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'day/:dayId', component: DayComponent },
      { path: 'boards', component: BoardsComponent },
      { path: 'boards/:boardId', component: BoardComponent,},
      { path: 'profile', component: ProfileComponent },
    ],
  },
];
