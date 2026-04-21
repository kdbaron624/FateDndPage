import { Injectable } from '@angular/core';
import { Post } from '../models/models';
import { SupabaseService } from './superbase.service';

@Injectable({ providedIn: 'root' })
export class PostService {
  private sb;

  constructor(private supabase: SupabaseService) {
    this.sb = this.supabase.client;
  }

  async getPosts(): Promise<Post[]> {
    const { data, error } = await this.sb
      .from('posts')
      .select('*, profiles(id, username, character_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as Post[];
  }

  async createPost(userId: string, content: string, imageFile?: File): Promise<void> {
    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await this.sb.storage
        .from('post-images')
        .upload(path, imageFile);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = this.sb.storage
        .from('post-images')
        .getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await this.sb
      .from('posts')
      .insert({ user_id: userId, content, image_url });
    if (error) throw error;
  }

  async deletePost(postId: string): Promise<void> {
    const { error } = await this.sb.from('posts').delete().eq('id', postId);
    if (error) throw error;
  }
}