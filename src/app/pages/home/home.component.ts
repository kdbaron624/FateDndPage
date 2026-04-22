import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { ProfileService } from '../../core/services/profile.service';
import { Post, Profile } from '../../core/models/models';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PostCardComponent],
  template: `
    <div class="home-layout">
      <aside class="home-sidebar">
        <div class="fate-card fate-card-gold">
          <div class="sidebar-profile">
            @if (profile?.avatar_url) {
              <img [src]="profile!.avatar_url" class="avatar" width="56" height="56" alt="avatar"/>
            } @else {
              <div class="avatar-placeholder" style="width:56px;height:56px;font-size:1.2rem;">
                {{ getInitials() }}
              </div>
            }
            <div>
              <p class="profile-username">{{ profile?.username ?? '...' }}</p>
              <p class="profile-charname text-muted">{{ profile?.character_name ?? '' }}</p>
            </div>
          </div>

          <div class="fate-divider"><span>Publicar</span></div>

          <div class="post-form">
            <textarea
              class="fate-input"
              rows="3"
              placeholder="¿Qué ocurre en la Guerra del Santo Grial?"
              [(ngModel)]="newContent"
              maxlength="500"
            ></textarea>

            <div class="post-form-actions">
              <label class="image-upload-label fate-btn fate-btn-sm fate-btn-gold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Imagen
                <input type="file" accept="image/*" (change)="onFileSelected($event)" hidden/>
              </label>

              <button
                class="fate-btn fate-btn-primary fate-btn-sm"
                (click)="createPost()"
                [disabled]="posting || !newContent.trim()"
              >
                @if (posting) { Enviando... } @else { Publicar }
              </button>
            </div>

            @if (imagePreview) {
              <div class="preview-container">
                <img [src]="imagePreview" class="image-preview" alt="preview"/>
                <button class="remove-image" (click)="removeImage()">✕</button>
              </div>
            }

            @if (postError) {
              <div class="fate-alert fate-alert-error mt-1">{{ postError }}</div>
            }
          </div>
        </div>
        <div class="fate-card mt-2">
          <p class="quick-title">Acceso Rápido</p>
          <nav class="quick-nav">
            <a routerLink="/character-sheet" class="quick-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Hoja de Personaje
            </a>
            <a routerLink="/servant-sheet" class="quick-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Hoja de Servant
            </a>
            <a routerLink="/profile" class="quick-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Mi Perfil
            </a>
          </nav>
        </div>
      </aside>
      <section class="home-feed">

        <div class="feed-header">
          <h2 class="text-gold">Crónicas de la Guerra</h2>
          <button class="fate-btn fate-btn-sm" (click)="loadPosts()" [disabled]="loading">
            @if (loading) { Cargando... } @else { Actualizar }
          </button>
        </div>

        @if (loading && posts.length === 0) {
          <div class="loading-center">
            <div class="fate-spinner"></div>
          </div>
        }

        @if (!loading && posts.length === 0) {
          <div class="empty-feed fate-card">
            <p class="text-muted text-center">
              No hay publicaciones aún. ¡Sé el primero en reportar desde el campo de batalla!
            </p>
          </div>
        }

        <div class="posts-list">
          
          @for (post of posts; track post.id) {
            <app-post-card
              [post]="post"
              [currentUserId]="currentUserId"
              [currentUserInitial]="getInitials()"
              [onDelete]="deletePostFn"
            />
          }
        </div>

      </section>
    </div>
  `,
  styles: [`
    .home-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .home-layout { grid-template-columns: 1fr; }
    }

    /* Sidebar */
    .home-sidebar { position: sticky; top: 80px; }

    .sidebar-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .profile-username {
      font-family: var(--font-heading);
      font-size: 0.9rem;
      color: var(--fate-white);
    }

    .profile-charname { font-size: 0.78rem; }

    /* Post form */
    .post-form { display: flex; flex-direction: column; gap: 0.75rem; }

    .post-form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .image-upload-label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }

    .preview-container {
      position: relative;
      display: inline-block;
    }

    .image-preview {
      max-width: 100%;
      max-height: 200px;
      border-radius: var(--radius-md);
      border: 1px solid var(--fate-border);
      object-fit: cover;
      display: block;
    }

    .remove-image {
      position: absolute;
      top: 6px; right: 6px;
      background: rgba(0,0,0,0.7);
      border: 1px solid var(--fate-danger);
      color: var(--fate-danger);
      border-radius: 50%;
      width: 24px; height: 24px;
      cursor: pointer;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Quick nav */
    .quick-title {
      font-family: var(--font-heading);
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--fate-muted);
      margin-bottom: 0.75rem;
    }

    .quick-nav { display: flex; flex-direction: column; gap: 0.25rem; }

    .quick-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--fate-muted);
      font-size: 0.85rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      text-decoration: none;
    }

    .quick-link:hover {
      color: var(--fate-magenta);
      background: var(--fate-magenta-glow);
    }

    /* Feed */
    .feed-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .feed-header h2 {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      letter-spacing: 0.08em;
    }

    .posts-list { display: flex; flex-direction: column; gap: 1rem; }

    .empty-feed { padding: 2rem; }

    /* Post card */
    .post-card { padding: 1.25rem; }

    .post-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .post-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .post-username {
      font-family: var(--font-heading);
      font-size: 0.85rem;
      color: var(--fate-white);
    }

    .post-charname { font-size: 0.75rem; }

    .post-date {
      font-size: 0.72rem;
      white-space: nowrap;
    }

    .post-delete { padding: 0.2rem 0.5rem; font-size: 0.7rem; }

    .post-content {
      font-size: 0.9rem;
      line-height: 1.65;
      color: var(--fate-white);
      white-space: pre-wrap;
      word-break: break-word;
    }
  `]
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  profile: Profile | null = null;
  loading = false;
  posting = false;
  postError = '';
  newContent = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private auth: AuthService,
    private postService: PostService,
    private profileService: ProfileService
  ) {}

  get currentUserId() { return this.auth.currentUserId; }

  async ngOnInit() {
    await Promise.all([this.loadPosts(), this.loadProfile()]);
  }

  async loadPosts() {
    this.loading = true;
    try {
      this.posts = await this.postService.getPosts();
    } finally {
      this.loading = false;
    }
  }

  async loadProfile() {
    if (!this.auth.currentUserId) return;
    this.profile = await this.profileService.getProfile(this.auth.currentUserId);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  async createPost() {
    if (!this.newContent.trim() || !this.auth.currentUserId) return;
    this.posting = true;
    this.postError = '';
    try {
      await this.postService.createPost(
        this.auth.currentUserId,
        this.newContent.trim(),
        this.selectedFile ?? undefined
      );
      this.newContent = '';
      this.removeImage();
      await this.loadPosts();
    } catch (err: any) {
      this.postError = err.message ?? 'Error al publicar.';
    } finally {
      this.posting = false;
    }
  }

  async deletePost(post: Post) {
    if (!post.id) return;
    if (!confirm('¿Eliminar esta publicación?')) return;
    try {
      await this.postService.deletePost(post.id);
      this.posts = this.posts.filter(p => p.id !== post.id);
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  }

  getInitials(): string {
    const name = this.profile?.character_name ?? this.profile?.username ?? '?';
    return name.slice(0, 2).toUpperCase();
  }

  getPostInitials(post: Post): string {
    const name = post.profiles?.character_name ?? post.profiles?.username ?? '?';
    return name.slice(0, 2).toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString('es', { day: '2-digit', month: 'short' });
  }

  deletePostFn = (post: Post) => this.deletePost(post);
}