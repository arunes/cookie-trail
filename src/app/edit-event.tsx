import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Sortable, { type SortableFlexDragEndCallback } from 'react-native-sortables';
import Toast from 'react-native-toast-message';

import {
  addEventOption,
  deleteEventOption,
  deleteEventType,
  getEventOptionLogCount,
  getEventType,
  getEventTypeLogCount,
  nextEventOptionId,
  reorderEventOptions,
  updateEventOption,
  updateEventType,
} from '@/data/events';
import type { EventOption, IconName } from '@/data/models';
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

export default function EditEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventTypeId = id;

  const [event] = useState(() => getEventType(id));
  const [label, setLabel] = useState(event?.label ?? '');
  const [icon, setIcon] = useState<IconName>(event?.icon ?? 'paw');
  const [colorPair, setColorPair] = useState(() => ({
    color: event?.color ?? COLOR_CHOICES[0].color,
    bg: event?.bg ?? COLOR_CHOICES[0].bg,
  }));
  const [isPredictable, setIsPredictable] = useState(event?.isPredictable ?? false);
  const [isHidden, setIsHidden] = useState(event?.isHidden ?? false);
  const [options, setOptions] = useState<EventOption[]>(event?.options ?? []);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<EventOption | null>(null);
  const [optionLabel, setOptionLabel] = useState('');
  const [optionIcon, setOptionIcon] = useState<IconName | undefined>(undefined);
  const [optionColor, setOptionColor] = useState<{ color?: string; bg?: string } | undefined>(
    undefined
  );

  const { width: screenWidth } = useWindowDimensions();
  const listWidth = screenWidth - 32;

  const handleOptionDragEnd = useCallback<SortableFlexDragEndCallback>(
    ({ order }) => {
      const reordered = order(options);
      if (reordered === options) return;

      setOptions(reordered);
      requestIdleCallback(() => {
        reorderEventOptions(
          eventTypeId,
          reordered.map((option) => option.id)
        );
      });
    },
    [options, eventTypeId]
  );

  const openNewOption = useCallback(() => {
    setEditingOption(null);
    setOptionLabel('');
    setOptionIcon(undefined);
    setOptionColor(undefined);
    setEditorOpen(true);
  }, []);

  const openEditOption = useCallback((option: EventOption) => {
    setEditingOption(option);
    setOptionLabel(option.label);
    setOptionIcon(option.icon);
    setOptionColor(option.color || option.bg ? { color: option.color, bg: option.bg } : undefined);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
  }, []);

  const saveOption = useCallback(() => {
    const trimmed = optionLabel.trim();
    if (!trimmed) {
      Toast.show({ type: 'status', text1: 'Option label is required' });
      return;
    }

    if (editingOption) {
      updateEventOption(eventTypeId, editingOption.id, {
        label: trimmed,
        icon: optionIcon,
        color: optionColor?.color,
        bg: optionColor?.bg,
      });

      setOptions((current) =>
        current.map((option) =>
          option.id === editingOption.id
            ? {
                ...option,
                label: trimmed,
                icon: optionIcon,
                color: optionColor?.color,
                bg: optionColor?.bg,
              }
            : option
        )
      );
    } else {
      const newOption: EventOption = {
        id: nextEventOptionId(eventTypeId, trimmed),
        label: trimmed,
        icon: optionIcon,
        color: optionColor?.color,
        bg: optionColor?.bg,
      };

      addEventOption(eventTypeId, newOption);
      setOptions((current) => [...current, newOption]);
    }

    setEditorOpen(false);
  }, [editingOption, optionLabel, optionIcon, optionColor, eventTypeId]);

  const confirmDeleteOption = useCallback(() => {
    if (!editingOption) return;

    const used = getEventOptionLogCount(eventTypeId, editingOption.id);
    Alert.alert(
      `Delete ${editingOption.label}?`,
      used > 0
        ? `This also permanently deletes ${used} logged ${used === 1 ? 'entry' : 'entries'} for this option. This cannot be undone.`
        : 'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEventOption(eventTypeId, editingOption.id);
            Toast.show({ type: 'status', text1: `${editingOption.label} deleted` });
            setOptions((current) => current.filter((option) => option.id !== editingOption.id));
            setEditorOpen(false);
          },
        },
      ]
    );
  }, [editingOption, eventTypeId]);

  const saveEvent = useCallback(() => {
    const trimmed = label.trim();
    if (!trimmed) {
      Toast.show({ type: 'status', text1: 'Event label is required' });
      return;
    }

    updateEventType(eventTypeId, {
      label: trimmed,
      icon,
      color: colorPair.color,
      bg: colorPair.bg,
      isPredictable,
      isHidden,
    });

    Toast.show({ type: 'status', text1: `${trimmed} updated` });
    router.back();
  }, [label, icon, colorPair, isPredictable, isHidden, eventTypeId]);

  const confirmDeleteEvent = useCallback(() => {
    if (!event) return;

    const count = getEventTypeLogCount(eventTypeId);
    Alert.alert(
      `Delete ${event.label}?`,
      count > 0
        ? `This also permanently deletes ${count} logged ${count === 1 ? 'entry' : 'entries'} for this event. This cannot be undone.`
        : 'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEventType(eventTypeId);
            Toast.show({ type: 'status', text1: `${event.label} deleted` });
            router.back();
          },
        },
      ]
    );
  }, [event, eventTypeId]);

  if (!event) {
    return (
      <View className="flex-1 bg-background px-4">
        <BackButton />
        <Text className="mt-4 text-[25px] font-bold tracking-[-1px] text-foreground">
          Edit Event
        </Text>
        <Text className="mt-2 text-[13px] text-foreground-muted">Event not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <BackButton />

        <Text className="mt-4 text-[25px] font-bold tracking-[-1px] text-foreground">
          Edit Event
        </Text>

        {/* Live preview of the current icon, color, and label */}
        <View className="mt-5 flex-row items-center rounded-2xl border border-border bg-surface p-4">
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: colorPair.bg }}>
            <MaterialCommunityIcons name={icon} size={28} color={colorPair.color} />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-[17px] font-semibold text-foreground">
              {label || event.label}
            </Text>
            <Text className="mt-0.5 text-[12px] text-foreground-muted">
              {event.isSystem ? 'System event' : 'Custom event'}
              {isHidden ? ' · Hidden' : ''}
            </Text>
          </View>
        </View>

        {/* Label */}
        <Text className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Label
        </Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          className="mt-2 h-14 rounded-[16px] border border-border bg-surface px-4 text-[15px] font-semibold text-foreground"
          placeholder="Event label"
          placeholderTextColor={colors['foreground-muted']}
          autoCapitalize="words"
          returnKeyType="done"
        />

        {/* Icon */}
        <Text className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Icon
        </Text>
        <IconPicker
          selected={icon}
          onSelect={(name) => {
            if (name) setIcon(name);
          }}
        />

        {/* Color */}
        <Text className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Color
        </Text>
        <ColorPicker
          pair={colorPair}
          onSelect={(choice) => {
            if (choice) setColorPair(choice);
          }}
          previewIcon={icon}
        />

        {/* Flags */}
        <View className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <ToggleRow
            label="Predictable"
            description="Used for Upcoming predictions"
            value={isPredictable}
            onChange={setIsPredictable}
          />
          <View className="h-px bg-border" />
          <ToggleRow
            label="Hidden"
            description="Hidden events don't appear on Home"
            value={isHidden}
            onChange={setIsHidden}
          />
        </View>

        {/* Options */}
        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
            Options
          </Text>
          <Pressable
            className="min-h-11 justify-center px-2 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel="Add option"
            onPress={openNewOption}>
            <Text className="text-[14px] font-semibold text-accent">Add</Text>
          </Pressable>
        </View>
        <Text className="mt-1 text-[12px] text-foreground-muted">
          Tap an option to edit it. Long press and drag to reorder.
        </Text>

        <View className="mt-3">
          <Sortable.Flex
            flexDirection="column"
            width={listWidth}
            strategy="insert"
            overDrag="vertical"
            dragActivationDelay={250}
            hapticsEnabled
            autoScrollEnabled={false}
            activeItemScale={1}
            inactiveItemOpacity={1}
            onDragEnd={handleOptionDragEnd}>
            {options.map((option, index) => (
              <OptionRow
                key={option.id}
                option={option}
                index={index}
                lastIndex={options.length - 1}
                width={listWidth}
                onPress={() => openEditOption(option)}
              />
            ))}
          </Sortable.Flex>

          {options.length === 0 && (
            <Text className="mt-2 text-[13px] text-foreground-muted">
              No options yet. Add one so this event can be logged.
            </Text>
          )}
        </View>

        {/* Save / Delete */}
        <Pressable
          className="mt-8 h-12 items-center justify-center rounded-[16px] bg-primary active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Save event"
          onPress={saveEvent}>
          <Text className="text-[15px] font-semibold text-on-primary">Save</Text>
        </Pressable>

        {!event.isSystem && (
          <Pressable
            className="mt-3 h-12 flex-row items-center justify-center rounded-[16px] border border-border active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Delete event"
            onPress={confirmDeleteEvent}>
            <Ionicons name="trash-outline" size={19} color={colors.danger} />
            <Text className="ml-2 text-[15px] font-semibold text-danger">Delete Event</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Option editor */}
      <Modal visible={editorOpen} transparent animationType="slide" onRequestClose={closeEditor}>
        <Pressable className="flex-1 justify-end bg-black/30" onPress={closeEditor}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable
              className="rounded-t-[28px] bg-surface px-5 pb-8 pt-5"
              onPress={(e) => e.stopPropagation()}>
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-[20px] font-bold text-foreground">
                    {editingOption ? 'Edit option' : 'New option'}
                  </Text>
                  <Text className="mt-1 text-[13px] text-foreground-muted">{event.label}</Text>
                </View>
                <Pressable
                  className="h-10 w-10 items-center justify-center rounded-full bg-option-surface"
                  accessibilityLabel="Close option editor"
                  onPress={closeEditor}>
                  <Ionicons name="close" size={22} color={colors.foreground} />
                </Pressable>
              </View>

              <ScrollView
                className="max-h-[420px]"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                  Label
                </Text>
                <TextInput
                  value={optionLabel}
                  onChangeText={setOptionLabel}
                  className="mt-2 h-14 rounded-[16px] border border-border px-4 text-[15px] font-semibold text-foreground"
                  placeholder="Option label"
                  placeholderTextColor={colors['foreground-muted']}
                  autoCapitalize="words"
                  returnKeyType="done"
                />

                <Text className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                  Icon
                </Text>
                <IconPicker selected={optionIcon} onSelect={setOptionIcon} allowNone />

                <Text className="mt-5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                  Color
                </Text>
                <ColorPicker
                  pair={optionColor}
                  onSelect={setOptionColor}
                  previewIcon={optionIcon}
                  allowNone
                />
              </ScrollView>

              {editingOption?.swipe && (
                <Text className="mt-2 text-[12px] text-foreground-muted">
                  Assigned to the {editingOption.swipe} swipe on Home.
                </Text>
              )}

              {editingOption && (
                <Pressable
                  className="mt-4 h-11 flex-row items-center justify-center rounded-[14px] border border-border active:opacity-70"
                  accessibilityRole="button"
                  accessibilityLabel="Delete option"
                  onPress={confirmDeleteOption}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  <Text className="ml-2 text-[14px] font-semibold text-danger">Delete Option</Text>
                </Pressable>
              )}

              <View className="mt-3 flex-row gap-3">
                <Pressable
                  className="h-12 flex-1 items-center justify-center rounded-[16px] bg-option-surface"
                  onPress={closeEditor}>
                  <Text className="text-[15px] font-semibold text-foreground-secondary">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  className="h-12 flex-1 items-center justify-center rounded-[16px] bg-primary active:opacity-80"
                  onPress={saveOption}>
                  <Text className="text-[15px] font-semibold text-on-primary">Save</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

function BackButton() {
  return (
    <Pressable
      className="-ml-2 mt-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
      accessibilityLabel="Go back"
      onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={26} color={colors.foreground} />
    </Pressable>
  );
}

type IconPickerProps = {
  selected?: IconName;
  onSelect: (icon: IconName | undefined) => void;
  allowNone?: boolean;
};

function IconPicker({ selected, onSelect, allowNone = false }: IconPickerProps) {
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

type ColorPickerProps = {
  pair?: { color?: string; bg?: string };
  onSelect: (pair: ColorChoice | undefined) => void;
  previewIcon?: IconName;
  allowNone?: boolean;
};

function ColorPicker({ pair, onSelect, previewIcon, allowNone = false }: ColorPickerProps) {
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

type ToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
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

type OptionRowProps = {
  option: EventOption;
  index: number;
  lastIndex: number;
  width: number;
  onPress: () => void;
};

function OptionRow({ option, index, lastIndex, width, onPress }: OptionRowProps) {
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
