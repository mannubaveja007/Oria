import * as Haptics from 'expo-haptics';

export const triggerLight = async () => {
  try {
    if (Haptics && Haptics.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (e) {
    // Fallback silent
  }
};

export const triggerMedium = async () => {
  try {
    if (Haptics && Haptics.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (e) {
    // Fallback silent
  }
};

export const triggerSuccess = async () => {
  try {
    if (Haptics && Haptics.notificationAsync) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch (e) {
    // Fallback silent
  }
};
