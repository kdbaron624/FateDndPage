import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'character-sheet',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/character-sheet/character-sheet.component').then(m => m.CharacterSheetComponent)
  },
   {
     path: 'profile', 
     canActivate: [authGuard],
     loadComponent: () =>
       import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'servant-sheet', 
    canActivate: [authGuard],
     loadComponent: () =>
       import('./pages/servant-sheet/servant-sheet.component').then(m => m.ServantSheetComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];