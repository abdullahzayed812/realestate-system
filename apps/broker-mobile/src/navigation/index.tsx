import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const ListingsStack = createStackNavigator();
const BookingsStack = createStackNavigator();
const ChatStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Root = createStackNavigator();

const BrokerDashboard = React.lazy(() => import('../screens/dashboard/BrokerDashboard'));
const OtpScreen = React.lazy(() => import('../screens/auth/OtpScreen'));
const RegisterScreen = React.lazy(() => import('../screens/auth/RegisterScreen'));
const MyListingsScreen = React.lazy(() => import('../screens/listings/MyListingsScreen'));
const AddPropertyScreen = React.lazy(() => import('../screens/listings/AddPropertyScreen'));
const BookingRequestsScreen = React.lazy(() => import('../screens/bookings/BookingRequestsScreen'));
const ChatListScreen = React.lazy(() => import('../screens/chat/ChatListScreen'));
const ChatScreen = React.lazy(() => import('../screens/chat/ChatScreen'));
const BrokerProfileScreen = React.lazy(() => import('../screens/profile/ProfileScreen'));

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    dashboard: '📊', listings: '🏠', bookings: '📅', chat: '💬', profile: '👤',
  };
  return (
    <View style={tabStyles.container}>
      <Text style={{ fontSize: 20 }}>{icons[name]}</Text>
      {focused && <View style={tabStyles.dot} />}
    </View>
  );
}

function ListingsNavigator() {
  return (
    <ListingsStack.Navigator screenOptions={{ headerShown: false }}>
      <ListingsStack.Screen name="MyListings" component={MyListingsScreen as React.ComponentType} />
      <ListingsStack.Screen name="AddProperty" component={AddPropertyScreen as React.ComponentType} />
    </ListingsStack.Navigator>
  );
}

function BookingsNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingRequests" component={BookingRequestsScreen as React.ComponentType} />
    </BookingsStack.Navigator>
  );
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen as React.ComponentType} />
      <ChatStack.Screen name="Chat" component={ChatScreen as React.ComponentType} />
    </ChatStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={BrokerProfileScreen as React.ComponentType} />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name.toLowerCase()} focused={focused} />
        ),
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <MainTab.Screen
        name="dashboard"
        component={BrokerDashboard as React.ComponentType}
        options={{ title: 'الرئيسية' }}
      />
      <MainTab.Screen
        name="listings"
        component={ListingsNavigator}
        options={{ title: 'عقاراتي' }}
      />
      <MainTab.Screen
        name="bookings"
        component={BookingsNavigator}
        options={{ title: 'الحجوزات' }}
      />
      <MainTab.Screen
        name="chat"
        component={ChatNavigator}
        options={{ title: 'المحادثات' }}
      />
      <MainTab.Screen
        name="profile"
        component={ProfileNavigator}
        options={{ title: 'حسابي' }}
      />
    </MainTab.Navigator>
  );
}

function AuthNavigator() {
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

const tabStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#1d4ed8', marginTop: 2 },
});
