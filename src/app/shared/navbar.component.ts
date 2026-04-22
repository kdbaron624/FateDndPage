import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-text">Fate</span>
        <span class="brand-sep">/</span>
        <span class="brand-sub">Lost Continuum</span>
      </div>

      <button class="nav-hamburger" (click)="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>

      <div class="nav-links" [class.open]="menuOpen">
        <a routerLink="/home"
           routerLinkActive="active"
           (click)="menuOpen = false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Inicio
        </a>
        <a routerLink="/profile"
           routerLinkActive="active"
           (click)="menuOpen = false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Perfil
        </a>
        <a routerLink="/character-sheet"
           routerLinkActive="active"
           (click)="menuOpen = false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Personaje
        </a>
        <a routerLink="/servant-sheet"
           routerLinkActive="active"
           (click)="menuOpen = false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Servant
        </a>

        <div class="nav-divider"></div>

        <button class="fate-btn fate-btn-sm nav-logout" (click)="logout()">
          Salir
        </button>
      </div>
    </nav>
  `,
  styles: [`
  .navbar {
    background: var(--fate-panel);
    border-bottom: 1px solid var(--fate-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .navbar::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--fate-blue),
      var(--fate-cyan),
      var(--fate-blue),
      transparent
    );
  }

  .navbar-brand {
    display: flex;
    align-items: baseline;
    gap: 2px;
    font-family: var(--font-display);
    font-size: 1.2rem;
    user-select: none;
  }

  .brand-text { color: var(--fate-blue-bright); }
  .brand-sep  { color: var(--fate-cyan); font-size: 1.4rem; }
  .brand-sub  { color: var(--fate-white); font-size: 0.9rem; }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .nav-links a {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--fate-muted-bright);
    font-family: var(--font-heading);
    font-size: 0.76rem;
    letter-spacing: 0.08em;
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .nav-links a:hover {
    color: var(--fate-blue-bright);
    background: var(--fate-blue-glow);
  }

  .nav-links a.active {
    color: var(--fate-cyan);
    background: var(--fate-blue-glow);
    border-bottom: 1px solid var(--fate-cyan);
  }

  .nav-divider {
    width: 1px;
    height: 24px;
    background: var(--fate-border);
    margin: 0 0.5rem;
  }

  .nav-logout { font-size: 0.72rem; padding: 0.35rem 0.9rem; }

  .nav-hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .nav-hamburger span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--fate-blue);
    border-radius: 2px;
    transition: all 0.2s ease;
  }

  @media (max-width: 700px) {
    .nav-hamburger { display: flex; }

    .nav-links {
      display: none;
      position: absolute;
      top: 60px;
      left: 0; right: 0;
      background: var(--fate-panel);
      border-bottom: 1px solid var(--fate-border);
      flex-direction: column;
      align-items: stretch;
      padding: 1rem;
      gap: 0.5rem;
    }

    .nav-links.open { display: flex; }

    .nav-links a { padding: 0.75rem 1rem; font-size: 0.85rem; }

    .nav-divider { width: 100%; height: 1px; margin: 0.25rem 0; }
  }
`]
})
export class NavbarComponent {
  menuOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  async logout() {
    await this.auth.signOut();
  }
}