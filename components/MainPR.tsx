import React, { FC, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View, Image, Text } from "react-native";

import { HomePR } from "./page/HomePR";
import { Setting } from "./page/Setting";
import { Notificate } from "./page/Notificate";
import { Advice } from "./page/Advice";

// Define your custom icon paths
const homeIcon = require("../assets/icons/homeIcon.png");
const adviceIcon = require("../assets/icons/adviceIcon.png");
const notificationIcon = require("../assets/icons/bellIcon.png");
const settingIcon = require("../assets/icons/settingIcon.png");

const BottomTab = createBottomTabNavigator();

export const MainPR: FC = () => {
  const [notificationCount, setNotificationCount] = useState(10);
  return (
    <>
      <BottomTab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 90,
            borderTopWidth: 0,
          },
          tabBarShowLabel: false,
        }}
      >
        <BottomTab.Screen
          name="home"
          component={HomePR}
          options={{
            tabBarIcon: () => (
              <Image source={homeIcon} style={{ width: 35, height: 35 }} />
            ),
            tabBarActiveBackgroundColor: "#D6F5E0",
          }}
        />
        <BottomTab.Screen
          name="advice"
          component={Advice}
          options={{
            tabBarIcon: () => (
              <Image source={adviceIcon} style={{ width: 35, height: 35 }} />
            ),
            tabBarActiveBackgroundColor: "#D6F5E0",
          }}
        />
        <BottomTab.Screen
          name="notificate"
          component={Notificate}
          options={{
            tabBarIcon: () => (
              <View style={[styles.container]}>
                <Image
                  source={notificationIcon}
                  style={{ width: 35, height: 35 }}
                />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>
                      {notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
            tabBarActiveBackgroundColor: "#D6F5E0",
          }}
        />
        <BottomTab.Screen
          name="setting"
          component={Setting}
          options={{
            tabBarIcon: () => (
              <Image source={settingIcon} style={{ width: 35, height: 35 }} />
            ),
            tabBarActiveBackgroundColor: "#D6F5E0",
          }}
        />
      </BottomTab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  notificationBadge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
