import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">

      <div class="auth-deco">
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
        <div class="deco-circle deco-circle-3"></div>
      </div>

      <div class="auth-card fate-card">

        <div class="auth-header">
          <h1 class="auth-title">Fate<span class="slash">/</span>DnD</h1>
          <p class="auth-subtitle">REGISTRO DE NUEVO MAESTRO</p>
        </div>

        <div class="fate-divider">
          <span>Datos del Maestro</span>
        </div>

        @if (error) {
          <div class="fate-alert fate-alert-error mb-2">{{ error }}</div>
        }

        @if (success) {
          <div class="fate-alert fate-alert-success mb-2">
            ¡Registro exitoso! Revisa tu correo para confirmar tu cuenta, luego
            <a routerLink="/login">inicia sesión</a>.
          </div>
        }

        @if (!success) {
          <form class="fate-form" (ngSubmit)="onRegister()">

            <div class="form-row">
              <div class="form-group">
                <label for="username">Nombre de usuario</label>
                <input
                  id="username"
                  type="text"
                  class="fate-input"
                  placeholder="master_kiritsugu"
                  [(ngModel)]="username"
                  name="username"
                  required
                />
              </div>

              <div class="form-group">
                <label for="characterName">Nombre del personaje</label>
                <input
                  id="characterName"
                  type="text"
                  class="fate-input"
                  placeholder="Kiritsugu Emiya"
                  [(ngModel)]="characterName"
                  name="characterName"
                  required
                />
              </div>
            </div>

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

            <div class="form-row">
              <div class="form-group">
                <label for="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  class="fate-input"
                  placeholder="Mínimo 6 caracteres"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="new-password"
                />
              </div>

              <div class="form-group">
                <label for="confirm">Confirmar contraseña</label>
                <input
                  id="confirm"
                  type="password"
                  class="fate-input"
                  placeholder="Repite la contraseña"
                  [(ngModel)]="confirmPassword"
                  name="confirm"
                  required
                  autocomplete="new-password"
                />
              </div>
            </div>

            <div class="terms-note">
              Al registrarte aceptas participar en la
              <span class="text-gold">Guerra del Santo Grial</span>
              y todas sus consecuencias.
            </div>

            <button
              type="submit"
              class="fate-btn fate-btn-primary w-full"
              [disabled]="loading"
            >
              @if (loading) {
                <span style="display:flex;align-items:center;justify-content:center;gap:8px;">
                  <span class="fate-spinner" style="width:16px;height:16px;border-width:2px;"></span>
                  Estableciendo contrato...
                </span>
              } @else {
                Establecer Contrato
              }
            </button>

          </form>
        }

        <div class="fate-divider mt-3">
          <span>¿Ya tienes cuenta?</span>
        </div>

        <p class="auth-link-text">
          <a routerLink="/login">Volver al inicio de sesión</a>
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
      width: 400px; height: 400px;
      top: -150px; right: -100px;
      border-color: rgba(233, 30, 140, 0.08);
    }

    .deco-circle-2 {
      width: 300px; height: 300px;
      bottom: -80px; left: -80px;
      border-color: rgba(212, 175, 55, 0.08);
    }

    .deco-circle-3 {
      width: 200px; height: 200px;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      border-color: rgba(0, 212, 255, 0.04);
    }

    .auth-card {
      width: 100%;
      max-width: 520px;
      position: relative;
      z-index: 1;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .auth-title {
      font-family: var(--font-display);
      font-size: 2rem;
      color: var(--fate-white);
      margin-bottom: 0.5rem;
    }

    .auth-title .slash { color: var(--fate-gold); }

    .auth-subtitle {
      font-family: var(--font-heading);
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      color: var(--fate-muted);
      text-transform: uppercase;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 480px) {
      .form-row { grid-template-columns: 1fr; }
    }

    .terms-note {
      font-size: 0.78rem;
      color: var(--fate-muted);
      text-align: center;
      padding: 0.5rem;
      border: 1px dashed var(--fate-border);
      border-radius: var(--radius-sm);
    }

    .auth-link-text {
      text-align: center;
      font-size: 0.85rem;
      color: var(--fate-muted);
    }

    .auth-link-text a { color: var(--fate-magenta); }
  `]
})
export class RegisterComponent {
  username = '';
  characterName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onRegister() {
    this.error = '';

    if (!this.username || !this.characterName || !this.email || !this.password) {
      this.error = 'Completa todos los campos.';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.username.includes(' ')) {
      this.error = 'El nombre de usuario no puede tener espacios.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.signUp(
        this.email,
        this.password,
        this.username,
        this.characterName
      );
      this.success = true;
    } catch (err: any) {
      this.error = err.message ?? 'Error al registrarse.';
    } finally {
      this.loading = false;
    }
  }
}