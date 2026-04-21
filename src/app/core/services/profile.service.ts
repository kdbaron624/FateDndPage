import { Injectable } from '@angular/core';
import { Profile } from '../models/models';
import { SupabaseService } from './superbase.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private sb;

  constructor(private supabase: SupabaseService) {
    this.sb = this.supabase.client;
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as Profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    const { error } = await this.sb
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await this.sb.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = this.sb.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  }
}