import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { SupabaseService } from './core/services/superbase.service';

function initAuth(supabase: SupabaseService): () => Promise<void> {
  return () =>
    supabase.client.auth.getSession().then(() => void 0);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [SupabaseService],
      multi: true
    }
  ]
};