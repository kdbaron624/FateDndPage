import { Injectable } from '@angular/core';
import { PostComment, PostReaction, ReactionCount } from '../models/models';
import { SupabaseService } from './superbase.service';

@Injectable({ providedIn: 'root' })
export class InteractionService {
  private sb;

  constructor(private supabase: SupabaseService) {
    this.sb = this.supabase.client;
  }

  // ── COMENTARIOS ─────────────────────────────────────────────

  async getComments(postId: string): Promise<PostComment[]> {
    const { data, error } = await this.sb
      .from('post_comments')
      .select('*, profiles(id, username, character_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as PostComment[];
  }

  async addComment(
    postId: string,
    userId: string,
    content: string
  ): Promise<PostComment> {
    const { data, error } = await this.sb
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, content })
      .select('*, profiles(id, username, character_name, avatar_url)')
      .single();
    if (error) throw error;
    return data as PostComment;
  }

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await this.sb
      .from('post_comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;
  }

  // ── REACCIONES ──────────────────────────────────────────────

  async getReactions(
    postId: string,
    userId: string
  ): Promise<ReactionCount[]> {
    const { data, error } = await this.sb
      .from('post_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId);
    if (error) throw error;

    const rows = (data ?? []) as { emoji: string; user_id: string }[];
    const map = new Map<string, { count: number; reacted: boolean }>();

    for (const row of rows) {
      const existing = map.get(row.emoji) ?? { count: 0, reacted: false };
      map.set(row.emoji, {
        count: existing.count + 1,
        reacted: existing.reacted || row.user_id === userId
      });
    }

    return Array.from(map.entries()).map(([emoji, val]) => ({
      emoji,
      count: val.count,
      reacted: val.reacted
    }));
  }

  async toggleReaction(
    postId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    // Verificar si ya existe
    const { data } = await this.sb
      .from('post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single();

    if (data) {
      // Ya existe → eliminar
      await this.sb
        .from('post_reactions')
        .delete()
        .eq('id', data.id);
    } else {
      // No existe → insertar
      await this.sb
        .from('post_reactions')
        .insert({ post_id: postId, user_id: userId, emoji });
    }
  }
}