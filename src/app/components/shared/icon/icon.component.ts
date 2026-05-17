import { Component, input } from '@angular/core';
import {
  LucideAward,
  LucideCalendar,
  LucideChartColumn,
  LucideHand,
  LucideHandshake,
  LucideHeart,
  LucideLandmark,
  LucideStar,
  LucideSun,
  LucideTrendingUp,
  LucideTrophy,
  LucideUsers,
} from '@lucide/angular';

import { AppIconName } from './icon.types';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [
    LucideLandmark,
    LucideStar,
    LucideHandshake,
    LucideHand,
    LucideHeart,
    LucideSun,
    LucideTrophy,
    LucideTrendingUp,
    LucideUsers,
    LucideCalendar,
    LucideAward,
    LucideChartColumn,
  ],
  template: `
    @switch (name()) {
      @case ('landmark') {
        <svg lucideLandmark [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('star') {
        <svg lucideStar [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('handshake') {
        <svg lucideHandshake [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('hand') {
        <svg lucideHand [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('heart') {
        <svg lucideHeart [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('sun') {
        <svg lucideSun [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('trophy') {
        <svg lucideTrophy [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('trending-up') {
        <svg lucideTrendingUp [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('users') {
        <svg lucideUsers [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('calendar') {
        <svg lucideCalendar [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('award') {
        <svg lucideAward [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
      @case ('chart-column') {
        <svg lucideChartColumn [size]="size()" [strokeWidth]="strokeWidth()" aria-hidden="true" />
      }
    }
  `,
  host: {
    class: 'app-icon inline-flex shrink-0 items-center justify-center',
  },
})
export class IconComponent {
  readonly name = input.required<AppIconName>();
  readonly size = input(22);
  readonly strokeWidth = input(1.75);
}
