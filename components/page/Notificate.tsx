import React, { FC } from "react";
import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const Notificate: FC = () => {
  const notifications = [
    { name: "Tom", date: "now", message: "ครบกำหนดการฝึกทักษะของ" },
    { name: "Emily", date: "10/07/2024", message: "ถึงเวลาประเมินพัฒนาการของ" },
  ];

  return (
    <ImageBackground
      source={require("../../assets/background/bg1.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.header}>การแจ้งเตือน</Text>
        {notifications.map((notification, index) => (
          <View key={index} style={styles.notificationBox}>
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/icons/notification.png")}
                style={styles.icon}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.message}>
                {notification.message}{" "}
                <Text style={styles.name}>{notification.name}</Text>{" "}
                แล้วอย่าลืมเข้าไปทำการประเมินนะคะ
              </Text>
              <Text style={styles.date}>{notification.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 50,
    alignItems: "center",
  },
  notificationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 15,
    marginBottom: 10,
    borderColor: "#333333",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "97%",
    height: "13%",
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    width: 45,
    height: 45,
  },
  textContainer: {
    flex: 1,
    marginTop: 10,
  },
  message: {
    fontSize: 16,
    color: "#333333",
  },
  name: {
    fontWeight: "bold",
    color: "#6495ED",
  },
  date: {
    fontSize: 12,
    color: "#999999",
    textAlign: "right",
    marginBottom: 0,
    paddingTop: 2,
  },
  header: {
    fontSize: 24,
    color: "#333333",
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 20,
  },
});
