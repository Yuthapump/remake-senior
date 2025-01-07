import React, { FC } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";

export const Welcome: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const whenGotoRegister = () => {
    navigation.navigate("register");
  };
  const whenGotoLogin = () => {
    navigation.navigate("login");
  };

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
              source={require("../assets/logo/chinjung.gif")}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Pressable onPress={whenGotoLogin} style={styles.button}>
              <Text style={styles.buttonText}>SIGN IN</Text>
            </Pressable>
          </View>
          <View style={styles.buttonContainer}>
            <Pressable onPress={whenGotoRegister} style={styles.button}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </Pressable>
          </View>
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  button: {
    width: "60%",
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
  },
});
