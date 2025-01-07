import React, { FC, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const SplashScreen: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userToken = await AsyncStorage.getItem("userToken");
      const userRole = await AsyncStorage.getItem("userRole");

      if (userToken && userRole) {
        setTimeout(() => {
          if (userRole === "parent") {
            navigation.reset({
              index: 0,
              routes: [{ name: "mainPR" }],
            });
          } else if (userRole === "supervisor") {
            navigation.reset({
              index: 0,
              routes: [{ name: "mainSP" }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: "login" }],
            });
          }
        }, 3000); // Wait for 3 seconds before navigating
      } else if (!userToken) {
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "welcome" }],
          });
        }, 3000); // Wait for 3 seconds before navigating
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <>
      <ImageBackground
        source={require("../assets/background/bg1.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.header}>DekDek</Text>
            <Image
              style={styles.logo}
              source={require("../assets/logo/funny.gif")}
            />
          </View>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 5,
  },
});
