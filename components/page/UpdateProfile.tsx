// updateProfile.tsx
import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import { set } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";

export const UpdateProfile: FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("userToken");
        const storedUserName = await AsyncStorage.getItem("userName");
        const storedEmail = await AsyncStorage.getItem("email");
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const storedProfilePic = await AsyncStorage.getItem("profilePic");

        if (storedUserName) setUserName(storedUserName);
        if (storedEmail) setEmail(storedEmail);
        if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
        if (storedProfilePic) setProfilePic(storedProfilePic);

        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          const response = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/profiles/get-user-profile-pic?userId=${userId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const jsonResponse = await response.json();
            if (jsonResponse.success && jsonResponse.profilePic) {
              setProfilePic(
                `https://senior-test-deploy-production-1362.up.railway.app/${jsonResponse.profilePic}`
              );
            }
          } else {
            console.error("HTTP Error:", response.status, response.statusText);
          }
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ฟังก์ชันขออนุญาต
  const requestPermission = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "You need to grant permission to access the media library."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permission:", error);
      Alert.alert(
        "Permission Error",
        "An error occurred while requesting permissions."
      );
      return false;
    }
  };

  // ฟังก์ชันเลือกภาพ
  const selectImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;

      try {
        // สร้างโฟลเดอร์หากยังไม่มี
        const imgDir = FileSystem.documentDirectory + "images/";
        const folderInfo = await FileSystem.getInfoAsync(imgDir);
        if (!folderInfo.exists) {
          await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
        }

        // บันทึกรูปภาพลงในเครื่อง
        const filename = new Date().getTime() + ".jpeg";
        const dest = imgDir + filename;
        await FileSystem.copyAsync({ from: selectedImageUri, to: dest });
        setProfilePic(dest); // ตั้ง path ของภาพที่บันทึกไว้ใน state
        console.log("Selected and saved Image URI:", dest);
      } catch (error) {
        console.error("Error saving image:", error);
        Alert.alert("Error", "An error occurred while saving the image.");
      }
    }
  };

  // ฟังก์ชันสำหรับอัปเดตโปรไฟล์
  const handleUpdate = async () => {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("userToken");
    console.log("user_id: ", userId);
    console.log("profilePic:", profilePic);

    try {
      const formData = new FormData();

      // ดึงข้อมูลที่เก็บไว้ใน AsyncStorage
      const storedUserName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("email");
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");

      // Append user information to FormData only if changed
      if (userName !== storedUserName) {
        formData.append("userName", userName);
      }
      if (email !== storedEmail) {
        formData.append("email", email);
      }
      if (phoneNumber !== storedPhoneNumber) {
        formData.append("phoneNumber", phoneNumber);
      }

      // Append userId
      if (userId) {
        formData.append("user_id", userId);
      } else {
        throw new Error("User ID is missing");
      }

      // Append profile picture if available
      if (profilePic) {
        const uri = profilePic;
        const filename = uri.split("/").pop(); // Extract filename from URI
        const imageType = "image/jpeg"; // Assuming JPEG format
        formData.append("profilePic", {
          uri: uri, // Ensure URI is valid
          name: filename,
          type: imageType,
        } as any);
      } else {
        console.log("No profilePic provided");
      }

      // ส่งคำขอไปยัง API
      const response = await fetch(
        "https://senior-test-deploy-production-1362.up.railway.app/api/profiles/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      // เพิ่มการดีบักเพื่อดูสถานะและเนื้อหาของการตอบกลับ
      const status = response.status;
      const responseText = await response.text(); // ดึงการตอบกลับเป็นข้อความ

      console.log("Response Status:", status);

      // พยายามแปลงเป็น JSON
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        Alert.alert("Update Failed", "Received invalid response from server.");
        return;
      }

      if (response.ok && jsonResponse.success) {
        // เก็บข้อมูลที่อัปเดตลงใน AsyncStorage
        await AsyncStorage.setItem("userName", userName);
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("phoneNumber", phoneNumber);
        if (profilePic) {
          await AsyncStorage.setItem("profilePic", profilePic);
        }

        Alert.alert(
          "Profile Updated",
          "Your profile information has been updated."
        );
        navigation.goBack();
      } else {
        console.log("Failed to update profile:", jsonResponse);
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      Alert.alert("Update Failed", "An error occurred while updating profile.");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaProvider>
        <ImageBackground
          source={require("../../assets/background/bg2.png")}
          style={styles.container}
        >
          {/* top section */}
          <Text style={styles.header}></Text>
          {/* mid section */}
          <View style={styles.avtarFrame}>
            {isLoading ? (
              <Image
                source={require("../../assets/loading/loading-profile.gif")}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={
                  profilePic
                    ? { uri: profilePic }
                    : require("../../assets/icons/User_Icon.png")
                }
                style={styles.avatar}
              />
            )}
            <Pressable style={styles.addIconSection} onPress={selectImage}>
              <Image
                source={require("../../assets/icons/add.png")}
                style={styles.addIcon}
              />
            </Pressable>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Username"
            />
            <View style={[styles.editIconSection]}>
              <Image
                source={require("../../assets/icons/editicon.png")}
                style={styles.editIcon}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
            />
            <View style={styles.editIconSection}>
              <Image
                source={require("../../assets/icons/editicon.png")}
                style={styles.editIcon}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
            <View style={styles.editIconSection}>
              <Image
                source={require("../../assets/icons/editicon.png")}
                style={styles.editIcon}
              />
            </View>
          </View>
          {/* update button */}
          <Pressable onPress={handleUpdate}>
            <LinearGradient
              colors={["#DDE6FF", "#FFFFFF"]}
              style={styles.button}
            >
              <View>
                <Text style={styles.buttonText}>Update Profile</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </ImageBackground>
        {/* bottom section */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.backIcon}
            />
          </Pressable>
        </View>
      </SafeAreaProvider>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 750,
    // borderWidth: 3,
  },
  updateContainer: {
    flex: 1,
    borderWidth: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  button: {
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    width: 240,
    height: 40,
    marginTop: 100,
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ---------------------------------------------------------------------------------------------

  buttonContainer: {
    width: "100%",
    position: "absolute",
    bottom: 20,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 0,
    //borderWidth: 2,
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 8,
    borderRadius: 30,
    width: "35%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  backIcon: {
    width: 35,
    height: 35,
  },
  //---------------------------------------------------------------------------------------------
  //avatar
  avatarContainer: {
    position: "relative",
    bottom: "100%",
  },
  avtarFrame: {
    borderRadius: 45,
    height: "13%",
    // borderWidth: 2,
  },
  addIconSection: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFD3AB",
  },
  addIcon: {
    top: 4,
    width: 27,
    height: 27,
  },
  //--------------------------------------------------------------------------------
  inputContainer: {
    width: "100%",
    alignItems: "center",
  },
  input: {
    width: "80%",
    padding: 10,
    top: 20,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  editIconSection: {
    position: "absolute",
    right: 50, // ไอคอนอยู่ขอบขวา
    top: 26, // ปรับให้อยู่กลางแนวตั้ง,
  },
  editIcon: {
    top: 4,
    height: 20,
    width: 20,
  },
});
