import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CharacterService } from '../../core/services/character.service';
import { CharacterSheet, STAT_LABELS, DND_SKILLS, DndStats } from '../../core/models/models';
import { DndModifierPipe, getModifier, getProficiencyBonus } from '../../core/pipes/dnd-modifier.pipe';

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, DndModifierPipe],
  template: `
    <div class="sheet-wrapper">

      <!-- ENCABEZADO -->
      <div class="fate-card fate-card-gold sheet-header">
        <div class="header-top">
          <div>
            <h1 class="sheet-title">Hoja de Personaje</h1>
            <p class="sheet-subtitle text-muted">Sistema D&D 5e — Fate/Stay Night</p>
          </div>
          <div class="header-actions">
            @if (saved) {
              <span class="save-badge">✓ Guardado</span>
            }
            <button class="fate-btn fate-btn-primary"
                    (click)="saveSheet()" [disabled]="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>

        <div class="basic-info-grid">
          <div class="form-group">
            <label>Nombre del Personaje</label>
            <input type="text" class="fate-input"
                   [(ngModel)]="sheet.character_name" placeholder="Nombre..."/>
          </div>
          <div class="form-group">
            <label>Raza</label>
            <input type="text" class="fate-input"
                   [(ngModel)]="sheet.race" placeholder="Humano, Elfo..."/>
          </div>
          <div class="form-group">
            <label>Clase</label>
            <input type="text" class="fate-input"
                   [(ngModel)]="sheet.class" placeholder="Guerrero, Mago..."/>
          </div>
          <div class="form-group">
            <label>Trasfondo</label>
            <input type="text" class="fate-input"
                   [(ngModel)]="sheet.background" placeholder="Noble, Forajido..."/>
          </div>
          <div class="form-group">
            <label>Alineamiento</label>
            <select class="fate-input" [(ngModel)]="sheet.alignment">
              <option value="">— Seleccionar —</option>
              <option>Legal Bueno</option>
              <option>Neutral Bueno</option>
              <option>Caótico Bueno</option>
              <option>Legal Neutral</option>
              <option>Neutral Verdadero</option>
              <option>Caótico Neutral</option>
              <option>Legal Malvado</option>
              <option>Neutral Malvado</option>
              <option>Caótico Malvado</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nivel</label>
            <input type="number" class="fate-input"
                   [(ngModel)]="sheet.level" min="1" max="20"
                   (ngModelChange)="onLevelChange()"/>
          </div>
        </div>

        <div class="xp-row">
          <div class="form-group" style="flex:1;min-width:140px;">
            <label>Puntos de Experiencia</label>
            <input type="number" class="fate-input"
                   [(ngModel)]="sheet.experience_points" min="0"/>
          </div>
          <div class="pill-badge">
            <span class="pill-label">Bono Competencia</span>
            <span class="pill-value text-gold">+{{ sheet.proficiency_bonus }}</span>
          </div>
          <div class="pill-badge">
            <span class="pill-label">Inspiración</span>
            <input type="checkbox" class="fate-checkbox" [(ngModel)]="sheet.inspiration"/>
          </div>
        </div>
      </div>

      <!-- TABS en móvil -->
      <div class="sheet-tabs">
        <button class="tab-btn" [class.active]="activeTab === 'stats'"
                (click)="activeTab = 'stats'">Estadísticas</button>
        <button class="tab-btn" [class.active]="activeTab === 'combat'"
                (click)="activeTab = 'combat'">Combate</button>
        <button class="tab-btn" [class.active]="activeTab === 'skills'"
                (click)="activeTab = 'skills'">Habilidades</button>
        <button class="tab-btn" [class.active]="activeTab === 'notes'"
                (click)="activeTab = 'notes'">Notas</button>
      </div>

      <div class="sheet-body">

        <!-- ── COLUMNA IZQUIERDA ── -->
        <div class="sheet-col" [class.tab-hidden]="activeTab !== 'stats'">

          <!-- ESTADÍSTICAS -->
          <div class="fate-card">
            <h3 class="section-title text-magenta">Estadísticas Principales</h3>
            <div class="stats-grid">
              @for (statKey of statKeys; track statKey) {
                <div class="stat-box" [class.stat-focused]="focusedStat === statKey">
                  <span class="stat-label">{{ statLabels[statKey] }}</span>
                  <input
                    type="number"
                    [ngModel]="sheet[statKey]"
                    (ngModelChange)="onStatChange(statKey, $event)"
                    min="1" max="30"
                    (focus)="focusedStat = statKey"
                    (blur)="focusedStat = ''"
                  />
                  <span class="stat-modifier"
                    [class.positive]="getModifier(sheet[statKey]) > 0"
                    [class.negative]="getModifier(sheet[statKey]) < 0"
                    [class.zero]="getModifier(sheet[statKey]) === 0">
                    {{ sheet[statKey] | dndModifier }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- TIRADAS DE SALVACIÓN -->
          <div class="fate-card mt-2">
            <h3 class="section-title text-gold">Tiradas de Salvación</h3>
            <div class="prof-list">
              @for (statKey of statKeys; track statKey) {
                <div class="prof-row" (click)="toggleSavingThrow(statKey)">
                  <div class="prof-dot"
                    [class.prof-dot-active]="hasSavingThrow(statKey)"
                    [title]="hasSavingThrow(statKey) ? 'Con competencia' : 'Sin competencia'">
                    @if (hasSavingThrow(statKey)) { ✦ } @else { ○ }
                  </div>
                  <span class="prof-bonus"
                    [class.text-cyan]="hasSavingThrow(statKey)"
                    [class.text-muted]="!hasSavingThrow(statKey)">
                    {{ getSavingThrowBonus(statKey) }}
                  </span>
                  <span class="prof-name">{{ statLabels[statKey] }}</span>
                  <span class="prof-tag"
                    [class.tag-yes]="hasSavingThrow(statKey)"
                    [class.tag-no]="!hasSavingThrow(statKey)">
                    {{ hasSavingThrow(statKey) ? 'Competente' : 'Sin comp.' }}
                  </span>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- ── COLUMNA HABILIDADES ── -->
        <div class="sheet-col" [class.tab-hidden]="activeTab !== 'skills'">
          <div class="fate-card">
            <h3 class="section-title text-cyan">Habilidades</h3>
            <p class="skills-hint text-muted">
              Haz clic en una habilidad para marcar/desmarcar competencia
            </p>
            <div class="skills-list">
              @for (skill of dndSkills; track skill.name) {
                <div class="prof-row skill-row-item"
                     [class.skill-proficient]="hasSkill(skill.name)"
                     (click)="toggleSkill(skill.name)">
                  <div class="prof-dot"
                    [class.prof-dot-active]="hasSkill(skill.name)">
                    @if (hasSkill(skill.name)) { ✦ } @else { ○ }
                  </div>
                  <span class="prof-bonus"
                    [class.text-cyan]="hasSkill(skill.name)"
                    [class.text-muted]="!hasSkill(skill.name)">
                    {{ getSkillBonus(skill) }}
                  </span>
                  <span class="prof-name">{{ skill.name }}</span>
                  <span class="skill-stat-tag">{{ getStatAbbr(skill.stat) }}</span>
                  <span class="prof-tag"
                    [class.tag-yes]="hasSkill(skill.name)"
                    [class.tag-no]="!hasSkill(skill.name)">
                    {{ hasSkill(skill.name) ? 'Competente' : 'Sin comp.' }}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── COLUMNA DERECHA ── -->
        <div class="sheet-col" [class.tab-hidden]="activeTab !== 'combat'">

          <!-- COMBATE -->
          <div class="fate-card">
            <h3 class="section-title text-magenta">Combate</h3>
            <div class="combat-grid">

              <div class="combat-box">
                <label>PG Máximos</label>
                <input type="number" class="fate-input"
                       [(ngModel)]="sheet.max_hp" min="1"/>
              </div>

              <div class="combat-box">
                <label>Clase de Armadura</label>
                <input type="number" class="fate-input"
                       [(ngModel)]="sheet.armor_class" min="1"/>
              </div>

              <div class="combat-box">
                <label>Velocidad (pies)</label>
                <input type="number" class="fate-input"
                       [(ngModel)]="sheet.speed" min="0"/>
              </div>

              <div class="combat-box">
                <label>Iniciativa</label>
                <div class="auto-display">
                  {{ getModifier(sheet.dexterity) >= 0 ? '+' : '' }}{{ getModifier(sheet.dexterity) }}
                </div>
                <span class="auto-note text-muted">Auto — DEX</span>
              </div>

              <div class="combat-box">
                <label>Dados de Golpe</label>
                <div class="auto-display text-gold">
                  {{ sheet.level }}d{{ getHitDie() }}
                </div>
                <span class="auto-note text-muted">Auto — Clase/Nivel</span>
              </div>

            </div>

            <!-- BARRA DE HP -->
            <div class="hp-section">
              <div class="hp-header">
                <label>PG Actuales</label>
                <span class="hp-fraction">
                  <span [class.text-danger]="getHpPercent() < 30"
                        [class.text-gold]="getHpPercent() >= 30 && getHpPercent() < 70"
                        [class.text-cyan]="getHpPercent() >= 70">
                    {{ sheet.current_hp }}
                  </span>
                  <span class="text-muted"> / {{ sheet.max_hp }}</span>
                </span>
              </div>
              <div class="hp-controls">
                <button class="hp-btn" (click)="changeHp(-1)">−</button>
                <div class="hp-bar-wrap">
                  <div class="hp-bar">
                    <div class="hp-fill"
                      [style.width.%]="getHpPercent()"
                      [class.hp-low]="getHpPercent() < 30"
                      [class.hp-mid]="getHpPercent() >= 30 && getHpPercent() < 70">
                    </div>
                  </div>
                  <span class="hp-percent text-muted">{{ getHpPercent() }}%</span>
                </div>
                <button class="hp-btn" (click)="changeHp(1)">+</button>
              </div>
              <input type="number" class="fate-input" [(ngModel)]="sheet.current_hp"
                     [min]="0" [max]="sheet.max_hp" style="margin-top:8px;"/>
            </div>
          </div>

          <!-- TIRADAS DE MUERTE -->
          <div class="fate-card mt-2">
            <h3 class="section-title text-gold">Tiradas de Muerte</h3>
            <div class="death-saves">
              <div class="death-row">
                <span class="death-label text-cyan">Éxitos</span>
                <div class="death-checks">
                  @for (i of [0,1,2]; track i) {
                    <div class="death-die"
                         [class.death-success]="deathSuccesses[i]"
                         (click)="deathSuccesses[i] = !deathSuccesses[i]">
                      {{ deathSuccesses[i] ? '✦' : '○' }}
                    </div>
                  }
                </div>
              </div>
              <div class="death-row">
                <span class="death-label text-danger">Fracasos</span>
                <div class="death-checks">
                  @for (i of [0,1,2]; track i) {
                    <div class="death-die"
                         [class.death-fail]="deathFailures[i]"
                         (click)="deathFailures[i] = !deathFailures[i]">
                      {{ deathFailures[i] ? '✦' : '○' }}
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ── NOTAS ── -->
        <div class="sheet-col notes-col" [class.tab-hidden]="activeTab !== 'notes'">
          <div class="fate-card">
            <h3 class="section-title text-muted">Notas del Personaje</h3>
            <textarea class="fate-input" rows="8"
              [(ngModel)]="sheet.notes"
              placeholder="Rasgos de personalidad, ideales, vínculos, defectos, equipo, historia...">
            </textarea>
          </div>

          @if (error) {
            <div class="fate-alert fate-alert-error mt-2">{{ error }}</div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .sheet-wrapper { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Header */
    .sheet-header { padding: 1.5rem; }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .sheet-title {
      font-family: var(--font-display);
      font-size: 1.4rem;
      color: var(--fate-gold);
    }

    .sheet-subtitle { font-size: 0.78rem; margin-top: 4px; }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .save-badge {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      color: #00d464;
      letter-spacing: 0.1em;
    }

    .basic-info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    @media (max-width: 600px) {
      .basic-info-grid { grid-template-columns: 1fr 1fr; }
    }

    .xp-row {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      margin-top: 0.75rem;
      flex-wrap: wrap;
    }

    .pill-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: var(--fate-deep);
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-md);
      padding: 0.5rem 0.9rem;
      white-space: nowrap;
    }

    .pill-label {
      font-family: var(--font-heading);
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--fate-muted);
    }

    .pill-value {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
    }

    .fate-checkbox {
      width: 22px; height: 22px;
      accent-color: var(--fate-magenta);
      cursor: pointer;
    }

    /* TABS */
    .sheet-tabs {
      display: none;
      background: var(--fate-panel);
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-lg);
      padding: 4px;
      gap: 4px;
    }

    @media (max-width: 900px) {
      .sheet-tabs { display: flex; }
    }

    .tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--fate-muted);
      font-family: var(--font-heading);
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.5rem 0.25rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: var(--fate-magenta-glow);
      color: var(--fate-magenta);
    }

    /* Body */
    .sheet-body {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
      align-items: start;
    }

    .notes-col { grid-column: span 1; }

    @media (max-width: 1100px) {
      .sheet-body { grid-template-columns: 1fr 1fr; }
      .notes-col { grid-column: span 2; }
    }

    @media (max-width: 900px) {
      .sheet-body { grid-template-columns: 1fr; }
      .notes-col { grid-column: span 1; }
      .tab-hidden { display: none !important; }
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    /* Stat boxes */
    .stat-box { transition: border-color 0.2s; }
    .stat-box.stat-focused { border-color: var(--fate-magenta); }

    /* Proficiency rows — salvaciones y habilidades */
    .prof-list { display: flex; flex-direction: column; gap: 2px; }

    .prof-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.15s;
      font-size: 0.83rem;
    }

    .prof-row:hover { background: var(--fate-magenta-glow); }

    .prof-dot {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: var(--fate-muted);
      flex-shrink: 0;
      transition: color 0.2s;
    }

    .prof-dot-active { color: var(--fate-gold) !important; }

    .prof-bonus {
      font-family: var(--font-heading);
      font-size: 0.8rem;
      min-width: 30px;
      text-align: right;
      flex-shrink: 0;
    }

    .prof-name { flex: 1; color: var(--fate-white); }

    .prof-tag {
      font-family: var(--font-heading);
      font-size: 0.6rem;
      letter-spacing: 0.08em;
      padding: 2px 6px;
      border-radius: 10px;
      border: 1px solid;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .tag-yes {
      color: var(--fate-cyan);
      border-color: var(--fate-cyan-dim);
      background: rgba(0,212,255,0.06);
    }

    .tag-no {
      color: var(--fate-muted);
      border-color: var(--fate-border);
      background: transparent;
    }

    /* Skills extra */
    .skills-hint {
      font-size: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .skill-stat-tag {
      font-family: var(--font-heading);
      font-size: 0.62rem;
      color: var(--fate-gold);
      min-width: 28px;
      text-align: center;
      flex-shrink: 0;
    }

    .skill-proficient { background: rgba(0,212,255,0.04); }

    /* Combat */
    .combat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 500px) {
      .combat-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .combat-box {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .combat-box label {
      font-family: var(--font-heading);
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--fate-muted);
    }

    .auto-display {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--fate-white);
      text-align: center;
      padding: 6px 0;
    }

    .auto-note {
      font-size: 0.65rem;
      text-align: center;
    }

    /* HP */
    .hp-section { display: flex; flex-direction: column; gap: 6px; }

    .hp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .hp-header label {
      font-family: var(--font-heading);
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--fate-muted);
    }

    .hp-fraction { font-family: var(--font-heading); font-size: 1rem; }

    .hp-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hp-btn {
      background: var(--fate-panel);
      border: 1px solid var(--fate-border);
      color: var(--fate-white);
      border-radius: var(--radius-sm);
      width: 34px; height: 34px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;
    }

    .hp-btn:hover { border-color: var(--fate-magenta); color: var(--fate-magenta); }

    .hp-bar-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .hp-bar {
      height: 6px;
      background: var(--fate-border);
      border-radius: 3px;
      overflow: hidden;
    }

    .hp-fill {
      height: 100%;
      background: var(--fate-cyan);
      border-radius: 3px;
      transition: width 0.3s ease, background 0.3s ease;
    }

    .hp-fill.hp-mid { background: var(--fate-gold); }
    .hp-fill.hp-low { background: var(--fate-danger); }

    .hp-percent { font-size: 0.7rem; text-align: right; }

    /* Death saves */
    .death-saves { display: flex; flex-direction: column; gap: 12px; }

    .death-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .death-label {
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      min-width: 65px;
    }

    .death-checks { display: flex; gap: 10px; }

    .death-die {
      width: 32px; height: 32px;
      border: 1px solid var(--fate-border);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      color: var(--fate-muted);
      cursor: pointer;
      transition: all 0.2s;
    }

    .death-die:hover { border-color: var(--fate-magenta); }
    .death-success { border-color: var(--fate-cyan); color: var(--fate-cyan); background: rgba(0,212,255,0.08); }
    .death-fail { border-color: var(--fate-danger); color: var(--fate-danger); background: rgba(255,68,102,0.08); }
  `]
})
export class CharacterSheetComponent implements OnInit {
  sheet: CharacterSheet = this.defaultSheet();
  saving = false;
  saved = false;
  error = '';
  focusedStat = '';
  activeTab = 'stats';
  deathSuccesses = [false, false, false];
  deathFailures  = [false, false, false];

