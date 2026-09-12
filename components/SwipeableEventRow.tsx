import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type SwipeDirection = 'left' | 'right';

export type EventOption = {
  id: string;
  label: string;
  icon?: IconName;
  color?: string; // accent for action strip / chip text and icon
  bg?: string; // pastel action strip / chip background
  swipe?: SwipeDirection; // at most one option per direction
};

export type EventType = {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  bg: string;
  options: EventOption[];
};

type SwipeableEventRowProps = {
  event: EventType;
  expanded: boolean;
  onToggle: (id: string) => void;
  onAction: (eventType: string, option: string) => void;
};

// Foreground clamps to this distance per side (only where an option exists).
const SWIPE_LIMIT = 110;
// Drag distance at which the action becomes armed (commit threshold).
const COMMIT_THRESHOLD = 76;

export function SwipeableEventRow({ event, expanded, onToggle, onAction }: SwipeableEventRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const armedRef = useRef<'none' | 'left' | 'right'>('none');
  const armedProgress = useRef(new Animated.Value(0)).current;

  // Swipe targets come straight from the declarative options list.
  const rightOption = event.options.find((option) => option.swipe === 'right');
  const leftOption = event.options.find((option) => option.swipe === 'left');
  const rightLimit = rightOption ? SWIPE_LIMIT : 0;
  const leftLimit = leftOption ? SWIPE_LIMIT : 0;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only claim clearly horizontal drags so vertical ScrollView scrolling still works.
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderMove: (_, gesture) => {
          // Explicit mapping: dragging the card RIGHT (positive dx) reveals the swipe:'right'
          // strip on the left edge; dragging LEFT (negative dx) reveals the 'left' strip on
          // the right edge. A side without an option clamps to 0 and cannot swipe.
          const x = Math.max(-leftLimit, Math.min(rightLimit, gesture.dx));
          translateX.setValue(x);

          const side =
            rightOption && x >= COMMIT_THRESHOLD
              ? 'right'
              : leftOption && x <= -COMMIT_THRESHOLD
                ? 'left'
                : 'none';

          if (side !== armedRef.current) {
            armedRef.current = side;
            // Subtle haptic tick on the none -> armed transition only; never while held past threshold.
            if (side !== 'none') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            Animated.spring(armedProgress, { toValue: side === 'none' ? 0 : 1, useNativeDriver: true }).start();
          }
        },
        onPanResponderRelease: () => {
          const side = armedRef.current;
          armedRef.current = 'none';
          Animated.spring(armedProgress, { toValue: 0, useNativeDriver: true }).start();
          if (side === 'right' && rightOption) {
            onAction(event.label, rightOption.label);
          } else if (side === 'left' && leftOption) {
            onAction(event.label, leftOption.label);
          }
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            tension: 65,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          armedRef.current = 'none';
          Animated.spring(armedProgress, { toValue: 0, useNativeDriver: true }).start();
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [event, onAction, translateX, armedProgress, rightOption, leftOption, rightLimit, leftLimit]
  );

  // Armed emphasis (commit threshold crossed): slightly stronger icon/text. The action
  // background itself stays static; the foreground card is never scaled or faded.
  const armedIconScale = armedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
    extrapolate: 'clamp',
  });
  const armedContentOpacity = armedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
    extrapolate: 'clamp',
  });

  return (
    <View className="overflow-hidden rounded-[20px] border border-[#f0ece8] bg-white shadow-sm">
      <View className="h-[68px] flex-row" {...panResponder.panHandlers}>
        {/* Swipe-right action strip (swipe: 'right'), anchored to the left edge */}
        {rightOption && (
          <Animated.View
            pointerEvents="none"
            style={[styles.actionStrip, styles.actionStripLeft, { backgroundColor: rightOption.bg ?? '#f1efec' }]}
          >
            <Animated.View style={[styles.actionContent, { opacity: armedContentOpacity }]}>
              <Animated.View style={{ transform: [{ scale: armedIconScale }] }}>
                {rightOption.icon && (
                  <MaterialCommunityIcons name={rightOption.icon} size={18} color={rightOption.color ?? '#6b6b6b'} />
                )}
              </Animated.View>
              <Text className="text-[13px] font-semibold" style={{ color: rightOption.color ?? '#505050' }}>
                {rightOption.label}
              </Text>
            </Animated.View>
          </Animated.View>
        )}

        {/* Swipe-left action strip (swipe: 'left'), anchored to the right edge */}
        {leftOption && (
          <Animated.View
            pointerEvents="none"
            style={[styles.actionStrip, styles.actionStripRight, { backgroundColor: leftOption.bg ?? '#f1efec' }]}
          >
            <Animated.View style={[styles.actionContentRight, { opacity: armedContentOpacity }]}>
              <Animated.View style={{ transform: [{ scale: armedIconScale }] }}>
                {leftOption.icon && (
                  <MaterialCommunityIcons name={leftOption.icon} size={18} color={leftOption.color ?? '#6b6b6b'} />
                )}
              </Animated.View>
              <Text className="text-[13px] font-semibold" style={{ color: leftOption.color ?? '#505050' }}>
                {leftOption.label}
              </Text>
            </Animated.View>
          </Animated.View>
        )}

        {/* Draggable foreground: the whole row moves as one rigid surface */}
        <Animated.View style={[styles.foreground, { transform: [{ translateX }] }]}>
          <Pressable
            onPress={() => onToggle(event.id)}
            className="h-[68px] flex-1 flex-row items-center px-4 active:opacity-80"
          >
            <View className={`h-10 w-10 items-center justify-center rounded-full ${event.bg}`}>
              <MaterialCommunityIcons name={event.icon} size={21} color={event.color} />
            </View>
            <Text className="ml-3 text-[17px] font-semibold text-[#211914]">{event.label}</Text>
            <View className="flex-1" />
            <MaterialCommunityIcons
              name={expanded ? 'chevron-down' : 'chevron-right'}
              size={20}
              color="#d9d3cc"
            />
          </Pressable>
        </Animated.View>
      </View>

      {/* Expanded inline actions: every option, swipe-assigned or not */}
      {expanded && (
        <View className="flex-row flex-wrap gap-2 border-t border-[#f0ece8] p-3">
          {event.options.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => onAction(event.label, option.label)}
              className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2 active:opacity-60"
              style={{ backgroundColor: option.bg ?? '#f7f6f5' }}
            >
              {option.icon && (
                <MaterialCommunityIcons name={option.icon} size={16} color={option.color ?? '#6b6b6b'} />
              )}
              <Text className="text-[13px] font-semibold" style={{ color: option.color ?? '#505050' }}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SWIPE_LIMIT,
  },
  actionStripLeft: {
    left: 0,
  },
  actionStripRight: {
    right: 0,
  },
  actionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 18,
  },
  actionContentRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingRight: 18,
  },
  foreground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#ffffff',
  },
});