import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post, PostComment, ReactionCount, REACTION_EMOJIS } from '../../../core/models/models';
import { InteractionService } from '../../../core/services/interaction.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <article class="post-card fate-card">

      <!-- CABECERA -->
      <div class="post-header">
        @if (post.profiles?.avatar_url) {
          <img [src]="post.profiles!.avatar_url"
               class="avatar" width="40" height="40" alt="avatar"/>
        } @else {
          <div class="avatar-placeholder" style="width:40px;height:40px;font-size:0.9rem;">
            {{ getInitials() }}
          </div>
        }
        <div class="post-meta">
          <span class="post-username">{{ post.profiles?.username ?? 'Maestro' }}</span>
          <span class="post-charname text-muted">
            {{ post.profiles?.character_name ?? '' }}
          </span>
        </div>
        <span class="post-date text-muted">{{ formatDate(post.created_at) }}</span>
        @if (post.user_id === currentUserId && onDelete) {
          <button class="fate-btn fate-btn-sm fate-btn-danger post-delete"
                  (click)="onDelete(post)">✕</button>
        }
      </div>

      <!-- CONTENIDO -->
      <p class="post-content">{{ post.content }}</p>

      @if (post.image_url) {
        <img [src]="post.image_url" class="post-image" alt="imagen del post"/>
      }

      <!-- REACCIONES -->
      <div class="reactions-bar">
        <!-- Reacciones existentes -->
        <div class="reactions-list">
          @for (r of reactions; track r.emoji) {
            <button
              class="reaction-chip"
              [class.reacted]="r.reacted"
              (click)="toggleReaction(r.emoji)"
              [title]="r.emoji">
              {{ r.emoji }}
              <span class="reaction-count">{{ r.count }}</span>
            </button>
          }
        </div>

        <!-- Picker de emojis -->
        <div class="emoji-picker-wrap">
          <button class="add-reaction-btn"
                  (click)="pickerOpen = !pickerOpen"
                  title="Agregar reacción">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>

          @if (pickerOpen) {
            <div class="emoji-picker">
              @for (emoji of reactionEmojis; track emoji) {
                <button class="emoji-option"
                        (click)="toggleReaction(emoji); pickerOpen = false">
                  {{ emoji }}
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- TOGGLE COMENTARIOS -->
      <button class="comments-toggle" (click)="toggleComments()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        {{ comments.length }} comentario{{ comments.length !== 1 ? 's' : '' }}
        <span class="toggle-arrow">{{ showComments ? '▲' : '▼' }}</span>
      </button>

      <!-- SECCIÓN COMENTARIOS -->
      @if (showComments) {
        <div class="comments-section">

          @if (loadingComments) {
            <div style="display:flex;justify-content:center;padding:1rem;">
              <div class="fate-spinner" style="width:20px;height:20px;border-width:2px;"></div>
            </div>
          }

          @if (!loadingComments && comments.length === 0) {
            <p class="no-comments text-muted">
              Sin comentarios aún. ¡Sé el primero!
            </p>
          }

          <div class="comments-list">
            @for (comment of comments; track comment.id) {
              <div class="comment-item">
                <div class="comment-avatar">
                  @if (comment.profiles?.avatar_url) {
                    <img [src]="comment.profiles!.avatar_url"
                         width="28" height="28"
                         style="border-radius:50%;object-fit:cover;border:1px solid var(--fate-border);"
                         alt="avatar"/>
                  } @else {
                    <div class="comment-avatar-placeholder">
                      {{ getCommentInitials(comment) }}
                    </div>
                  }
                </div>
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-username">
                      {{ comment.profiles?.username ?? 'Maestro' }}
                    </span>
                    <span class="comment-date text-muted">
                      {{ formatDate(comment.created_at) }}
                    </span>
                    @if (comment.user_id === currentUserId) {
                      <button class="comment-delete"
                              (click)="deleteComment(comment)">✕</button>
                    }
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                </div>
              </div>
            }
          </div>

          <!-- INPUT NUEVO COMENTARIO -->
          <div class="comment-input-row">
            <div class="comment-avatar-placeholder" style="flex-shrink:0;">
              {{ currentUserInitial }}
            </div>
            <div class="comment-input-wrap">
              <input
                type="text"
                class="fate-input comment-input"
                [(ngModel)]="newComment"
                placeholder="Escribe un comentario..."
                maxlength="300"
                (keydown.enter)="submitComment()"
              />
              <button
                class="fate-btn fate-btn-primary fate-btn-sm"
                (click)="submitComment()"
                [disabled]="!newComment.trim() || submitting">
                @if (submitting) {
                  <span class="fate-spinner"
                        style="width:12px;height:12px;border-width:2px;display:inline-block;">
                  </span>
                } @else {
                  Enviar
                }
              </button>
            </div>
          </div>

        </div>
      }

    </article>
  `,
  styles: [`
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
    .post-date { font-size: 0.7rem; white-space: nowrap; }
    .post-delete { padding: 0.2rem 0.5rem; font-size: 0.7rem; }

    .post-content {
      font-size: 0.9rem;
      line-height: 1.65;
      color: var(--fate-white);
      white-space: pre-wrap;
      word-break: break-word;
      margin-bottom: 0.5rem;
    }

    /* Reacciones */
    .reactions-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin: 0.75rem 0 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--fate-border);
    }

    .reactions-list {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      flex: 1;
    }

    .reaction-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--fate-deep);
      border: 1px solid var(--fate-border);
      border-radius: 20px;
      padding: 3px 10px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.15s;
    }

    .reaction-chip:hover {
      border-color: var(--fate-blue);
      background: var(--fate-blue-glow);
    }

    .reaction-chip.reacted {
      border-color: var(--fate-blue);
      background: var(--fate-blue-glow);
      box-shadow: 0 0 6px var(--fate-blue-glow);
    }

    .reaction-count {
      font-family: var(--font-heading);
      font-size: 0.72rem;
      color: var(--fate-muted-bright);
    }

    .reaction-chip.reacted .reaction-count {
      color: var(--fate-blue-bright);
    }

    /* Emoji picker */
    .emoji-picker-wrap { position: relative; }

    .add-reaction-btn {
      background: var(--fate-deep);
      border: 1px solid var(--fate-border);
      border-radius: 20px;
      color: var(--fate-muted-bright);
      cursor: pointer;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      transition: all 0.15s;
    }

    .add-reaction-btn:hover {
      border-color: var(--fate-blue);
      color: var(--fate-blue-bright);
    }

    .emoji-picker {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 0;
      background: var(--fate-panel-alt);
      border: 1px solid var(--fate-border-bright);
      border-radius: var(--radius-md);
      padding: 8px;
      display: flex;
      gap: 4px;
      z-index: 10;
      box-shadow: 0 4px 20px rgba(0, 100, 200, 0.2);
    }

    .emoji-option {
      background: none;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 1.2rem;
      padding: 4px 6px;
      transition: all 0.15s;
    }

    .emoji-option:hover {
      background: var(--fate-blue-glow);
      border-color: var(--fate-blue);
      transform: scale(1.2);
    }

    /* Toggle comentarios */
    .comments-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: var(--fate-muted-bright);
      cursor: pointer;
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      padding: 6px 0;
      transition: color 0.2s;
      width: 100%;
      text-align: left;
    }

    .comments-toggle:hover { color: var(--fate-blue-bright); }

    .toggle-arrow {
      margin-left: auto;
      font-size: 0.6rem;
    }

    /* Comentarios */
    .comments-section {
      border-top: 1px solid var(--fate-border);
      padding-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .no-comments {
      font-size: 0.8rem;
      text-align: center;
      padding: 0.5rem;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-height: 300px;
      overflow-y: auto;
      padding-right: 2px;
    }

    .comment-item {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .comment-avatar { flex-shrink: 0; }

    .comment-avatar-placeholder {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: var(--fate-panel);
      border: 1px solid var(--fate-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 0.6rem;
      color: var(--fate-blue);
      flex-shrink: 0;
    }

    .comment-body {
      flex: 1;
      background: var(--fate-deep);
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-md);
      padding: 0.5rem 0.75rem;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 3px;
    }

    .comment-username {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      color: var(--fate-blue-bright);
    }

    .comment-date { font-size: 0.65rem; }

    .comment-delete {
      margin-left: auto;
      background: none;
      border: none;
      color: var(--fate-muted);
      cursor: pointer;
      font-size: 0.65rem;
      padding: 0 2px;
      transition: color 0.15s;
    }

    .comment-delete:hover { color: var(--fate-danger); }

    .comment-content {
      font-size: 0.82rem;
      color: var(--fate-white);
      line-height: 1.5;
      word-break: break-word;
    }

    /* Input comentario */
    .comment-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .comment-input-wrap {
      flex: 1;
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .comment-input {
      flex: 1;
      padding: 0.45rem 0.75rem;
      font-size: 0.85rem;
    }
  `]
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Input() currentUserId: string | null = null;
  @Input() currentUserInitial: string = '?';
  @Input() onDelete?: (post: Post) => void;

  comments: PostComment[] = [];
  reactions: ReactionCount[] = [];
  reactionEmojis = REACTION_EMOJIS;

  showComments = false;
  loadingComments = false;
  newComment = '';
  submitting = false;
  pickerOpen = false;

  constructor(
    private interactions: InteractionService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    if (this.post.id) {
      await this.loadReactions();
    }
  }

  async loadReactions() {
    if (!this.post.id) return;
    this.reactions = await this.interactions.getReactions(
      this.post.id,
      this.currentUserId ?? ''
    );
  }

  async toggleComments() {
    this.showComments = !this.showComments;
    if (this.showComments && this.comments.length === 0) {
      await this.loadComments();
    }
  }

  async loadComments() {
    if (!this.post.id) return;
    this.loadingComments = true;
    try {
      this.comments = await this.interactions.getComments(this.post.id);
    } finally {
      this.loadingComments = false;
    }
  }

  async submitComment() {
    if (!this.newComment.trim() || !this.post.id || !this.currentUserId) return;
    this.submitting = true;
    try {
      const comment = await this.interactions.addComment(
        this.post.id,
        this.currentUserId,
        this.newComment.trim()
      );
      this.comments = [...this.comments, comment];
      this.newComment = '';
    } finally {
      this.submitting = false;
    }
  }

  async deleteComment(comment: PostComment) {
    if (!comment.id) return;
    await this.interactions.deleteComment(comment.id);
    this.comments = this.comments.filter(c => c.id !== comment.id);
  }

  async toggleReaction(emoji: string) {
    if (!this.post.id || !this.currentUserId) return;
    await this.interactions.toggleReaction(
      this.post.id,
      this.currentUserId,
      emoji
    );
    await this.loadReactions();
  }

  getInitials(): string {
    const name = this.post.profiles?.character_name
      ?? this.post.profiles?.username ?? '?';
    return name.slice(0, 2).toUpperCase();
  }

  getCommentInitials(comment: PostComment): string {
    const name = comment.profiles?.character_name
      ?? comment.profiles?.username ?? '?';
    return name.slice(0, 2).toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / 1000
    );
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return new Date(dateStr).toLocaleDateString('es', {
      day: '2-digit', month: 'short'
    });
  }
}