  statKeys = Object.keys(STAT_LABELS) as (keyof DndStats)[];
  statLabels = STAT_LABELS;
  dndSkills = DND_SKILLS;

  constructor(
    private auth: AuthService,
    private charService: CharacterService
  ) {}

  async ngOnInit() {
    if (!this.auth.currentUserId) return;
    const existing = await this.charService.getSheet(this.auth.currentUserId);
    if (existing) this.sheet = existing;
  }

  defaultSheet(): CharacterSheet {
    return {
      user_id: '',
      character_name: '',
      race: '',
      class: '',
      level: 1,
      background: '',
      alignment: '',
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      max_hp: 10,
      current_hp: 10,
      armor_class: 10,
      speed: 30,
      inspiration: false,
      proficiency_bonus: 2,
      saving_throws: [],
      skill_proficiencies: [],
      experience_points: 0,
      notes: null
    };
  }

  onStatChange(stat: keyof DndStats, value: number) {
    (this.sheet as any)[stat] = Number(value);
  }

  onLevelChange() {
    this.sheet.proficiency_bonus = getProficiencyBonus(this.sheet.level);
  }

  getModifier(stat: number): number { return getModifier(stat); }

  changeHp(delta: number) {
    const next = this.sheet.current_hp + delta;
    this.sheet.current_hp = Math.max(0, Math.min(this.sheet.max_hp, next));
  }

