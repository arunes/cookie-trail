import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import type { EventOption, EventType } from '@/data/models';

type SwipeableEventRowProps = {
  event: EventType;
  expanded: boolean;
  onToggle: (id: string) => void;
  onAction: (event: EventType, option: EventOption) => void;
};

const SWIPE_LIMIT = 110;
const COMMIT_THRESHOLD = 76;

export function SwipeableEventRow({ event, expanded, onToggle, onAction }: SwipeableEventRowProps) {
  // useState with a lazy initializer (not useRef, which the react-hooks/refs
  // lint rule rejects during render): the Animated.Value instances must be
  // stable across renders so the PanResponder below is created exactly once.
  const [translateX] = useState(() => new Animated.Value(0));
  const [armedProgress] = useState(() => new Animated.Value(0));

  const rightOption = event.options.find((option) => option.swipe === 'right');

  const leftOption = event.options.find((option) => option.swipe === 'left');

  const rightLimit = rightOption ? SWIPE_LIMIT : 0;
  const leftLimit = leftOption ? SWIPE_LIMIT : 0;

  const panResponder = useMemo(() => {
    // Armed state as a mutable holder created once per PanResponder, NOT
    // component state: it must not trigger re-renders, because re-creating the
    // PanResponder while a drag is in flight breaks touch tracking (the row
    // stops following the finger).
    const armed = { side: 'none' as 'none' | 'left' | 'right' };

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,

      onPanResponderGrant: () => {
        armed.side = 'none';
      },

      onPanResponderMove: (_, gesture) => {
        const x = Math.max(-leftLimit, Math.min(rightLimit, gesture.dx));

        translateX.setValue(x);

        const side =
          rightOption && x >= COMMIT_THRESHOLD
            ? 'right'
            : leftOption && x <= -COMMIT_THRESHOLD
              ? 'left'
              : 'none';

        if (side !== armed.side) {
          armed.side = side;

          if (side !== 'none') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }

          Animated.spring(armedProgress, {
            toValue: side === 'none' ? 0 : 1,
            useNativeDriver: true,
          }).start();
        }
      },

      // Commit from the release geometry itself (not the tracked flag): this is
      // where the finger actually was when the gesture ended.
      onPanResponderRelease: (_, gesture) => {
        const x = Math.max(-leftLimit, Math.min(rightLimit, gesture.dx));
        const side =
          x >= COMMIT_THRESHOLD && rightOption
            ? 'right'
            : x <= -COMMIT_THRESHOLD && leftOption
              ? 'left'
              : 'none';

        armed.side = 'none';

        Animated.spring(armedProgress, {
          toValue: 0,
          useNativeDriver: true,
        }).start();

        if (side === 'right' && rightOption) {
          onAction(event, rightOption);
        } else if (side === 'left' && leftOption) {
          onAction(event, leftOption);
        }

        Animated.spring(translateX, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }).start();
      },

      onPanResponderTerminate: () => {
        armed.side = 'none';

        Animated.spring(armedProgress, {
          toValue: 0,
          useNativeDriver: true,
        }).start();

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    });
  }, [
    event,
    onAction,
    translateX,
    armedProgress,
    rightOption,
    leftOption,
    rightLimit,
    leftLimit,
  ]);

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
        {rightOption && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.actionStrip,
              styles.actionStripLeft,
              {
                backgroundColor: rightOption.bg ?? '#f1efec',
              },
            ]}>
            <Animated.View style={[styles.actionContent, { opacity: armedContentOpacity }]}>
              <Animated.View
                style={{
                  transform: [{ scale: armedIconScale }],
                }}>
                {rightOption.icon && (
                  <MaterialCommunityIcons
                    name={rightOption.icon}
                    size={18}
                    color={rightOption.color ?? '#6b6b6b'}
                  />
                )}
              </Animated.View>

              <Text
                className="text-[13px] font-semibold"
                style={{
                  color: rightOption.color ?? '#505050',
                }}>
                {rightOption.label}
              </Text>
            </Animated.View>
          </Animated.View>
        )}

        {leftOption && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.actionStrip,
              styles.actionStripRight,
              {
                backgroundColor: leftOption.bg ?? '#f1efec',
              },
            ]}>
            <Animated.View style={[styles.actionContentRight, { opacity: armedContentOpacity }]}>
              <Animated.View
                style={{
                  transform: [{ scale: armedIconScale }],
                }}>
                {leftOption.icon && (
                  <MaterialCommunityIcons
                    name={leftOption.icon}
                    size={18}
                    color={leftOption.color ?? '#6b6b6b'}
                  />
                )}
              </Animated.View>

              <Text
                className="text-[13px] font-semibold"
                style={{
                  color: leftOption.color ?? '#505050',
                }}>
                {leftOption.label}
              </Text>
            </Animated.View>
          </Animated.View>
        )}

        <Animated.View style={[styles.foreground, { transform: [{ translateX }] }]}>
          <Pressable
            onPress={() => onToggle(event.id)}
            className="h-[68px] flex-1 flex-row items-center px-4 active:opacity-80">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: event.bg }}>
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

      {expanded && (
        <View className="flex-row flex-wrap gap-2 border-t border-[#f0ece8] p-3">
          {event.options.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => onAction(event, option)}
              className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2 active:opacity-60"
              style={{
                backgroundColor: option.bg ?? '#f7f6f5',
              }}>
              {option.icon && (
                <MaterialCommunityIcons
                  name={option.icon}
                  size={16}
                  color={option.color ?? '#6b6b6b'}
                />
              )}

              <Text
                className="text-[13px] font-semibold"
                style={{
                  color: option.color ?? '#505050',
                }}>
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
