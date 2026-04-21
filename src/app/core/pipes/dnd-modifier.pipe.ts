import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dndModifier', standalone: true })
export class DndModifierPipe implements PipeTransform {
  transform(statValue: number): string {
    const mod = Math.floor((statValue - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }
}

export function getModifier(stat: number): number {
  return Math.floor((stat - 10) / 2);
}

// Bono de competencia según nivel
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}