  getHpPercent(): number {
    if (this.sheet.max_hp <= 0) return 0;
    return Math.min(100, Math.max(0,
      Math.round((this.sheet.current_hp / this.sheet.max_hp) * 100)
    ));
  }

  getHitDie(): number {
    const map: Record<string, number> = {
      'bárbaro': 12, 'barbaro': 12,
      'guerrero': 10, 'paladín': 10, 'paladin': 10, 'ranger': 10,
      'bardo': 8, 'clérigo': 8, 'clerigo': 8, 'druida': 8,
      'monje': 8, 'pícaro': 8, 'picaro': 8,
      'hechicero': 6, 'brujo': 6, 'mago': 6
    };
    return map[this.sheet.class.toLowerCase().trim()] ?? 8;
  }

  hasSavingThrow(stat: string): boolean {
    return this.sheet.saving_throws.includes(stat);
  }

  toggleSavingThrow(stat: string) {
    this.sheet.saving_throws = this.hasSavingThrow(stat)
      ? this.sheet.saving_throws.filter(s => s !== stat)
      : [...this.sheet.saving_throws, stat];
  }

  getSavingThrowBonus(stat: keyof DndStats): string {
    const total = getModifier(this.sheet[stat]) +
      (this.hasSavingThrow(stat) ? this.sheet.proficiency_bonus : 0);
    return total >= 0 ? `+${total}` : `${total}`;
  }

