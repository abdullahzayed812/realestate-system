import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Platform, Text, View, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../store/authStore';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const ListingsStack = createStackNavigator();
const BookingsStack = createStackNavigator();
const ChatStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Root = createStackNavigator();

import BrokerDashboard from '../screens/dashboard/BrokerDashboard';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MyListingsScreen from '../screens/listings/MyListingsScreen';
import AddPropertyScreen from '../screens/listings/AddPropertyScreen';
import BookingRequestsScreen from '../screens/bookings/BookingRequestsScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import BrokerProfileScreen from '../screens/profile/ProfileScreen';

const TABS: Record<string, { icon: string; label: string }> = {
  dashboard: { icon: '📊', label: 'الرئيسية' },
  listings:  { icon: '🏠', label: 'عقاراتي' },
  bookings:  { icon: '📅', label: 'الحجوزات' },
  chat:      { icon: '💬', label: 'الدردشة' },
  profile:   { icon: '👤', label: 'حسابي' },
};

function BrokerTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const tab = TABS[route.name] ?? { icon: '●', label: route.name };
          return (
            <TouchableOpacity
              key={route.key}
              style={[tabStyles.item, focused && tabStyles.itemActive]}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              activeOpacity={0.8}
            >
              <Text style={tabStyles.icon}>{tab.icon}</Text>
              <Text style={[tabStyles.label, focused ? tabStyles.labelActive : tabStyles.labelInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function ListingsNavigator() {
  return (
    <ListingsStack.Navigator screenOptions={{ headerShown: false }}>
      <ListingsStack.Screen name="MyListings" component={MyListingsScreen} />
      <ListingsStack.Screen name="AddProperty" component={AddPropertyScreen} />
    </ListingsStack.Navigator>
  );
}

function BookingsNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingRequests" component={BookingRequestsScreen} />
    </BookingsStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="Chat" component={ChatScreen} />
    </ChatStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={BrokerProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <MainTab.Navigator
      tabBar={(props) => <BrokerTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
      }}
    >
      <MainTab.Screen name="dashboard" component={BrokerDashboard} />
      <MainTab.Screen name="listings" component={ListingsNavigator} />
      <MainTab.Screen name="bookings" component={BookingsNavigator} />
      <MainTab.Screen name="chat" component={ChatNavigator} />
      <MainTab.Screen name="profile" component={ProfileNavigator} />
    </MainTab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function AppNavigator(): React.ReactElement {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (isLoading) {
    return (
      <View style={splashStyles.container}>
        <Text style={splashStyles.logo}>🏢</Text>
        <Text style={splashStyles.name}>وسيط برج العرب</Text>
        <ActivityIndicator color="#1d4ed8" style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Root.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628', alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 72 },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 16 },
});

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0a1628',
    borderRadius: 28,
    padding: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 22,
    gap: 3,
  },
  itemActive: {
    backgroundColor: '#1d4ed8',
    flex: 1.6,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  labelActive: {
    color: '#ffffff',
  },
  labelInactive: {
    color: 'rgba(255,255,255,0.5)',
  },
});
