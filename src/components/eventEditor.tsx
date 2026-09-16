import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import type { EventOption, IconName, SwipeDirection } from '@/data/models';
import { colors } from '@/theme/tokens';

// Event icons and colors are customizable data, not theme tokens (see
// .docs/ui.md). These curated choices mirror the presentation style of the
// seeded system events and are filtered against the installed icon font so a
// renamed glyph can never render blank.
const ICON_NAMES = [
  'water',
  'water-outline',
  'emoticon-poop',
  'food-drumstick',
  'bowl',
  'bone',
  'dog',
  'cat',
  'paw',
  'soccer',
  'tennis-ball',
  'frisbee',
  'flash',
  'heart-pulse',
  'pill',
  'medical-bag',
  'syringe',
  'stethoscope',
  'thermometer',
  'toothbrush',
  'toothbrush-paste',
  'scissors',
  'brush',
  'bathtub',
  'bed',
  'sleep',
  'star',
  'calendar',
] as const;

const ICON_CHOICES = ICON_NAMES.filter(
  (name) => name in MaterialCommunityIcons.glyphMap
) as IconName[];

type ColorChoice = { label: string; color: string; bg: string };

const COLOR_CHOICES: ColorChoice[] = [
  { label: 'Amber', color: '#e5a414', bg: '#fff2c9' },
  { label: 'Orange', color: '#c95e18', bg: '#ffeede' },
  { label: 'Red', color: '#b3372f', bg: '#ffe2e4' },
  { label: 'Rose', color: '#b03968', bg: '#ffe9f0' },
  { label: 'Purple', color: '#5b3ea8', bg: '#efe9ff' },
  { label: 'Indigo', color: '#43218d', bg: '#eee5ff' },
  { label: 'Blue', color: '#2775d4', bg: '#e1f0ff' },
  { label: 'Sky', color: '#1c58a6', bg: '#e3f1ff' },
  { label: 'Teal', color: '#157f7a', bg: '#e0f5f4' },
  { label: 'Green', color: '#2d7c3e', bg: '#e1f7e4' },
  { label: 'Slate', color: '#54657a', bg: '#e9eef4' },
  { label: 'Gray', color: '#6b6b6b', bg: '#f1efec' },
];

export type ColorPair = { color: string; bg: string };

export const DEFAULT_COLOR_PAIR: ColorPair = COLOR_CHOICES[0];

export type EventOptionDraft = {
  label: string;
  icon?: IconName;
  color?: string;
  bg?: string;
  swipe?: SwipeDirection;
};

type EventIconPickerProps = {
  selected?: IconName;
  onSelect: (icon: IconName | undefined) => void;
  allowNone?: boolean;
};

