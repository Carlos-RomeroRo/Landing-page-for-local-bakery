import { AppIconName } from '../../shared/icon';

export interface AchievementStat {
  id: string;
  icon: AppIconName;
  title: string;
  description: string;
  tag: string;
  value?: string;
}
