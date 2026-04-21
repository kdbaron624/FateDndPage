import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './superbase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb;

  session = signal<Session | null>(null);
  user = signal<User | null>(null);

  constructor(private supabase: SupabaseService, private router: Router) {
    this.sb = this.supabase.client;  // ← aquí, dentro del constructor

    this.sb.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.user.set(data.session?.user ?? null);
    });

    this.sb.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });
  }

  async signUp(email: string, password: string, username: string, characterName: string) {
    const { data, error } = await this.sb.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await this.sb
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          character_name: characterName,
          avatar_url: null,
          bio: null
        });
      if (profileError) throw profileError;
    }
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    await this.sb.auth.signOut();
    this.router.navigate(['/login']);
  }

  get currentUserId(): string | null {
    return this.user()?.id ?? null;
  }
}