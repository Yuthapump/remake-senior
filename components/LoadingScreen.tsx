import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { Assessment } from "./page/Assessment";

export const LoadingScreenAdvice = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/dot-wave.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.text}>กำลังค้นหาสถานพยาบาลใกล้คุณ...</Text>
      <Text style={styles.subText}>กำลังดึงข้อมูลอยู่ กรุณารอสักครู่</Text>
    </View>
  );
};

export const LoadingScreenBaby = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/baby.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.text}>กำลังโหลดข้อมูลเด็ก...</Text>
      <Text style={styles.subText}>กำลังดึงข้อมูลอยู่ กรุณารอสักครู่</Text>
    </View>
  );
};

export const LoadingScreenSearchfile = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/glasses.json")}
        autoPlay
        loop
        style={styles.assessmentLottie}
      />
      <Text style={styles.assessmentText}>กำลังโหลดข้อมูลเด็ก...</Text>
      <Text style={styles.assessmentSubText}>
        กำลังดึงข้อมูลอยู่ กรุณารอสักครู่
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // === Base ===
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  lottie: {
    width: 250,
    height: 250,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  subText: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },

  // === Assessment ===
  assessmentLottie: {
    width: 200,
    height: 200,
  },
  assessmentText: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "bold",
  },
  assessmentSubText: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
});
