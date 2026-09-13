import { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type SwipeDirection = 'left' | 'right';

export type Pet = {
  id: number;
  name: string;
}

export type EventOption = {
  id: string;
  label: string;
  icon?: IconName;
  color?: string;
  bg?: string;
  swipe?: SwipeDirection;
};

export type EventType = {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  bg: string;

  isSystem: boolean;
  isHidden: boolean;
  isPredictable: boolean;

  options: EventOption[];
};