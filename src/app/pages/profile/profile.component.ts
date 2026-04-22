import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { CharacterService } from '../../core/services/character.service';
import { ServantService } from '../../core/services/servant.service';
import { PostService } from '../../core/services/post.service';
import { Profile, CharacterSheet, Servant, Post } from '../../core/models/models';
import { DndModifierPipe, getModifier } from '../../core/pipes/dnd-modifier.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DndModifierPipe],
  template: `
    <div class="profile-wrapper">

      <!-- BANNER + INFO PRINCIPAL -->
      <div class="profile-banner fate-card">
        <div class="banner-bg"></div>
        <div class="banner-content">

          <!-- Avatar -->
          <div class="avatar-section">
            <div class="avatar-wrap">
              @if (profile?.avatar_url) {
                <img [src]="profile!.avatar_url"
                     class="profile-avatar" alt="avatar"/>
              } @else {
                <div class="profile-avatar-placeholder">
                  {{ getInitials() }}
                </div>
              }
              @if (editMode) {
                <label class="avatar-edit-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <input type="file" accept="image/*"
                         (change)="onAvatarSelected($event)" hidden/>
                </label>
              }
            </div>
          </div>

          <!-- Info -->
          <div class="profile-info">
            @if (!editMode) {
              <h1 class="profile-username">{{ profile?.username ?? '...' }}</h1>
              <p class="profile-charname text-magenta">
                {{ profile?.character_name ?? '' }}
              </p>
              <p class="profile-bio text-muted">
                {{ profile?.bio || 'Sin descripción aún...' }}
              </p>
              <p class="profile-since text-muted">
                Maestro desde {{ formatDate(profile?.created_at) }}
              </p>
            } @else {
              <div class="edit-fields">
                <div class="form-group">
                  <label>Nombre de usuario</label>
                  <input type="text" class="fate-input"
                         [(ngModel)]="editUsername"
                         placeholder="username"/>
                </div>
                <div class="form-group">
                  <label>Nombre del personaje</label>
                  <input type="text" class="fate-input"
                         [(ngModel)]="editCharName"
                         placeholder="Nombre del personaje"/>
                </div>
                <div class="form-group">
                  <label>Biografía</label>
                  <textarea class="fate-input" rows="2"
                            [(ngModel)]="editBio"
                            placeholder="Cuéntanos sobre tu personaje..."
                            maxlength="200"></textarea>
                </div>
              </div>
            }
          </div>

          <!-- Acciones -->
          <div class="profile-actions">
            @if (!editMode) {
              <button class="fate-btn fate-btn-gold"
                      (click)="startEdit()">
                Editar Perfil
              </button>
              <button class="fate-btn"
                      (click)="auth.signOut()">
                Cerrar Sesión
              </button>
            } @else {
              <button class="fate-btn fate-btn-primary"
                      (click)="saveProfile()" [disabled]="savingProfile">
                {{ savingProfile ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
              <button class="fate-btn" (click)="cancelEdit()">
                Cancelar
              </button>
            }
          </div>

        </div>
      </div>

      @if (profileError) {
        <div class="fate-alert fate-alert-error">{{ profileError }}</div>
      }
      @if (profileSuccess) {
        <div class="fate-alert fate-alert-success">
          ✓ Perfil actualizado correctamente
        </div>
      }

      <!-- STATS RÁPIDOS -->
      <div class="quick-stats-grid">
        <div class="quick-stat-card fate-card">
          <span class="qs-icon text-magenta">⚔</span>
          <div>
            <p class="qs-label text-muted">Clase</p>
            <p class="qs-value">{{ sheet?.class || '—' }}</p>
          </div>
        </div>
        <div class="quick-stat-card fate-card">
          <span class="qs-icon text-gold">★</span>
          <div>
            <p class="qs-label text-muted">Nivel</p>
            <p class="qs-value">{{ sheet?.level || '—' }}</p>
          </div>
        </div>
        <div class="quick-stat-card fate-card">
          <span class="qs-icon text-cyan">♦</span>
          <div>
            <p class="qs-label text-muted">Servant</p>
            <p class="qs-value">
              {{ servant ? (servant.alias || servant.class_name) : '—' }}
            </p>
          </div>
        </div>
        <div class="quick-stat-card fate-card">
          <span class="qs-icon text-magenta">✦</span>
          <div>
            <p class="qs-label text-muted">Publicaciones</p>
            <p class="qs-value">{{ userPosts.length }}</p>
          </div>
        </div>
      </div>

      <!-- GRID PRINCIPAL -->
      <div class="profile-grid">

        <!-- COLUMNA IZQUIERDA -->
        <div class="profile-left">

          <!-- RESUMEN DnD -->
          <div class="fate-card">
            <div class="card-header-row">
              <h3 class="section-title text-gold">Estadísticas DnD</h3>
              <a routerLink="/character-sheet"
                 class="fate-btn fate-btn-sm fate-btn-gold">
                Editar
              </a>
            </div>

            @if (sheet) {
              <div class="stats-mini-grid">
                @for (stat of miniStats; track stat.key) {
                  <div class="stat-mini">
                    <span class="stat-mini-label">{{ stat.label }}</span>
                    <span class="stat-mini-value">{{ getStatValue(stat.key) }}</span>
                    <span class="stat-mini-mod"
                      [class.text-cyan]="getModifier(getStatValue(stat.key)) > 0"
                      [class.text-danger]="getModifier(getStatValue(stat.key)) < 0"
                      [class.text-muted]="getModifier(getStatValue(stat.key)) === 0">
                      {{ getStatValue(stat.key) | dndModifier }}
                    </span>
                  </div>
                }
              </div>

              <div class="fate-divider mt-2"><span>Combate</span></div>

              <div class="combat-mini-row">
                <div class="combat-mini">
                  <span class="text-muted">PG</span>
                  <span class="text-cyan">
                    {{ sheet.current_hp }} / {{ sheet.max_hp }}
                  </span>
                </div>
                <div class="combat-mini">
                  <span class="text-muted">CA</span>
                  <span class="text-white">{{ sheet.armor_class }}</span>
                </div>
                <div class="combat-mini">
                  <span class="text-muted">Ini</span>
                  <span class="text-gold">
                    {{ getModifier(sheet.dexterity) >= 0 ? '+' : '' }}{{ getModifier(sheet.dexterity) }}
                  </span>
                </div>
                <div class="combat-mini">
                  <span class="text-muted">Vel</span>
                  <span>{{ sheet.speed }}ft</span>
                </div>
              </div>

              <div class="hp-bar mt-2">
                <div class="hp-fill"
                  [style.width.%]="getHpPercent()"
                  [class.hp-low]="getHpPercent() < 30"
                  [class.hp-mid]="getHpPercent() >= 30 && getHpPercent() < 70">
                </div>
              </div>

            } @else {
              <div class="empty-section">
                <p class="text-muted">Sin hoja de personaje aún.</p>
                <a routerLink="/character-sheet"
                   class="fate-btn fate-btn-sm mt-1">
                  Crear Hoja
                </a>
              </div>
            }
          </div>

          <!-- RESUMEN SERVANT -->
          <div class="fate-card mt-2">
            <div class="card-header-row">
              <h3 class="section-title text-magenta">Servant</h3>
              <a routerLink="/servant-sheet"
                 class="fate-btn fate-btn-sm">
                Editar
              </a>
            </div>

            @if (servant) {
              <div class="servant-mini">
                @if (servant.avatar_url) {
                  <img [src]="servant.avatar_url"
                       class="servant-mini-avatar" alt="servant"/>
                } @else {
                  <div class="servant-mini-placeholder">
                    {{ servant.class_name?.charAt(0) }}
                  </div>
                }
                <div class="servant-mini-info">
                  <p class="servant-mini-name">
                    {{ servant.friendship_level >= 3
                       ? servant.true_name || servant.alias
                       : servant.alias || '???' }}
                  </p>
                  <p class="servant-mini-class text-magenta">
                    {{ servant.class_name }} Class
                  </p>
                  <div class="servant-mini-stars">
                    @for (i of [1,2,3,4,5]; track i) {
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <polygon
                          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                          [attr.fill]="i <= servant.friendship_level ? '#d4af37' : 'none'"
                          [attr.stroke]="i <= servant.friendship_level ? '#d4af37' : '#8a7020'"
                          stroke-width="1.5"/>
                      </svg>
                    }
                  </div>
                </div>
              </div>

              <div class="servant-params-mini mt-2">
                @for (p of servantParamsMini; track p.key) {
                  <div class="param-mini-row">
                    <span class="param-mini-label text-muted">{{ p.label }}</span>
                    <span class="param-mini-rank"
                      [class.text-gold]="getServantRank(p.key) === 'A+' || getServantRank(p.key) === 'EX'"
                      [class.text-cyan]="getServantRank(p.key) === 'A'"
                      [class.text-white]="getServantRank(p.key) === 'B' || getServantRank(p.key) === 'C'"
                      [class.text-muted]="getServantRank(p.key) === 'D' || getServantRank(p.key) === 'E'">
                      {{ getServantRank(p.key) }}
                    </span>
                    <div class="param-mini-bar">
                      <div class="param-mini-fill"
                        [style.width.%]="getServantRankPercent(p.key)">
                      </div>
                    </div>
                  </div>
                }
              </div>

            } @else {
              <div class="empty-section">
                <p class="text-muted">Sin Servant registrado aún.</p>
                <a routerLink="/servant-sheet"
                   class="fate-btn fate-btn-sm mt-1">
                  Registrar Servant
                </a>
              </div>
            }
          </div>

        </div>

        <!-- COLUMNA DERECHA: Posts propios -->
        <div class="profile-right">
          <div class="fate-card">
            <div class="card-header-row">
              <h3 class="section-title text-cyan">Mis Publicaciones</h3>
              <span class="text-muted" style="font-size:0.8rem;">
                {{ userPosts.length }} post{{ userPosts.length !== 1 ? 's' : '' }}
              </span>
            </div>

            @if (loadingPosts) {
              <div class="loading-center">
                <div class="fate-spinner"></div>
              </div>
            }

            @if (!loadingPosts && userPosts.length === 0) {
              <div class="empty-section">
                <p class="text-muted text-center">
                  No has publicado nada aún.
                </p>
                <a routerLink="/home"
                   class="fate-btn fate-btn-sm mt-1">
                  Ir al Feed
                </a>
              </div>
            }

            <div class="user-posts-list">
              @for (post of userPosts; track post.id) {
                <div class="user-post-item">
                  <p class="user-post-content">{{ post.content }}</p>
                  @if (post.image_url) {
                    <img [src]="post.image_url"
                         class="user-post-img" alt="imagen"/>
                  }
                  <div class="user-post-footer">
                    <span class="text-muted" style="font-size:0.72rem;">
                      {{ formatDate(post.created_at) }}
                    </span>
                    <button class="fate-btn fate-btn-sm fate-btn-danger"
                            (click)="deletePost(post)">
                      Eliminar
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Banner */
    .profile-banner { padding: 0; overflow: hidden; }

    .banner-bg {
      height: 80px;
      background: linear-gradient(135deg,
        var(--fate-magenta-glow) 0%,
        var(--fate-gold-glow) 100%);
      border-bottom: 1px solid var(--fate-border);
    }

    .banner-content {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 0 1.5rem 1.5rem;
      flex-wrap: wrap;
    }

    .avatar-section { margin-top: -40px; }

    .avatar-wrap { position: relative; display: inline-block; }

    .profile-avatar {
      width: 90px; height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--fate-panel);
      display: block;
    }

    .profile-avatar-placeholder {
      width: 90px; height: 90px;
      border-radius: 50%;
      background: var(--fate-deep);
      border: 3px solid var(--fate-magenta-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--fate-magenta);
    }

    .avatar-edit-btn {
      position: absolute;
      bottom: 2px; right: 2px;
      background: var(--fate-panel);
      border: 1px solid var(--fate-border);
      border-radius: 50%;
      width: 28px; height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--fate-gold);
      transition: all 0.2s;
    }

    .avatar-edit-btn:hover {
      background: var(--fate-gold-glow);
      border-color: var(--fate-gold);
    }

    .profile-info {
      flex: 1;
      min-width: 200px;
      padding-top: 1rem;
    }

    .profile-username {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      color: var(--fate-white);
    }

    .profile-charname {
      font-family: var(--font-heading);
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      margin-top: 2px;
    }

    .profile-bio {
      font-size: 0.85rem;
      margin-top: 6px;
      max-width: 400px;
      line-height: 1.5;
    }

    .profile-since { font-size: 0.72rem; margin-top: 6px; }

    .edit-fields {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding-top: 0.5rem;
    }

    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 1rem;
      flex-shrink: 0;
    }

    /* Quick stats */
    .quick-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }

    @media (max-width: 700px) {
      .quick-stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .quick-stat-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
    }

    .qs-icon { font-size: 1.4rem; flex-shrink: 0; }

    .qs-label {
      font-family: var(--font-heading);
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .qs-value {
      font-family: var(--font-heading);
      font-size: 1rem;
      color: var(--fate-white);
      margin-top: 2px;
    }

    /* Profile grid */
    .profile-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.25rem;
      align-items: start;
    }

    @media (max-width: 900px) {
      .profile-grid { grid-template-columns: 1fr; }
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    /* Stats mini */
    .stats-mini-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .stat-mini {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--fate-deep);
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-sm);
      padding: 0.5rem;
      gap: 2px;
    }

    .stat-mini-label {
      font-family: var(--font-heading);
      font-size: 0.58rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--fate-muted);
    }

    .stat-mini-value {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--fate-white);
    }

    .stat-mini-mod {
      font-family: var(--font-heading);
      font-size: 0.75rem;
    }

    .combat-mini-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .combat-mini {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      flex: 1;
      min-width: 50px;
    }

    .combat-mini span:first-child {
      font-family: var(--font-heading);
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .combat-mini span:last-child {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 600;
    }

    .hp-bar {
      height: 5px;
      background: var(--fate-border);
      border-radius: 3px;
      overflow: hidden;
    }

    .hp-fill {
      height: 100%;
      background: var(--fate-cyan);
      border-radius: 3px;
      transition: width 0.3s;
    }

    .hp-fill.hp-mid { background: var(--fate-gold); }
    .hp-fill.hp-low { background: var(--fate-danger); }

    /* Servant mini */
    .servant-mini {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .servant-mini-avatar {
      width: 64px; height: 64px;
      border-radius: var(--radius-md);
      object-fit: cover;
      border: 1px solid var(--fate-magenta-dim);
      flex-shrink: 0;
    }

    .servant-mini-placeholder {
      width: 64px; height: 64px;
      border-radius: var(--radius-md);
      background: var(--fate-deep);
      border: 1px dashed var(--fate-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 1.4rem;
      color: var(--fate-magenta-dim);
      flex-shrink: 0;
    }

    .servant-mini-name {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      color: var(--fate-white);
    }

    .servant-mini-class {
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      margin-top: 2px;
    }

    .servant-mini-stars {
      display: flex;
      gap: 2px;
      margin-top: 4px;
    }

    .servant-params-mini {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .param-mini-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
    }

    .param-mini-label {
      font-family: var(--font-heading);
      font-size: 0.65rem;
      letter-spacing: 0.06em;
      min-width: 32px;
    }

    .param-mini-rank {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      font-weight: 700;
      min-width: 24px;
      text-align: center;
    }

    .param-mini-bar {
      flex: 1;
      height: 3px;
      background: var(--fate-border);
      border-radius: 2px;
      overflow: hidden;
    }

    .param-mini-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--fate-magenta), var(--fate-gold));
      border-radius: 2px;
      transition: width 0.3s;
    }

    /* Posts */
    .user-posts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 600px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .user-post-item {
      background: var(--fate-deep);
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-md);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-post-content {
      font-size: 0.88rem;
      color: var(--fate-white);
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .user-post-img {
      max-width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--fate-border);
    }

    .user-post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .empty-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      gap: 0.5rem;
    }

    .text-white { color: var(--fate-white); }
  `]
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  sheet: CharacterSheet | null = null;
  servant: Servant | null = null;
  userPosts: Post[] = [];

  editMode = false;
  editUsername = '';
  editCharName = '';
  editBio = '';

  savingProfile = false;
  loadingPosts = false;
  profileError = '';
  profileSuccess = false;

  miniStats = [
    { key: 'strength',     label: 'FUE' },
    { key: 'dexterity',    label: 'DES' },
    { key: 'constitution', label: 'CON' },
    { key: 'intelligence', label: 'INT' },
    { key: 'wisdom',       label: 'SAB' },
    { key: 'charisma',     label: 'CAR' },
  ];

  servantParamsMini = [
    { key: 'strength',  label: 'STR' },
    { key: 'endurance', label: 'END' },
    { key: 'agility',   label: 'AGI' },
    { key: 'mana',      label: 'MGI' },
    { key: 'luck',      label: 'LCK' },
    { key: 'np',        label: 'NP' },
  ];

  constructor(
    public auth: AuthService,
    private profileService: ProfileService,
    private charService: CharacterService,
    private servantService: ServantService,
    private postService: PostService
  ) {}

  async ngOnInit() {
    if (!this.auth.currentUserId) return;
    const uid = this.auth.currentUserId;
    await Promise.all([
      this.loadProfile(uid),
      this.loadSheet(uid),
      this.loadServant(uid),
      this.loadPosts(uid)
    ]);
  }

  async loadProfile(uid: string) {
    this.profile = await this.profileService.getProfile(uid);
  }

  async loadSheet(uid: string) {
    this.sheet = await this.charService.getSheet(uid);
  }

  async loadServant(uid: string) {
    this.servant = await this.servantService.getServant(uid);
  }

  async loadPosts(uid: string) {
    this.loadingPosts = true;
    try {
      const all = await this.postService.getPosts();
      this.userPosts = all.filter(p => p.user_id === uid);
    } finally {
      this.loadingPosts = false;
    }
  }

  startEdit() {
    this.editMode = true;
    this.editUsername = this.profile?.username ?? '';
    this.editCharName = this.profile?.character_name ?? '';
    this.editBio = this.profile?.bio ?? '';
    this.profileError = '';
    this.profileSuccess = false;
  }

  cancelEdit() {
    this.editMode = false;
    this.profileError = '';
  }

  async saveProfile() {
    if (!this.auth.currentUserId) return;
    if (!this.editUsername.trim()) {
      this.profileError = 'El nombre de usuario no puede estar vacío.';
      return;
    }
    this.savingProfile = true;
    this.profileError = '';
    try {
      await this.profileService.updateProfile(this.auth.currentUserId, {
        username: this.editUsername.trim(),
        character_name: this.editCharName.trim(),
        bio: this.editBio.trim() || null
      });
      await this.loadProfile(this.auth.currentUserId);
      this.editMode = false;
      this.profileSuccess = true;
      setTimeout(() => this.profileSuccess = false, 3000);
    } catch (err: any) {
      this.profileError = err.message ?? 'Error al guardar perfil.';
    } finally {
      this.savingProfile = false;
    }
  }

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.auth.currentUserId) return;
    try {
      const url = await this.profileService.uploadAvatar(
        this.auth.currentUserId, file
      );
      await this.profileService.updateProfile(
        this.auth.currentUserId, { avatar_url: url }
      );
      await this.loadProfile(this.auth.currentUserId);
    } catch (err: any) {
      this.profileError = err.message ?? 'Error al subir avatar.';
    }
  }

  async deletePost(post: Post) {
    if (!post.id) return;
    if (!confirm('¿Eliminar esta publicación?')) return;
    try {
      await this.postService.deletePost(post.id);
      this.userPosts = this.userPosts.filter(p => p.id !== post.id);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  getInitials(): string {
    const name = this.profile?.character_name ?? this.profile?.username ?? '?';
    return name.slice(0, 2).toUpperCase();
  }

  getStatValue(key: string): number {
    return (this.sheet as any)?.[key] ?? 10;
  }

  getModifier(stat: number): number {
    return getModifier(stat);
  }

  getHpPercent(): number {
    if (!this.sheet || this.sheet.max_hp <= 0) return 0;
    return Math.min(100, Math.max(0,
      Math.round((this.sheet.current_hp / this.sheet.max_hp) * 100)
    ));
  }

  getServantRank(key: string): string {
    return (this.servant as any)?.[key]?.rank ?? 'E';
  }

  getServantRankPercent(key: string): number {
    const rankValues: Record<string, number> = {
      'E':1,'D':2,'C':3,'B':4,'A':5,'A+':6,'EX':7
    };
    return Math.round(((rankValues[this.getServantRank(key)] ?? 1) / 7) * 100);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}