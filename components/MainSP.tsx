import React, { FC } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { HomeSP } from "./page/HomeSP";
import { Setting } from "./page/Setting";
import { Notificate } from "./page/Notificate";
import { Advice } from "./page/Advice";

const BottomTab = createBottomTabNavigator();

export const MainSP: FC = () => {
  return (
    <>
      <BottomTab.Navigator
        screenOptions={{
          headerShown: false, // ซ่อน Header เพื่อลดพื้นที่ด้านบน
        }}
      >
        <BottomTab.Screen
          name="home"
          component={HomeSP}
          options={{
            title: "HOME",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <BottomTab.Screen
          name="advice"
          component={Advice}
          options={{
            title: "ADVICE",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="explore" color={color} size={size} />
            ),
          }}
        />
        <BottomTab.Screen
          name="notificate"
          component={Notificate}
          options={{
            title: "NOTIFICATION",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="notifications" color={color} size={size} />
            ),
          }}
        />
        <BottomTab.Screen
          name="setting"
          component={Setting}
          options={{
            title: "SETTING",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" color={color} size={size} />
            ),
          }}
        />
      </BottomTab.Navigator>
    </>
  );
};
