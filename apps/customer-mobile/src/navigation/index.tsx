import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../store/authStore';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const SearchStack = createStackNavigator();
const ChatStack = createStackNavigator();
const BookingsStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Root = createStackNavigator();

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import PropertyDetailScreen from '../screens/property/PropertyDetailScreen';
import SearchScreen from '../screens/property/SearchScreen';
import MapScreen from '../screens/property/MapScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import BookingsScreen from '../screens/booking/BookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FavoritesScreen from '../screens/profile/FavoritesScreen';

const TABS: Record<string, { icon: string; label: string }> = {
  Home: { icon: '🏠', label: 'الرئيسية' },
  Search: { icon: '🔍', label: 'البحث' },
  Chat: { icon: '💬', label: 'الدردشة' },
  Bookings: { icon: '📅', label: 'حجوزاتي' },
  Profile: { icon: '👤', label: 'حسابي' },
};

function CustomerTabBar({ state, navigation }: BottomTabBarProps) {
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
              <Text
                style={[tabStyles.label, focused ? tabStyles.labelActive : tabStyles.labelInactive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function HomeNavigator(): React.ReactElement {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <HomeStack.Screen name="MapView" component={MapScreen} />
      <HomeStack.Screen name="Booking" component={BookingScreen} />
    </HomeStack.Navigator>
  );
}

function SearchNavigator(): React.ReactElement {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
      <SearchStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </SearchStack.Navigator>
  );
}

function ChatNavigator(): React.ReactElement {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatRoom" component={ChatScreen} />
    </ChatStack.Navigator>
  );
}

function BookingsNavigator(): React.ReactElement {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingsList" component={BookingsScreen} />
    </BookingsStack.Navigator>
  );
}

function ProfileNavigator(): React.ReactElement {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Favorites" component={FavoritesScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator(): React.ReactElement {
  return (
    <MainTab.Navigator
      tabBar={(props) => <CustomerTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
      }}
    >
      <MainTab.Screen name="Home" component={HomeNavigator} />
      <MainTab.Screen name="Bookings" component={BookingsNavigator} />
      <MainTab.Screen name="Search" component={SearchNavigator} />
      <MainTab.Screen name="Chat" component={ChatNavigator} />
      <MainTab.Screen name="Profile" component={ProfileNavigator} />
    </MainTab.Navigator>
  );
}

function AuthNavigator(): React.ReactElement {
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
        <Text style={splashStyles.logo}>🏠</Text>
        <Text style={splashStyles.name}>برج العرب العقارية</Text>
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
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 72 },
  name: { fontSize: 22, fontWeight: '800', color: '#0a1628', marginTop: 16 },
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
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 6,
    gap: 4,
    shadowColor: '#0a1628',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
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
    backgroundColor: '#0a1628',
    flex: 1.6,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  labelActive: {
    color: '#ffffff',
  },
  labelInactive: {
    color: '#94a3b8',
  },
});
