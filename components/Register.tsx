// Register.tsx
import React, { FC, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  StyleSheet,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Modal,
  TouchableOpacity,
} from "react-native";

// Navigation
import { useNavigation, NavigationProp } from "@react-navigation/native";

// Form Handling
import { z } from "zod";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Components
import { Picker } from "@react-native-picker/picker";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define Validation Schema
export const RegisterSchema = z.object({
  userName: z
    .string()
    .min(5, "กรุณาระบุชื่อผู้ใช้ที่มีความยาวอย่างน้อย 5 ตัวอักษร")
    .max(150),
  email: z.string().email("กรุณาระบุอีเมลที่ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .max(25),
  phoneNumber: z
    .string()
    .min(10, "หมายเลขโทรศัพท์ต้องมีความยาวอย่างน้อย 10 ตัวอักษร")
    .max(15)
    .regex(/^[0-9]+$/, "หมายเลขโทรศัพท์ต้องประกอบด้วยตัวเลขเท่านั้น"),
  role: z.enum(["parent", "supervisor", "admin"], {
    errorMap: () => ({ message: "กรุณาเลือกบทบาท" }), // ข้อความผิดพลาดที่กำหนดเอง
  }),
  agree: z.boolean().default(false),
});

// Type Definitions
export type RegisterModel = z.infer<typeof RegisterSchema>;

// Component Definition
export const Register: FC = () => {
  // Navigation Hook
  const navigation = useNavigation<NavigationProp<any>>();

  // Form Handling
  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterModel>({
    resolver: zodResolver(RegisterSchema),
  });
  const [selectedRole, setSelectedRole] = useState<string>("Select Role");
  const [showPicker, setShowPicker] = useState<boolean>(false); // Manage Modal visibility

  // // Function to capitalize the first letter of the role
  // const capitalizeRole = (role: string) => {
  //   return role.charAt(0).toUpperCase() + role.slice(1);
  // };

  const validatePass: SubmitHandler<RegisterModel> = async (form) => {
    console.log("validatePass Form data:", form); // Check Form
    try {
      const privacy = form.agree ? "agree" : null;
      console.log("Form data Privacy:", form.agree);

      const resp = await fetch(
        "https://senior-test-deploy-production-1362.up.railway.app/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: form.userName,
            email: form.email,
            password: form.password,
            phoneNumber: form.phoneNumber,
            role: form.role,
            privacy,
          }),
        }
      );
      const jsonResp = await resp.json();
      const role = jsonResp.role;
      const userToken = jsonResp.token;

      console.log("Response status:", resp.status); // Check Respone
      console.log("Role:", role); // Debug Role

      if (resp.status === 201) {
        Alert.alert("สำเร็จ", "ลงทะเบียนผู้ใช้สำเร็จ");
        // Store the token and role in AsyncStorage
        if (userToken) {
          // Save the token if it's valid (not undefined or null)
          await AsyncStorage.setItem("userToken", userToken);
          console.log("Token saved");
        } else {
          // Remove the token if it's undefined or null
          await AsyncStorage.removeItem("userToken");
          console.log("Token removed");
        }

        if (jsonResp.success) {
          const { token, userId, userName, email, phoneNumber, role } =
            jsonResp;

          // จัดเก็บข้อมูลใน AsyncStorage
          await AsyncStorage.multiSet([
            ["userToken", token],
            ["userId", JSON.stringify(userId)], // Stringify userId
            ["userName", userName],
            ["email", email],
            ["phoneNumber", phoneNumber],
            ["userRole", role],
          ]);
          console.log("User data saved Sir'Benz!");
        }

        switch (role) {
          case "parent":
            navigation.reset({
              index: 0,
              routes: [{ name: "mainPR" }],
            });
            break;
          case "supervisor":
            navigation.reset({
              index: 0,
              routes: [{ name: "mainSP" }],
            });
            break;
          case "admin":
            navigation.navigate("adminHome");
            break;
          default:
            console.log("Unknown role:", role);
        }
      } else if (resp.status === 409) {
        Alert.alert("ไม่สำเร็จ", "รหัสผู้ใช้ซ้ำ");
        navigation.reset({
          index: 0,
          routes: [{ name: "register" }],
        });
      }
    } catch (e) {
      console.log(e);
      Alert.alert("ระบบมีปัญหา", "กรุณาลองอีกครั้ง");
    }
  };

  // Component
  const handleSignUp = (data: RegisterModel) => {
    console.log("Form data:", data); // Check Form
    // เมื่อผู้ใช้กด "Sign Up", นำทางไปยังหน้า Privacy และส่งฟังก์ชัน validatePass ไปด้วย
    navigation.navigate("privacy", {
      form: data, // ส่งข้อมูลฟอร์มไปยังหน้า Privacy
      onAgree: validatePass, // ส่งฟังก์ชัน validatePass ไปยังหน้า Privacy
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require("../assets//background/bg2.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          {/* Top Section */}
          <View style={styles.TopSectionCantainer}>
            <Text style={styles.header}>SIGN UP</Text>
          </View>

          {/* Mid Section */}
          <View style={styles.MidSectionContainer}>
            <Text style={styles.OnInputText}>ชื่อผู้ใช้</Text>
            <Controller
              control={control}
              name="userName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="USERNAME"
                    style={styles.input}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                  {errors.userName && (
                    <Text style={styles.errorText}>
                      {errors.userName.message}
                    </Text>
                  )}
                </View>
              )}
            />
            <Text style={styles.OnInputText}>อีเมล</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="EMAIL"
                    style={styles.input}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </View>
              )}
            />
            <Text style={styles.OnInputText}>รหัสผ่าน</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="PASSWORD"
                    style={styles.input}
                    secureTextEntry={true}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />
            <Text style={styles.OnInputText}>หมายเลขโทรศัพท์</Text>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="PHONE NUMBER"
                    style={styles.input}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                  {errors.phoneNumber && (
                    <Text style={styles.errorText}>
                      {errors.phoneNumber.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <View>
              <Text style={styles.OnInputText}>Select Role</Text>

              {/* Platform-specific Picker */}
              {Platform.OS === "ios" ? (
                // iOS: ใช้ Picker โดยตรง (ไม่ใช้ Modal)
                <Controller
                  control={control}
                  name="role"
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      style={styles.picker}
                      onValueChange={(itemValue) => onChange(itemValue)} // อัปเดตค่าที่เลือก
                    >
                      <Picker.Item
                        label="Select Role"
                        value=""
                        enabled={false}
                      />
                      <Picker.Item label="Parent" value="parent" />
                      <Picker.Item label="Supervisor" value="supervisor" />
                      <Picker.Item label="Admin" value="admin" />
                    </Picker>
                  )}
                />
              ) : (
                // Android: Picker แบบเดิม
                <Controller
                  control={control}
                  name="role"
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      style={styles.picker}
                      onValueChange={(itemValue) => onChange(itemValue)} // อัปเดตค่าที่เลือก
                    >
                      <Picker.Item
                        label="Select Role"
                        value=""
                        enabled={false}
                      />
                      <Picker.Item label="Parent" value="parent" />
                      <Picker.Item label="Supervisor" value="supervisor" />
                      <Picker.Item label="Admin" value="admin" />
                    </Picker>
                  )}
                />
              )}

              {/* Display error message if role is not selected */}
              {errors.role && (
                <Text style={styles.errorText}>{errors.role.message}</Text>
              )}
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.BottomSectionContainer}>
            <Pressable
              style={styles.button}
              onPress={handleSubmit(handleSignUp)}
            >
              <Text style={styles.buttonText}>SIGN UP</Text>
            </Pressable>
            <Text style={styles.already}>ALREADY HAVE AN ACCOUNT?</Text>
            <Pressable onPress={() => navigation.navigate("login")}>
              <Text style={styles.signInText}>SIGN IN</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 850,
  },
  // scrollview: {
  //   flexGrow: 1,
  // },
  container: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
  },
  TopSectionCantainer: {
    //flex: 1,
    alignItems: "center",
  },
  MidSectionContainer: {
    //flex: 1,
  },
  BottomSectionContainer: {
    //flex: 1,
    alignItems: "center",
    marginTop: 15,
    // borderWidth: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 5,
    fontSize: 16,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  pickerContainer: {
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
    // backgroundColor: "white", // Light background
    backgroundColor: "black", // Dark background
  },
  picker: {
    color: "black", // Set text color to black
    fontSize: 16,
    borderWidth: 1,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    height: 50,
    width: "100%",
    marginBottom: 10,
  },
  pickerButtonText: {
    color: "#333",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  button: {
    width: "95%",
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    backgroundColor: "#f5d2f5",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  signInText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  already: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    left: 8,
    textAlign: "left", // Align error text to the left
    marginBottom: 5, // Add space between error text and other elements
  },
  OnInputText: {
    fontSize: 14,
    textAlign: "left",
    left: 8,
    marginBottom: 2,
  },
});

export default Register;
