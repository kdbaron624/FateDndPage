import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ServantService } from '../../core/services/servant.service';
import {
  Servant, ServantClass, ServantStat, ServantSkill, NoblePhantasm
} from '../../core/models/models';

const SERVANT_CLASSES: ServantClass[] = [
  'Saber','Archer','Lancer','Rider',
  'Caster','Assassin','Berserker','Ruler',
  'Avenger','Moon Cancer','Shielder','Foreigner'
];

const RANKS = ['E','D','C','B','A','A+','EX'];

const RANK_VALUES: Record<string, number> = {
  'E':1,'D':2,'C':3,'B':4,'A':5,'A+':6,'EX':7
};

@Component({
  selector: 'app-servant-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="servant-wrapper">

      <!-- ENCABEZADO -->
      <div class="fate-card servant-header">
        <div class="header-top">
          <div class="header-left">
            <div class="class-emblem" [attr.data-class]="servant.class_name">
              {{ getClassInitial() }}
            </div>
            <div>
              <h1 class="servant-name">
                {{ friendship >= 3 ? servant.true_name || '???' : servant.alias || '???' }}
              </h1>
              <p class="servant-class text-magenta">
                {{ servant.class_name }} Class
              </p>
              @if (friendship < 3 && servant.alias) {
                <p class="locked-hint text-muted">
                  — Nombre verdadero oculto hasta ★★★
                </p>
              }
            </div>
          </div>
          <div class="header-right">
            <div class="friendship-section">
              <span class="friendship-label">Nivel de Amistad</span>
              <div class="friendship-stars">
                @for (i of [1,2,3,4,5]; track i) {
                  <button class="star-btn" (click)="setFriendship(i)"
                          [title]="'Nivel ' + i">
                    @if (i <= friendship) {
                      <svg width="22" height="22" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                          fill="#d4af37" stroke="#d4af37" stroke-width="1"/>
                      </svg>
                    } @else {
                      <svg width="22" height="22" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                          fill="none" stroke="#8a7020" stroke-width="1.5"/>
                      </svg>
                    }
                  </button>
                }
              </div>
              <span class="friendship-desc text-muted">{{ getFriendshipLabel() }}</span>
            </div>
            <div class="header-actions">
              @if (saved) {
                <span class="save-badge">✓ Guardado</span>
              }
              <button class="fate-btn fate-btn-primary"
                      (click)="saveServant()" [disabled]="saving">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Info desbloqueada en nivel 1 -->
        <div class="basic-servant-grid">
          <div class="form-group">
            <label>Alias (nombre público)</label>
            <input type="text" class="fate-input"
                   [(ngModel)]="servant.alias"
                   placeholder="El Caballero del Viento..."/>
          </div>
          <div class="form-group">
            <label>Nombre Verdadero
              <span class="lock-inline" [class.unlocked]="friendship >= 3">
                {{ friendship >= 3 ? '🔓' : '🔒 Nivel 3' }}
              </span>
            </label>
            @if (friendship >= 3) {
              <input type="text" class="fate-input"
                     [(ngModel)]="servant.true_name"
                     placeholder="Nombre histórico/mítico"/>
            } @else {
              <div class="locked-field">Desbloquea a ★★★</div>
            }
          </div>
          <div class="form-group">
            <label>Clase</label>
            <select class="fate-input" [(ngModel)]="servant.class_name">
              @for (cls of servantClasses; track cls) {
                <option [value]="cls">{{ cls }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Alineamiento
              <span class="lock-inline" [class.unlocked]="friendship >= 2">
                {{ friendship >= 2 ? '🔓' : '🔒 Nivel 2' }}
              </span>
            </label>
            @if (friendship >= 2) {
              <select class="fate-input" [(ngModel)]="servant.alignment">
                <option value="">— Seleccionar —</option>
                <option>Lawful Good</option><option>Neutral Good</option>
                <option>Chaotic Good</option><option>Lawful Neutral</option>
                <option>True Neutral</option><option>Chaotic Neutral</option>
                <option>Lawful Evil</option><option>Neutral Evil</option>
                <option>Chaotic Evil</option>
              </select>
            } @else {
              <div class="locked-field">Desbloquea a ★★</div>
            }
          </div>
        </div>

        <!-- Avatar -->
        <div class="avatar-row">
          <div class="servant-avatar-wrap">
            @if (servant.avatar_url) {
              <img [src]="servant.avatar_url" class="servant-avatar" alt="servant"/>
            } @else {
              <div class="servant-avatar-placeholder">
                {{ getClassInitial() }}
              </div>
            }
            <label class="avatar-upload-btn fate-btn fate-btn-sm fate-btn-gold">
              Cambiar imagen
              <input type="file" accept="image/*"
                     (change)="onAvatarSelected($event)" hidden/>
            </label>
          </div>
        </div>
      </div>

      <!-- TABS -->
      <div class="servant-tabs">
        <button class="tab-btn" [class.active]="activeTab==='params'"
                (click)="activeTab='params'">Parámetros</button>
        <button class="tab-btn" [class.active]="activeTab==='skills'"
                (click)="activeTab='skills'">Habilidades</button>
        <button class="tab-btn" [class.active]="activeTab==='np'"
                (click)="activeTab='np'">Noble Phantasm</button>
        <button class="tab-btn" [class.active]="activeTab==='lore'"
                (click)="activeTab='lore'">Historia</button>
      </div>

      <div class="servant-body">

        <!-- ── PARÁMETROS ── -->
        <div class="servant-col" [class.tab-hidden]="activeTab !== 'params'">
          <div class="fate-card">
            <h3 class="section-title text-magenta">Parámetros del Servant</h3>
            <p class="param-hint text-muted">Siempre visibles — visión general del Servant</p>

            <div class="params-grid">
              @for (param of paramKeys; track param.key) {
                <div class="param-box">
                  <span class="param-label">{{ param.label }}</span>
                  <div class="param-rank-row">
                    <select class="fate-input param-select"
                      [ngModel]="getParam(param.key).rank"
                      (ngModelChange)="setParamRank(param.key, $event)">
                      @for (r of ranks; track r) {
                        <option [value]="r">{{ r }}</option>
                      }
                    </select>
                    <span class="rank-badge rank-{{ getParam(param.key).rank.replace('+','p') }}">
                      {{ getParam(param.key).rank }}
                    </span>
                  </div>
                  <div class="param-bar">
                    <div class="param-fill"
                      [style.width.%]="getRankPercent(getParam(param.key).rank)">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── HABILIDADES ── -->
        <div class="servant-col" [class.tab-hidden]="activeTab !== 'skills'">
          <div class="fate-card">
            <h3 class="section-title text-gold">Habilidades del Servant</h3>
            <p class="param-hint text-muted">
              Las habilidades con nivel de amistad mayor al actual aparecen bloqueadas
            </p>

            <div class="skills-section">
              @for (skill of servant.skills; track $index; let i = $index) {
                <div class="servant-skill-card"
                     [class.skill-locked]="skill.locked_until > friendship">

                  @if (skill.locked_until > friendship) {
                    <!-- BLOQUEADA -->
                    <div class="skill-lock-overlay">
                      <div class="lock-stars">
                        @for (s of [1,2,3,4,5]; track s) {
                          <svg width="12" height="12" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                              [attr.fill]="s <= skill.locked_until ? '#d4af37' : 'none'"
                              [attr.stroke]="s <= skill.locked_until ? '#d4af37' : '#8a7020'"
                              stroke-width="1.5"/>
                          </svg>
                        }
                      </div>
                      <span class="lock-text">Habilidad bloqueada — Requiere ★{{ skill.locked_until }}</span>
                    </div>
                  } @else {
                    <!-- DESBLOQUEADA -->
                    <div class="skill-header">
                      <div class="form-group" style="flex:1">
                        <label>Nombre</label>
                        <input type="text" class="fate-input"
                               [(ngModel)]="skill.name"
                               placeholder="Nombre de la habilidad"/>
                      </div>
                      <div class="form-group" style="width:80px">
                        <label>Rango</label>
                        <select class="fate-input" [(ngModel)]="skill.rank">
                          @for (r of ranks; track r) {
                            <option [value]="r">{{ r }}</option>
                          }
                        </select>
                      </div>
                      <button class="fate-btn fate-btn-sm fate-btn-danger"
                              style="align-self:flex-end"
                              (click)="removeSkill(i)">✕</button>
                    </div>
                    <div class="form-group mt-1">
                      <label>Descripción</label>
                      <textarea class="fate-input" rows="2"
                                [(ngModel)]="skill.description"
                                placeholder="Efecto de la habilidad..."></textarea>
                    </div>
                  }

                  <div class="skill-unlock-badge">
                    Se desbloquea a ★{{ skill.locked_until }}
                    @if (skill.locked_until <= friendship) {
                      <span class="text-cyan"> — Activa</span>
                    }
                  </div>

                  <div class="form-group mt-1">
                    <label>Nivel de amistad requerido</label>
                    <div class="unlock-selector">
                      @for (lvl of [1,2,3,4,5]; track lvl) {
                        <button class="unlock-lvl-btn"
                          [class.active]="skill.locked_until === lvl"
                          (click)="skill.locked_until = lvl">
                          ★{{ lvl }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }

              <button class="fate-btn fate-btn-gold w-full mt-2"
                      (click)="addSkill()">
                + Agregar Habilidad
              </button>
            </div>
          </div>
        </div>

        <!-- ── NOBLE PHANTASM ── -->
        <div class="servant-col" [class.tab-hidden]="activeTab !== 'np'">
          <div class="fate-card">
            <h3 class="section-title text-magenta">Noble Phantasm</h3>

            <div class="np-grid">
              <div class="form-group">
                <label>
                  Nombre del NP
                  <span class="lock-inline" [class.unlocked]="friendship >= 1">🔓 Nivel 1</span>
                </label>
                <input type="text" class="fate-input"
                       [(ngModel)]="servant.noble_phantasm.name"
                       placeholder="Nombre en idioma original"/>
              </div>

              <div class="form-group">
                <label>
                  Nombre Verdadero
                  <span class="lock-inline" [class.unlocked]="friendship >= 4">
                    {{ friendship >= 4 ? '🔓' : '🔒 Nivel 4' }}
                  </span>
                </label>
                @if (friendship >= 4) {
                  <input type="text" class="fate-input"
                         [(ngModel)]="servant.noble_phantasm.true_name"
                         placeholder="Traducción / nombre real"/>
                } @else {
                  <div class="locked-field">Desbloquea a ★★★★</div>
                }
              </div>

              <div class="form-group">
                <label>Tipo</label>
                <input type="text" class="fate-input"
                       [(ngModel)]="servant.noble_phantasm.type"
                       placeholder="Anti-Unit, Anti-Army, Anti-World..."/>
              </div>

              <div class="form-group">
                <label>Rango</label>
                <select class="fate-input"
                        [(ngModel)]="servant.noble_phantasm.rank">
                  @for (r of ranks; track r) {
                    <option [value]="r">{{ r }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Descripción básica — nivel 2 -->
            <div class="np-section mt-2">
              <div class="np-section-header">
                <h4 class="np-section-title">
                  Descripción
                  <span class="lock-inline" [class.unlocked]="friendship >= 2">
                    {{ friendship >= 2 ? '🔓' : '🔒 Nivel 2' }}
                  </span>
                </h4>
              </div>
              @if (friendship >= 2) {
                <textarea class="fate-input" rows="4"
                  [(ngModel)]="servant.noble_phantasm.description"
                  placeholder="Describe el efecto general del Noble Phantasm...">
                </textarea>
              } @else {
                <div class="locked-block">
                  <div class="locked-block-inner">
                    <span class="lock-icon-big">🔒</span>
                    <p class="lock-desc">Requiere ★★ de amistad para revelar la descripción del Noble Phantasm</p>
                  </div>
                </div>
              }
            </div>

            <!-- Descripción verdadera — nivel 5 -->
            <div class="np-section mt-2">
              <div class="np-section-header">
                <h4 class="np-section-title text-gold">
                  Descripción Verdadera
                  <span class="lock-inline" [class.unlocked]="friendship >= 5">
                    {{ friendship >= 5 ? '🔓' : '🔒 Nivel 5' }}
                  </span>
                </h4>
              </div>
              @if (friendship >= 5) {
                <textarea class="fate-input" rows="4"
                  [(ngModel)]="servant.noble_phantasm.true_description"
                  placeholder="El verdadero efecto y secreto del Noble Phantasm...">
                </textarea>
              } @else {
                <div class="locked-block locked-block-gold">
                  <div class="locked-block-inner">
                    <span class="lock-icon-big">🔒</span>
                    <p class="lock-desc">Requiere ★★★★★ de amistad — El secreto más profundo del Servant</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── HISTORIA / LORE ── -->
        <div class="servant-col" [class.tab-hidden]="activeTab !== 'lore'">
          <div class="fate-card">
            <h3 class="section-title text-cyan">Historia del Servant</h3>

            <!-- Origen — nivel 3 -->
            <div class="lore-section">
              <div class="lore-header">
                <h4 class="lore-title">
                  Origen
                  <span class="lock-inline" [class.unlocked]="friendship >= 3">
                    {{ friendship >= 3 ? '🔓' : '🔒 Nivel 3' }}
                  </span>
                </h4>
              </div>
              @if (friendship >= 3) {
                <textarea class="fate-input" rows="3"
                  [(ngModel)]="servant.origin"
                  placeholder="Período histórico, región, contexto del Servant...">
                </textarea>
              } @else {
                <div class="locked-block">
                  <div class="locked-block-inner">
                    <span class="lock-icon-big">🔒</span>
                    <p class="lock-desc">Requiere ★★★ de amistad</p>
                  </div>
                </div>
              }
            </div>

            <!-- Lore básico — nivel 4 -->
            <div class="lore-section mt-2">
              <div class="lore-header">
                <h4 class="lore-title">
                  Historia
                  <span class="lock-inline" [class.unlocked]="friendship >= 4">
                    {{ friendship >= 4 ? '🔓' : '🔒 Nivel 4' }}
                  </span>
                </h4>
              </div>
              @if (friendship >= 4) {
                <textarea class="fate-input" rows="4"
                  [(ngModel)]="servant.lore"
                  placeholder="Historia y vida del Servant en vida...">
                </textarea>
              } @else {
                <div class="locked-block">
                  <div class="locked-block-inner">
                    <span class="lock-icon-big">🔒</span>
                    <p class="lock-desc">Requiere ★★★★ de amistad</p>
                  </div>
                </div>
              }
            </div>

            <!-- Historia verdadera + Bond episode — nivel 5 -->
            <div class="lore-section mt-2">
              <div class="lore-header">
                <h4 class="lore-title text-gold">
                  Historia Verdadera
                  <span class="lock-inline" [class.unlocked]="friendship >= 5">
                    {{ friendship >= 5 ? '🔓' : '🔒 Nivel 5' }}
                  </span>
                </h4>
              </div>
              @if (friendship >= 5) {
                <textarea class="fate-input" rows="4"
                  [(ngModel)]="servant.true_lore"
                  placeholder="La verdad oculta detrás del Servant...">
                </textarea>
                <div class="form-group mt-2">
                  <label class="text-gold">Episodio de Vínculo</label>
                  <textarea class="fate-input" rows="3"
                    [(ngModel)]="servant.bond_episode"
                    placeholder="El momento definitivo de conexión con el Maestro...">
                  </textarea>
                </div>
              } @else {
                <div class="locked-block locked-block-gold">
                  <div class="locked-block-inner">
                    <span class="lock-icon-big">🔒</span>
                    <p class="lock-desc">
                      Requiere ★★★★★ — La verdad más profunda y el vínculo definitivo
                    </p>
                  </div>
                </div>
              }
            </div>

          </div>
        </div>

      </div>

      @if (error) {
        <div class="fate-alert fate-alert-error">{{ error }}</div>
      }

    </div>
  `,
  styles: [`
    .servant-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Header */
    .servant-header { padding: 1.5rem; }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .class-emblem {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: var(--fate-magenta-glow);
      border: 2px solid var(--fate-magenta-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--fate-magenta);
      flex-shrink: 0;
    }

    .servant-name {
      font-family: var(--font-display);
      font-size: 1.5rem;
      color: var(--fate-white);
    }

    .servant-class {
      font-family: var(--font-heading);
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .locked-hint { font-size: 0.72rem; margin-top: 2px; }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .friendship-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .friendship-label {
      font-family: var(--font-heading);
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--fate-muted);
    }

    .friendship-stars {
      display: flex;
      gap: 4px;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      transition: transform 0.15s;
      display: flex;
    }

    .star-btn:hover { transform: scale(1.2); }

    .friendship-desc {
      font-size: 0.72rem;
      font-style: italic;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .save-badge {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      color: #00d464;
      letter-spacing: 0.1em;
    }

    .basic-servant-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 800px) {
      .basic-servant-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 480px) {
      .basic-servant-grid { grid-template-columns: 1fr; }
    }

    .lock-inline {
      font-size: 0.65rem;
      color: var(--fate-danger);
      margin-left: 6px;
      font-family: var(--font-body);
    }

    .lock-inline.unlocked { color: var(--fate-cyan); }

    .locked-field {
      background: var(--fate-deep);
      border: 1px dashed var(--fate-border);
      border-radius: var(--radius-sm);
      color: var(--fate-muted);
      font-size: 0.8rem;
      font-style: italic;
      padding: 0.65rem 1rem;
      text-align: center;
    }

    /* Avatar */
    .avatar-row { display: flex; gap: 1rem; align-items: flex-end; }

    .servant-avatar-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .servant-avatar {
      width: 100px; height: 100px;
      border-radius: var(--radius-md);
      object-fit: cover;
      border: 2px solid var(--fate-magenta-dim);
    }

    .servant-avatar-placeholder {
      width: 100px; height: 100px;
      border-radius: var(--radius-md);
      background: var(--fate-panel);
      border: 2px dashed var(--fate-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 2rem;
      color: var(--fate-magenta-dim);
    }

    .avatar-upload-btn { cursor: pointer; }

    /* TABS */
    .servant-tabs {
      display: flex;
      background: var(--fate-panel);
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-lg);
      padding: 4px;
      gap: 4px;
    }

    .tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--fate-muted);
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.55rem 0.25rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: var(--fate-magenta-glow);
      color: var(--fate-magenta);
    }

    /* Body */
    .servant-body {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .servant-body { grid-template-columns: 1fr; }
      .tab-hidden { display: none !important; }
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    .param-hint { font-size: 0.75rem; margin-bottom: 1rem; }

    /* Params grid */
    .params-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    @media (max-width: 500px) {
      .params-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .param-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: var(--fate-deep);
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-md);
      padding: 0.75rem;
    }

    .param-label {
      font-family: var(--font-heading);
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--fate-muted);
    }

    .param-rank-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .param-select {
      flex: 1;
      padding: 4px 6px;
      font-size: 0.85rem;
    }

    .param-bar {
      height: 3px;
      background: var(--fate-border);
      border-radius: 2px;
      overflow: hidden;
    }

    .param-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--fate-magenta), var(--fate-gold));
      border-radius: 2px;
      transition: width 0.4s ease;
    }

    /* Skills */
    .skills-section { display: flex; flex-direction: column; gap: 0.75rem; }

    .servant-skill-card {
      background: var(--fate-deep);
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .servant-skill-card.skill-locked {
      border-style: dashed;
      opacity: 0.7;
    }

    .skill-lock-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 0.5rem 0;
    }

    .lock-stars { display: flex; gap: 3px; }

    .lock-text {
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      color: var(--fate-muted);
      text-align: center;
    }

    .skill-header {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .skill-unlock-badge {
      font-family: var(--font-heading);
      font-size: 0.65rem;
      letter-spacing: 0.08em;
      color: var(--fate-gold-dim);
    }

    .unlock-selector {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .unlock-lvl-btn {
      background: transparent;
      border: 1px solid var(--fate-border);
      color: var(--fate-muted);
      border-radius: var(--radius-sm);
      padding: 3px 10px;
      font-family: var(--font-heading);
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .unlock-lvl-btn.active {
      border-color: var(--fate-gold);
      color: var(--fate-gold);
      background: var(--fate-gold-glow);
    }

    /* NP */
    .np-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    @media (max-width: 500px) {
      .np-grid { grid-template-columns: 1fr; }
    }

    .np-section { display: flex; flex-direction: column; gap: 0.5rem; }
    .np-section-header { display: flex; align-items: center; gap: 0.5rem; }
    .np-section-title {
      font-family: var(--font-heading);
      font-size: 0.8rem;
      color: var(--fate-white);
    }

    /* Locked blocks */
    .locked-block {
      background: rgba(233, 30, 140, 0.04);
      border: 1px dashed var(--fate-magenta-dim);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }

    .locked-block-gold {
      background: rgba(212, 175, 55, 0.04);
      border-color: var(--fate-gold-dim);
    }

    .locked-block-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .lock-icon-big { font-size: 1.5rem; }

    .lock-desc {
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      color: var(--fate-muted);
      text-align: center;
    }

    /* Lore */
    .lore-section { display: flex; flex-direction: column; gap: 0.5rem; }
    .lore-header { display: flex; align-items: center; gap: 0.5rem; }
    .lore-title {
      font-family: var(--font-heading);
      font-size: 0.8rem;
      color: var(--fate-white);
    }
  `]
})
export class ServantSheetComponent implements OnInit {
  servant: Servant = this.defaultServant();
  saving = false;
  saved = false;
  error = '';
  activeTab = 'params';

  servantClasses = SERVANT_CLASSES;
  ranks = RANKS;

  paramKeys = [
    { key: 'strength',  label: 'STR — Fuerza' },
    { key: 'endurance', label: 'END — Resistencia' },
    { key: 'agility',   label: 'AGI — Agilidad' },
    { key: 'mana',      label: 'MGI — Magia' },
    { key: 'luck',      label: 'LCK — Suerte' },
    { key: 'np',        label: 'NP — Noble Phantasm' },
  ];

  constructor(
    private auth: AuthService,
    private servantService: ServantService
  ) {}

  get friendship(): number { return this.servant.friendship_level; }

  async ngOnInit() {
    if (!this.auth.currentUserId) return;
    const existing = await this.servantService.getServant(this.auth.currentUserId);
    if (existing) this.servant = existing;
  }

  defaultServant(): Servant {
    return {
      user_id: '',
      class_name: 'Saber',
      alias: '',
      true_name: '',
      avatar_url: null,
      friendship_level: 1,
      strength:  { rank: 'E', value: 1 },
      endurance: { rank: 'E', value: 1 },
      agility:   { rank: 'E', value: 1 },
      mana:      { rank: 'E', value: 1 },
      luck:      { rank: 'E', value: 1 },
      np:        { rank: 'E', value: 1 },
      skills: [
        { name: '', description: '', rank: 'A', locked_until: 1 },
        { name: '', description: '', rank: 'B', locked_until: 3 },
        { name: '', description: '', rank: 'A+', locked_until: 5 },
      ],
      noble_phantasm: {
        name: '', true_name: '', type: '',
        rank: 'A', description: '', true_description: ''
      },
      alignment: '',
      origin: '',
      lore: '',
      true_lore: '',
      bond_episode: ''
    };
  }

  getClassInitial(): string {
    return this.servant.class_name?.charAt(0) ?? '?';
  }

  getFriendshipLabel(): string {
    const labels = [
      '', 'Extraño', 'Conocido', 'Aliado', 'Compañero', 'Vínculo Eterno'
    ];
    return labels[this.friendship] ?? '';
  }

  setFriendship(level: number) {
    this.servant.friendship_level = level;
  }

  getParam(key: string): ServantStat {
    return (this.servant as any)[key] as ServantStat;
  }

  setParamRank(key: string, rank: string) {
    (this.servant as any)[key] = {
      rank,
      value: RANK_VALUES[rank] ?? 1
    };
  }

  getRankPercent(rank: string): number {
    return Math.round(((RANK_VALUES[rank] ?? 1) / 7) * 100);
  }

  addSkill() {
    this.servant.skills = [
      ...this.servant.skills,
      { name: '', description: '', rank: 'B', locked_until: 1 }
    ];
  }

  removeSkill(index: number) {
    this.servant.skills = this.servant.skills.filter((_, i) => i !== index);
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      this.servant.avatar_url = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async saveServant() {
    if (!this.auth.currentUserId) return;
    this.saving = true;
    this.error = '';
    this.saved = false;
    try {
      this.servant.user_id = this.auth.currentUserId;
      await this.servantService.upsertServant(this.servant);
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    } catch (err: any) {
      this.error = err.message ?? 'Error al guardar.';
    } finally {
      this.saving = false;
    }
  }
}