import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Stack navigators
const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const SearchStack = createStackNavigator();
const ChatStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Root = createStackNavigator();

// Lazy imports for better performance
const OtpScreen = React.lazy(() => import('../screens/auth/OtpScreen'));
const RegisterScreen = React.lazy(() => import('../screens/auth/RegisterScreen'));
const HomeScreen = React.lazy(() => import('../screens/home/HomeScreen'));
const PropertyDetailScreen = React.lazy(() => import('../screens/property/PropertyDetailScreen'));
const SearchScreen = React.lazy(() => import('../screens/property/SearchScreen'));
const MapScreen = React.lazy(() => import('../screens/property/MapScreen'));
const ChatListScreen = React.lazy(() => import('../screens/chat/ChatListScreen'));
const ChatScreen = React.lazy(() => import('../screens/chat/ChatScreen'));
const BookingScreen = React.lazy(() => import('../screens/booking/BookingScreen'));
const ProfileScreen = React.lazy(() => import('../screens/profile/ProfileScreen'));
const FavoritesScreen = React.lazy(() => import('../screens/profile/FavoritesScreen'));

const THEME = {
  dark: '#0a1628',
  primary: '#1d4ed8',
  tabBar: '#ffffff',
  inactive: '#94a3b8',
};

function TabIcon({
  name, focused,
}: { name: string; focused: boolean }): React.ReactElement {
  const icons: Record<string, { active: string; inactive: string }> = {
    home: { active: '🏠', inactive: '🏠' },
    search: { active: '🔍', inactive: '🔍' },
    chat: { active: '💬', inactive: '💬' },
    profile: { active: '👤', inactive: '👤' },
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={{ fontSize: 22 }}>{icons[name]?.active}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

function HomeNavigator(): React.ReactElement {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen as React.ComponentType} />
      <HomeStack.Screen name="PropertyDetail" component={PropertyDetailScreen as React.ComponentType} />
      <HomeStack.Screen name="MapView" component={MapScreen as React.ComponentType} />
      <HomeStack.Screen name="Booking" component={BookingScreen as React.ComponentType} />
    </HomeStack.Navigator>
  );
}

function SearchNavigator(): React.ReactElement {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={SearchScreen as React.ComponentType} />
      <SearchStack.Screen name="PropertyDetail" component={PropertyDetailScreen as React.ComponentType} />
    </SearchStack.Navigator>
  );
}

function ChatNavigator(): React.ReactElement {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen as React.ComponentType} />
      <ChatStack.Screen name="Chat" component={ChatScreen as React.ComponentType} />
    </ChatStack.Navigator>
  );
}

function ProfileNavigator(): React.ReactElement {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen as React.ComponentType} />
      <ProfileStack.Screen name="Favorites" component={FavoritesScreen as React.ComponentType} />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator(): React.ReactElement {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.inactive,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name.toLowerCase()} focused={focused} />
        ),
        tabBarStyle: {
          backgroundColor: THEME.tabBar,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{ title: 'الرئيسية' }}
      />
      <MainTab.Screen
        name="Search"
        component={SearchNavigator}
        options={{ title: 'البحث' }}
      />
      <MainTab.Screen
        name="Chat"
        component={ChatNavigator}
        options={{ title: 'المحادثات' }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: 'حسابي' }}
      />
    </MainTab.Navigator>
  );
}

function AuthNavigator(): React.ReactElement {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Otp" component={OtpScreen as React.ComponentType} />
      <AuthStack.Screen name="Register" component={RegisterScreen as React.ComponentType} />
    </AuthStack.Navigator>
  );
}

export function AppNavigator(): React.ReactElement {
  const { isAuthenticated } = useAuthStore();

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

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1d4ed8',
    marginTop: 2,
  },
});