  hasSkill(name: string): boolean {
    return this.sheet.skill_proficiencies.includes(name);
  }

  toggleSkill(name: string) {
    this.sheet.skill_proficiencies = this.hasSkill(name)
      ? this.sheet.skill_proficiencies.filter(s => s !== name)
      : [...this.sheet.skill_proficiencies, name];
  }

  getSkillBonus(skill: { name: string; stat: string }): string {
    const total = getModifier((this.sheet as any)[skill.stat]) +
      (this.hasSkill(skill.name) ? this.sheet.proficiency_bonus : 0);
    return total >= 0 ? `+${total}` : `${total}`;
  }

  getStatAbbr(stat: string): string {
    const map: Record<string, string> = {
      strength: 'FUE', dexterity: 'DES', constitution: 'CON',
      intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR'
    };
    return map[stat] ?? stat.slice(0, 3).toUpperCase();
  }

  async saveSheet() {
    if (!this.auth.currentUserId) return;
    this.saving = true;
    this.error = '';
    this.saved = false;
    try {
      this.sheet.user_id = this.auth.currentUserId;
      await this.charService.upsertSheet(this.sheet);
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    } catch (err: any) {
      this.error = err.message ?? 'Error al guardar.';
    } finally {
      this.saving = false;
    }
  }
}