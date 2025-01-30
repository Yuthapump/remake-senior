// Setting.tsx
import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";

export const Setting: FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem("userName");
        const storedProfilePic = await AsyncStorage.getItem("profilePic"); // ดึงจาก Cache

        if (storedUserName) setUserName(storedUserName);
        if (storedProfilePic) setProfilePic(storedProfilePic); // ใช้รูปที่ Cache ไว้ก่อน

        await fetchUserProfilePic(); // โหลดรูปใหม่จาก API เฉพาะเมื่อเข้าแอปครั้งแรก
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const fetchUserProfilePic = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      if (!userId) throw new Error("No user ID found");

      const response = await fetch(
        `https://senior-test-deploy-production-1362.up.railway.app/api/profiles/get-user-profile-pic?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const jsonResponse = await response.json();

      if (jsonResponse.success && jsonResponse.profilePic) {
        const imageUrl = `https://senior-test-deploy-production-1362.up.railway.app/${jsonResponse.profilePic}`;
        setProfilePic(imageUrl);
        await AsyncStorage.setItem("profilePic", imageUrl); // Cache รูปใหม่
      }
    } catch (error) {
      console.error("Failed to fetch profile picture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("profilePic"); // เคลียร์รูปที่ Cache
      navigation.reset({
        index: 0,
        routes: [{ name: "welcome" }],
      });
    } catch (error) {
      Alert.alert("Logout Failed", "An error occurred while logging out");
    }
  };

  const whenGotoUpdateProfile = () => {
    navigation.navigate("updateprofile");
  };

  return (
    <ImageBackground
      source={require("../../assets/background/bg2.png")}
      style={styles.ImageBackground}
    >
      <View style={styles.container}>
        {/* Setting Section */}
        <View style={styles.sectionContainer}>
          {/* Profile Section */}
          <View style={styles.profileContainer}>
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
          </View>

          {/* username Section */}
          <View style={styles.usernameSection}>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{userName}</Text>
            </View>
          </View>
          {/* Account Section */}
          <View style={styles.AccountSection}>
            <Icon name="user" size={20} color="#000" />
            <Text style={styles.sectionTitle}>บัญชีของฉัน</Text>
          </View>
          <Pressable style={styles.sectionItem} onPress={whenGotoUpdateProfile}>
            <Text style={styles.sectionText}>รายละเอียดบัญชี</Text>
            <Icon name="chevron-right" size={15} color="#000" />
          </Pressable>
          {/* Support Section */}
          <View style={styles.SupportSection}>
            <AntDesign name="infocirlce" size={20} color="#000" />
            <Text style={styles.sectionTitle}>ส่วนสนับสนุน</Text>
          </View>
          <Pressable style={styles.sectionItem}>
            <Text style={styles.sectionText}>ศูนย์ช่วยเหลือ</Text>
            <Icon name="chevron-right" size={15} color="#000" />
          </Pressable>
          <Pressable style={styles.sectionItem}>
            <Text style={styles.sectionText}>นโยบาย</Text>
            <Icon name="chevron-right" size={15} color="#000" />
          </Pressable>
          <Pressable style={styles.sectionItem}>
            <Text style={styles.sectionText}>เกี่ยวกับเรา</Text>
            <Icon name="chevron-right" size={15} color="#000" />
          </Pressable>
          <Pressable style={styles.sectionItem}>
            <Text style={styles.sectionText}>คู่มือการใช้งาน</Text>
            <Icon name="chevron-right" size={15} color="#000" />
          </Pressable>
          {/* Download Button */}
          <Pressable style={styles.downloadButton}>
            <Text style={styles.downloadText}>ดาวน์โหลดข้อมูลการประเมิน</Text>
            <Icon name="download" size={20} color="#4CAF50" />
          </Pressable>
        </View>
      </View>
      {/* Logout Button */}
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </Pressable>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  ImageBackground: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    width: "100%",
    height: "80%",
    padding: 20,
    paddingTop: 130,
    // borderWidth: 3,
  },
  profileContainer: {
    position: "absolute",
    width: "40%",
    left: "36%",
    bottom: "100%",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: 125,
    borderRadius: 100,
    backgroundColor: "#E5E7EB",
  },
  usernameSection: {
    width: "100%",
    top: 40,
    alignItems: "center",
  },
  usernameContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 5,
    width: "65%",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginTop: 20,
    backgroundColor: "#e1eeff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    //alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    left: 10,
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 3,
    backgroundColor: "#fff",
  },
  sectionText: {
    fontSize: 14,
  },
  downloadButton: {
    width: "75%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    left: 40,
  },
  downloadText: {
    color: "#000",
    marginRight: 10,
    fontSize: 14,
    fontWeight: "bold",
  },

  logoutButton: {
    width: "50%",
    // marginTop: 15,
    paddingVertical: 13,
    borderRadius: 25,
    backgroundColor: "#ff0000",
    alignItems: "center",
    borderWidth: 1,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  AccountSection: {
    flexDirection: "row",
    paddingTop: 67,
  },
  SupportSection: {
    flexDirection: "row",
    paddingTop: 15,
  },
  ChangeProfileName: {
    left: 100,
  },
});

//export default Setting;
