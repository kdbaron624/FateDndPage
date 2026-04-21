import { Injectable } from '@angular/core';
import { Servant } from '../models/models';
import { SupabaseService } from './superbase.service';

@Injectable({ providedIn: 'root' })
export class ServantService {
  private sb;

  constructor(private supabase: SupabaseService) {
    this.sb = this.supabase.client;
  }

  async getServant(userId: string): Promise<Servant | null> {
    const { data, error } = await this.sb
      .from('servants')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as Servant;
  }

  async upsertServant(servant: Servant): Promise<void> {
    const { error } = await this.sb
      .from('servants')
      .upsert(servant, { onConflict: 'user_id' });
    if (error) throw error;
  }

  async updateFriendship(userId: string, level: number): Promise<void> {
    const { error } = await this.sb
      .from('servants')
      .update({ friendship_level: level })
      .eq('user_id', userId);
    if (error) throw error;
  }
}