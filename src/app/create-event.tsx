import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Sortable, { type SortableFlexDragEndCallback } from 'react-native-sortables';
import Toast from 'react-native-toast-message';

import {
  EventColorPicker,
  EventIconPicker,
  EventOptionEditorSheet,
  EventOptionRow,
  EventToggleRow,
  DEFAULT_COLOR_PAIR,
  type EventOptionDraft,
} from '@/components/eventEditor';
import { createEventType, nextEventOptionId } from '@/data/events';
import type { EventOption, IconName } from '@/data/models';
import { colors } from '@/theme/tokens';

export default function CreateEvent() {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState<IconName>('paw');
  const [colorPair, setColorPair] = useState(DEFAULT_COLOR_PAIR);
  const [isPredictable, setIsPredictable] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  // Options exist only in this draft state until the event is created.
  const [options, setOptions] = useState<EventOption[]>([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<EventOption | null>(null);

  const { width: screenWidth } = useWindowDimensions();
  const listWidth = screenWidth - 32;

  const handleOptionDragEnd = useCallback<SortableFlexDragEndCallback>(
    ({ order }) => {
      const reordered = order(options);
      if (reordered === options) return;

      setOptions(reordered);
    },
    [options]
  );

  const openNewOption = useCallback(() => {
    setEditingOption(null);
    setEditorOpen(true);
  }, []);

  const openEditOption = useCallback((option: EventOption) => {
    setEditingOption(option);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
  }, []);

  const handleSaveOption = useCallback(
    (draft: EventOptionDraft) => {
      if (editingOption) {
        setOptions((current) =>
          current.map((option) => {
            if (option.id === editingOption.id) {
              return { ...option, ...draft };
            }

            // A swipe direction belongs to one option: this save takes it over.
            return draft.swipe && option.swipe === draft.swipe
              ? { ...option, swipe: undefined }
              : option;
          })
        );
      } else {
        const newOption: EventOption = {
          id: nextEventOptionId(
            options.map((option) => option.id),
            draft.label
          ),
          label: draft.label,
          icon: draft.icon,
          color: draft.color,
          bg: draft.bg,
          swipe: draft.swipe,
        };

        setOptions((current) => [
          ...current.map((option) =>
            draft.swipe && option.swipe === draft.swipe ? { ...option, swipe: undefined } : option
          ),
          newOption,
        ]);
      }

      setEditorOpen(false);
    },
    [editingOption, options]
  );

  const handleDeleteOption = useCallback(() => {
    if (!editingOption) return;

    // Draft options have no logged history yet, so no usage check is needed.
    Alert.alert(`Delete ${editingOption.label}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setOptions((current) => current.filter((option) => option.id !== editingOption.id));
          setEditorOpen(false);
        },
      },
    ]);
  }, [editingOption]);

  const createEvent = useCallback(() => {
    const trimmed = label.trim();
    if (!trimmed) {
      Toast.show({ type: 'status', text1: 'Event label is required' });
      return;
    }

    createEventType(
      {
        label: trimmed,
        icon,
        color: colorPair.color,
        bg: colorPair.bg,
        isPredictable,
        isHidden,
      },
      options
    );

    Toast.show({ type: 'status', text1: `${trimmed} created` });
    router.back();
  }, [label, icon, colorPair, isPredictable, isHidden, options]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Pressable
          className="-ml-2 mt-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          accessibilityLabel="Go back"
          onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.foreground} />
        </Pressable>

        <Text className="mt-4 text-[25px] font-bold tracking-[-1px] text-foreground">
          Create Event
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
              {label || 'New event'}
            </Text>
            <Text className="mt-0.5 text-[12px] text-foreground-muted">
              Custom event
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
        <EventIconPicker
          selected={icon}
          onSelect={(name) => {
            if (name) setIcon(name);
          }}
        />

        {/* Color */}
        <Text className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Color
        </Text>
        <EventColorPicker
          pair={colorPair}
          onSelect={(choice) => {
            if (choice) setColorPair(choice);
          }}
          previewIcon={icon}
        />

        {/* Flags */}
        <View className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <EventToggleRow
            label="Predictable"
            description="Used for Upcoming predictions"
            value={isPredictable}
            onChange={setIsPredictable}
          />
          <View className="h-px bg-border" />
          <EventToggleRow
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
              <EventOptionRow
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

        {/* Create */}
        <Pressable
          className="mt-8 h-12 items-center justify-center rounded-[16px] bg-primary active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Create event"
          onPress={createEvent}>
          <Text className="text-[15px] font-semibold text-on-primary">Create Event</Text>
        </Pressable>
      </ScrollView>

      {/* Option editor */}
      <EventOptionEditorSheet
        visible={editorOpen}
        contextLabel={label.trim() || 'New event'}
        option={editingOption}
        onClose={closeEditor}
        onSave={handleSaveOption}
        onDelete={editingOption ? handleDeleteOption : undefined}
      />
    </View>
  );
}