export function EventIconPicker({ selected, onSelect, allowNone = false }: EventIconPickerProps) {
  return (
    <View className="mt-2 flex-row flex-wrap gap-2">
      {allowNone && (
        <Pressable
          onPress={() => onSelect(undefined)}
          className={`h-10 w-10 items-center justify-center rounded-full border-2 ${
            selected ? 'border-transparent bg-option-surface' : 'border-accent bg-accent-surface'
          }`}
          accessibilityLabel="No icon">
          <MaterialCommunityIcons name="minus" size={18} color={colors['option-icon']} />
        </Pressable>
      )}

      {ICON_CHOICES.map((name) => {
        const isSelected = name === selected;

        return (
          <Pressable
            key={name}
            onPress={() => onSelect(name)}
            className={`h-10 w-10 items-center justify-center rounded-full border-2 ${
              isSelected
                ? 'border-accent bg-accent-surface'
                : 'border-transparent bg-option-surface'
            }`}
            accessibilityLabel={name}>
            <MaterialCommunityIcons
              name={name}
              size={19}
              color={isSelected ? colors.accent : colors['option-icon']}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

type EventColorPickerProps = {
  pair?: { color?: string; bg?: string };
  onSelect: (pair: ColorChoice | undefined) => void;
  previewIcon?: IconName;
  allowNone?: boolean;
};

export function EventColorPicker({
  pair,
  onSelect,
  previewIcon,
  allowNone = false,
}: EventColorPickerProps) {
  return (
    <View className="mt-2 flex-row flex-wrap gap-2">
      {allowNone && (
        <Pressable
          onPress={() => onSelect(undefined)}
          className={`h-10 w-10 items-center justify-center rounded-full border-2 ${
            pair ? 'border-transparent' : 'border-accent'
          }`}
          style={{ backgroundColor: colors['option-surface'] }}
          accessibilityLabel="Default colors">
          <MaterialCommunityIcons name="minus" size={18} color={colors['option-icon']} />
        </Pressable>
      )}

      {COLOR_CHOICES.map((choice) => {
        const isSelected = !!pair && pair.color === choice.color && pair.bg === choice.bg;

        return (
          <Pressable
            key={choice.color}
            onPress={() => onSelect(choice)}
            className={`h-10 w-10 items-center justify-center rounded-full border-2 ${
              isSelected ? 'border-accent' : 'border-transparent'
            }`}
            style={{ backgroundColor: choice.bg }}
            accessibilityLabel={`${choice.label} color`}>
            {previewIcon && (
              <MaterialCommunityIcons name={previewIcon} size={18} color={choice.color} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

type EventToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function EventToggleRow({ label, description, value, onChange }: EventToggleRowProps) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="flex-1 pr-3">
        <Text className="text-[15px] font-semibold text-foreground">{label}</Text>
        <Text className="mt-0.5 text-[12px] text-foreground-muted">{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors['border-strong'] }}
        ios_backgroundColor={colors['border-strong']}
      />
    </View>
  );
}

type EventOptionRowProps = {
  option: EventOption;
  index: number;
  lastIndex: number;
  width: number;
  onPress: () => void;
};

export function EventOptionRow({ option, index, lastIndex, width, onPress }: EventOptionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-[56px] flex-row items-center border-x border-border bg-surface px-4 active:opacity-80 ${
        index === 0 ? 'rounded-t-2xl border-t' : ''
      } ${index === lastIndex ? 'rounded-b-2xl border-b' : 'border-b'}`}
      style={{ width }}
      accessible
      accessibilityLabel={`${option.label} option`}
      accessibilityHint="Opens option editor. Long press, then drag to reorder">
      <Ionicons name="reorder-three" size={25} color={colors['icon-muted']} />

      <View
        className="ml-3 h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: option.bg ?? colors['option-surface'] }}>
        {option.icon && (
          <MaterialCommunityIcons
            name={option.icon}
            size={16}
            color={option.color ?? colors['option-icon']}
          />
        )}
      </View>

      <Text className="ml-3 flex-1 text-[15px] font-semibold text-foreground">{option.label}</Text>

      {option.swipe && (
        <MaterialCommunityIcons
          name={option.swipe === 'left' ? 'gesture-swipe-left' : 'gesture-swipe-right'}
          size={16}
          color={colors['icon-muted']}
        />
      )}
      <Ionicons name="chevron-forward" size={18} color={colors['icon-muted']} className="ml-1" />
    </Pressable>
  );
}

type EventOptionEditorSheetProps = {
  visible: boolean;
  contextLabel: string;
  option: EventOption | null;
  onClose: () => void;
  onSave: (draft: EventOptionDraft) => void;
  onDelete?: () => void;
};

export function EventOptionEditorSheet({
  visible,
  contextLabel,
  option,
  onClose,
  onSave,
  onDelete,
}: EventOptionEditorSheetProps) {
  // Keying the body by the option and visibility resets the draft state through
  // a remount whenever the sheet opens, so no seeding effect is needed.
  const sheetKey = `${option?.id ?? 'new'}-${visible}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/30" onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            className="rounded-t-[28px] bg-surface px-5 pb-8 pt-5"
            onPress={(e) => e.stopPropagation()}>
            <SheetBody
              key={sheetKey}
              contextLabel={contextLabel}
              option={option}
              onClose={onClose}
              onSave={onSave}
              onDelete={onDelete}
            />
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

type SheetBodyProps = {
  contextLabel: string;
  option: EventOption | null;
  onClose: () => void;
  onSave: (draft: EventOptionDraft) => void;
  onDelete?: () => void;
};

function SheetBody({ contextLabel, option, onClose, onSave, onDelete }: SheetBodyProps) {
  const [label, setLabel] = useState(option?.label ?? '');
  const [icon, setIcon] = useState<IconName | undefined>(option?.icon);
  const [colorPair, setColorPair] = useState<{ color?: string; bg?: string } | undefined>(() =>
    option?.color || option?.bg ? { color: option.color, bg: option.bg } : undefined
  );
  const [swipe, setSwipe] = useState<SwipeDirection | undefined>(option?.swipe);

  const save = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      Toast.show({ type: 'status', text1: 'Option label is required' });
      return;
    }

    onSave({ label: trimmed, icon, color: colorPair?.color, bg: colorPair?.bg, swipe });
  };

  return (
    <>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-[20px] font-bold text-foreground">
            {option ? 'Edit option' : 'New option'}
          </Text>
          <Text className="mt-1 text-[13px] text-foreground-muted">{contextLabel}</Text>
        </View>
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-option-surface"
          accessibilityLabel="Close option editor"
          onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        className="max-h-[460px]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Label
        </Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          className="mt-2 h-14 rounded-[16px] border border-border px-4 text-[15px] font-semibold text-foreground"
          placeholder="Option label"
          placeholderTextColor={colors['foreground-muted']}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <Text className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Icon
        </Text>
        <EventIconPicker selected={icon} onSelect={setIcon} allowNone />

        <Text className="mt-5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Color
        </Text>
        <EventColorPicker pair={colorPair} onSelect={setColorPair} previewIcon={icon} allowNone />

        <Text className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Swipe Action
        </Text>
        <View className="mt-2 flex-row gap-2">
          {(['none', 'left', 'right'] as const).map((choice) => {
            const isSelected = choice === (swipe ?? 'none');
            const label = choice === 'none' ? 'None' : choice === 'left' ? 'Left' : 'Right';

            return (
              <Pressable
                key={choice}
                onPress={() => setSwipe(choice === 'none' ? undefined : choice)}
                className={`h-10 flex-1 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? 'border-accent bg-accent-surface'
                    : 'border-transparent bg-option-surface'
                }`}
                accessibilityLabel={`${label} swipe action`}>
                <Text
                  className={`text-[13px] font-semibold ${
                    isSelected ? 'text-accent' : 'text-foreground-secondary'
                  }`}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-2 text-[12px] text-foreground-muted">
          A swipe action reveals the option without expanding the row. Only one option per
          direction; assigning it here takes it over.
        </Text>
      </ScrollView>

      {option && onDelete && (
        <Pressable
          className="mt-4 h-11 flex-row items-center justify-center rounded-[14px] border border-border active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Delete option"
          onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text className="ml-2 text-[14px] font-semibold text-danger">Delete Option</Text>
        </Pressable>
      )}

      <View className="mt-3 flex-row gap-3">
        <Pressable
          className="h-12 flex-1 items-center justify-center rounded-[16px] bg-option-surface"
          onPress={onClose}>
          <Text className="text-[15px] font-semibold text-foreground-secondary">Cancel</Text>
        </Pressable>
        <Pressable
          className="h-12 flex-1 items-center justify-center rounded-[16px] bg-primary active:opacity-80"
          onPress={save}>
          <Text className="text-[15px] font-semibold text-on-primary">Save</Text>
        </Pressable>
      </View>
    </>
  );
}
