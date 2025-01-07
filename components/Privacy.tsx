import React, { FC } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { RegisterModel } from "./Register";

type PrivacyRouteParams = {
  form: RegisterModel;
  onAgree: (form: RegisterModel) => void;
};
//const { reset } = useForm<RegisterModel>();

export const Privacy: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<{ privacy: PrivacyRouteParams }>>();

  const { form, onAgree } = route.params; // รับค่าจากหน้า Register

  const whenAgree = () => {
    // add agree value to form
    const updatedForm = { ...form, agree: true };

    // call function validatePass ที่ถูกส่งมาจากหน้า Register
    onAgree(updatedForm);
  };

  const whenUpset = () => {
    //reset();
    navigation.navigate("login");
  };

  return (
    <>
      <ImageBackground
        source={require("../assets/background/bg2.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.header}>Privacy Policy</Text>
            <Text style={styles.text}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={whenAgree}>
              <Text style={styles.buttonText}>ยินยอม</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={whenUpset}>
              <Text style={styles.buttonText}>ไม่ยินยอม</Text>
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
  text: {
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
    width: "40%",
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
  },
});
