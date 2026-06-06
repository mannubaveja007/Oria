import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Platform } from 'react-native';
import { Moon, Compass, MessageSquare, User } from 'lucide-react-native';
import { triggerLight } from '../../utils/haptics';

export default function TabsLayout() {
  const handleTabPress = () => {
    triggerLight();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#555555',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 1,
          borderTopColor: '#111111',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans-Medium',
          fontSize: 10,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="horoscope"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Moon size={20} color={color} fill={focused ? color : 'transparent'} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="readers"
        options={{
          title: 'Guides',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Compass size={20} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Ask',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <MessageSquare size={20} color={color} fill={focused ? color : 'transparent'} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <User size={20} color={color} fill={focused ? color : 'transparent'} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 36,
    width: 36,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8E6FF',
    shadowColor: '#C8E6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});
