import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <div class="app-container">
      @if (auth.user()) {
        <app-navbar />
      }
      <main class="page-content">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}