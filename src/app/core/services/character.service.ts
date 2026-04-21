import { Injectable } from '@angular/core';
import { CharacterSheet } from '../models/models';
import { SupabaseService } from './superbase.service';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private sb;

  constructor(private supabase: SupabaseService) {
    this.sb = this.supabase.client;  // ← dentro del constructor
  }

  async getSheet(userId: string): Promise<CharacterSheet | null> {
    const { data, error } = await this.sb
      .from('character_sheets')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as CharacterSheet;
  }

  async upsertSheet(sheet: CharacterSheet): Promise<void> {
    const { error } = await this.sb
      .from('character_sheets')
      .upsert(sheet, { onConflict: 'user_id' });
    if (error) throw error;
  }
}