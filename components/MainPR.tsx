import React, { FC, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";

import { HomePR } from "./page/HomePR";
import { Setting } from "./page/Setting";
import { Notificate } from "./page/Notificate";
import { Advice } from "./page/Advice";

// Define your custom icon paths
// const homeIcon = require("../assets/icons/homeIcon.png");
// const adviceIcon = require("../assets/icons/adviceIcon.png");
// const notificationIcon = require("../assets/icons/bellIcon.png");
// const settingIcon = require("../assets/icons/settingIcon.png");

const BottomTab = createBottomTabNavigator();

export const MainPR: FC = () => {
  const [notificationCount] = useState(10);
  return (
    <>
      <BottomTab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            height: "8%",
            borderTopWidth: 0,
            padding: 5,
            borderRadius: 30,
            marginHorizontal: 20,
            marginBottom: 25,
            shadowColor: "#000",
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 5,
            elevation: 5,
          },
          tabBarShowLabel: false,
        }}
      >
        <BottomTab.Screen
          name="home"
          component={HomePR}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <Entypo
                  name="home"
                  size={24}
                  color={focused ? "#e64072" : "#888"}
                />
                <Text style={[styles.tabText, focused && styles.focusedText]}>
                  Home
                </Text>
              </View>
            ),
          }}
        />
        <BottomTab.Screen
          name="advice"
          component={Advice}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <FontAwesome6
                  name="map-location-dot"
                  size={24}
                  color={focused ? "#e64072" : "#888"}
                />
                <Text style={[styles.tabText, focused && styles.focusedText]}>
                  Explore
                </Text>
              </View>
            ),
          }}
        />
        <BottomTab.Screen
          name="notificate"
          component={Notificate}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <Ionicons
                  name="notifications-sharp"
                  size={24}
                  color={focused ? "#e64072" : "#888"}
                />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>
                      {notificationCount}
                    </Text>
                  </View>
                )}
                <Text style={[styles.tabText, focused && styles.focusedText]}>
                  Notifications
                </Text>
              </View>
            ),
          }}
        />
        <BottomTab.Screen
          name="setting"
          component={Setting}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <Ionicons
                  name="settings"
                  size={24}
                  color={focused ? "#e64072" : "#888"}
                />
                <Text style={[styles.tabText, focused && styles.focusedText]}>
                  Setting
                </Text>
              </View>
            ),
          }}
        />
      </BottomTab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    top: 15,
    // borderWidth: 2,
  },
  tabText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  focusedText: {
    color: "#e64072",
    fontWeight: "bold",
  },
  notificationBadge: {
    position: "absolute",
    top: -10,
    right: 15,
    backgroundColor: "#FF3D00",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
