import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">

      <div class="auth-deco">
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
      </div>

      <div class="auth-card fate-card">

        <div class="auth-header">
          <h1 class="auth-title">Fate<span class="slash">/</span>DnD</h1>
          <p class="auth-subtitle">SISTEMA DE ROL — ACCESO DE MAESTRO</p>
        </div>

        <div class="fate-divider">
          <span>Identificación</span>
        </div>

        @if (error) {
          <div class="fate-alert fate-alert-error mb-2">{{ error }}</div>
        }

        <form class="fate-form" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              class="fate-input"
              placeholder="master@holygrail.com"
              [(ngModel)]="email"
              name="email"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              class="fate-input"
              placeholder="••••••••"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="fate-btn fate-btn-primary w-full"
            [disabled]="loading"
          >
            @if (loading) {
              <span class="btn-loading">
                <span class="fate-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span>
                Invocando...
              </span>
            } @else {
              Entrar al Sistema
            }
          </button>
        </form>

        <div class="fate-divider mt-3">
          <span>¿Sin cuenta?</span>
        </div>

        <p class="auth-link-text">
          ¿Primera vez en la Guerra del Santo Grial?
          <a routerLink="/register">Regístrate aquí</a>
        </p>

      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      position: relative;
      overflow: hidden;
    }

    .auth-deco {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .deco-circle {
      position: absolute;
      border-radius: 50%;
      border: 1px solid;
    }

    .deco-circle-1 {
      width: 500px; height: 500px;
      top: -200px; right: -150px;
      border-color: rgba(233, 30, 140, 0.08);
    }

    .deco-circle-2 {
      width: 350px; height: 350px;
      bottom: -100px; left: -100px;
      border-color: rgba(212, 175, 55, 0.08);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 1;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .auth-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      color: var(--fate-white);
      margin-bottom: 0.5rem;
    }

    .auth-title .slash {
      color: var(--fate-gold);
    }

    .auth-subtitle {
      font-family: var(--font-heading);
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      color: var(--fate-muted);
      text-transform: uppercase;
    }

    .auth-link-text {
      text-align: center;
      font-size: 0.85rem;
      color: var(--fate-muted);
    }

    .auth-link-text a {
      color: var(--fate-magenta);
      margin-left: 4px;
    }

    .btn-loading {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

    async onLogin() {
    if (!this.email || !this.password) {
        this.error = 'Completa todos los campos.';
        return;
    }
    this.loading = true;
    this.error = '';
    try {
        console.log('Intentando login:', { email: this.email.trim(), passwordLength: this.password.length });
        await this.auth.signIn(this.email, this.password);
        this.router.navigate(['/home']);
    } catch (err: any) {
        console.error('Error login completo:', err);
        this.error = err.message ?? 'Error al iniciar sesión.';
    } finally {
        this.loading = false;
    }
    }
}