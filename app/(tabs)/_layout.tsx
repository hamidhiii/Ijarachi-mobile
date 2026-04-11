import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        // Убрал absolute, чтобы он точно занял свое место внизу
        tabBarStyle: {
          height: 90,
          backgroundColor: Colors.primary,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          elevation: 25, // Для Android
          shadowColor: '#000', // Для iOS
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => (
            <View style={styles.addBtn}>
              <Ionicons name="add" size={32} color={Colors.text} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40, // Поднимаем кнопку над панелью
    borderWidth: 5,
    borderColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  }
});