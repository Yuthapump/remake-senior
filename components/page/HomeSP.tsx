import React, { FC, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  usePushNotifications,
  sendExpoPushTokenToBackend,
} from "../../app/usePushNotifications";

export interface Child {
  child_id: number;
  childName: string;
  nickname: string;
  birthday: string;
  gender: string;
  childPic: string;
  age?: number; // Add age property (optional)
}

export interface Room {
  rooms_id: number;
  rooms_name: string;
  roomsPic: string;
  childs_count: number;
  colors: string;
}

// fn calculate age
export const calculateAge = (
  birthday: string
): { years: number; months: number } => {
  const birthDate = new Date(birthday); // แปลง birthday เป็น Date
  const today = new Date(); // วันที่ปัจจุบัน

  let years = today.getFullYear() - birthDate.getFullYear(); // คำนวณอายุในปี
  let months = today.getMonth() - birthDate.getMonth(); // คำนวณเดือน

  // ตรวจสอบเดือน
  if (months < 0) {
    years--; // ลดอายุลง 1 ปีถ้าปีนี้ยังไม่ถึงวันเกิด
    months += 12; // ปรับให้เดือนเป็นค่าบวก
  }

  // ตรวจสอบวัน
  if (today.getDate() < birthDate.getDate() && months > 0) {
    months--; // ลดเดือนลง 1 เดือนถ้ายังไม่ถึงวันเกิดในเดือนนี้
  }

  return { years, months }; // ส่งคืนปีและเดือน
};

export const HomeSP: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const [rooms, setRoom] = useState<Room[]>([]);

  const { expoPushToken } = usePushNotifications();
  // useEffect
  useFocusEffect(
    React.useCallback(() => {
      const fetchChildData = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!supervisor_id) {
            console.error("Parent ID is missing.");
            return;
          }

          if (!token) {
            console.error("token is missing.");
            return;
          }

          if (expoPushToken) {
            const user_id = parseInt(supervisor_id, 10);
            if (!isNaN(user_id)) {
              await sendExpoPushTokenToBackend(expoPushToken, user_id);
            } else {
              console.error("Invalid user ID.");
            }
          }

          if (supervisor_id) {
            const response = await fetch(
              `https://senior-test-deploy-production-1362.up.railway.app/api/rooms/get-all-data?supervisor_id=${supervisor_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const jsonResponse = await response.json();
              console.log("json response HOME: ", jsonResponse);
              if (jsonResponse.rooms) {
                const updatedRoom: Room[] = jsonResponse.rooms.map(
                  (rooms: Room) => {
                    const imageUrl = `https://senior-test-deploy-production-1362.up.railway.app/${rooms.roomsPic}`;
                    return {
                      ...rooms,
                      roomsPic: imageUrl,
                      colors: rooms.colors || "#c5e5fc",
                    };
                  }
                );

                setRoom(updatedRoom); // setting age child
              } else {
                setRoom([]);
              }
            } else {
              console.error(
                "HTTP Error: ",
                response.status,
                response.statusText
              );
            }
          }
        } catch (error) {
          console.error("Error retrieving child data:", error);
        }
      };

      fetchChildData();
    }, [])
  );
  const whenGotoAddroom = () => {
    navigation.navigate("addroom");
  };
  const whenGotoAddchildSP = () => {
    navigation.navigate("addchildSP");
  };

  const whengotoChooseChildSP = (rooms: Room) => {
    navigation.navigate("choosechildsp", { rooms });
  };

  const whenGotoChooseRoom = () => {
    navigation.navigate("chooseroom");
  };

  const [showIcons, setShowIcons] = useState(false); // สถานะการโชว์ไอคอน
  const translation1 = useRef(new Animated.Value(0)).current; // ไอคอนที่สอง
  const translation2 = useRef(new Animated.Value(0)).current; // ไอคอนที่สาม
  const rotation = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (showIcons) {
      // ซ่อนไอคอนและหมุนกลับ
      Animated.parallel([
        Animated.timing(rotation, {
          toValue: 0, // หมุนกลับ
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translation1, {
          toValue: 0, // เลื่อนกลับ
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowIcons(false));
    } else {
      // แสดงไอคอนและหมุน 45 องศา
      setShowIcons(true);
      Animated.parallel([
        Animated.timing(rotation, {
          toValue: 1, // หมุน 45 องศา
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translation1, {
          toValue: 80, // เลื่อนไปตำแหน่งที่ 1
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"], // หมุน 45 องศา
  });

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.roomInfo}>
            <ScrollView
              horizontal={true} // เปิดการเลื่อนแนวนอน
              style={styles.ScrollView}
              contentContainerStyle={styles.scrollContent}
              showsHorizontalScrollIndicator={false}
            >
              {rooms.length === 0 ? (
                <View style={styles.profileCardIntro}>
                  <Image
                    source={require("../../assets/icons/User_Icon.png")}
                    style={styles.profileIcon}
                  />
                  <View style={styles.profileInfo}>
                    <View style={styles.IntroContainer}>
                      <Text style={styles.TextIntro}>กรุณาเพิ่มข้อมูลเด็ก</Text>
                    </View>
                    <Pressable style={styles.detailButtonIntro}>
                      <Text style={styles.detailTextIntro}>
                        เพิ่มข้อมูลเด็กที่นี่
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                rooms.map((rooms) => (
                  <Pressable
                    key={rooms.rooms_id}
                    style={[
                      styles.CardRoom,
                      { backgroundColor: rooms.colors || "#c5e5fc" },
                    ]}
                    onPress={() => whengotoChooseChildSP(rooms)}
                  >
                    <Image
                      source={
                        rooms.roomsPic
                          ? { uri: rooms.roomsPic }
                          : require("../../assets/icons/User_Icon.png")
                      }
                      style={styles.profileIcon}
                    />

                    <View style={styles.profileInfo}>
                      <View style={styles.detailsName}>
                        <Text style={styles.profileName}>
                          {rooms.rooms_name}
                        </Text>
                      </View>
                      <View style={styles.detailsAge}>
                        <Text style={styles.profileAge}>
                          {rooms.childs_count}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Add Button */}
      <View style={styles.addContainer}>
        {/* ไอคอนแรก */}
        <TouchableOpacity style={styles.addButton} onPress={handlePress}>
          <Animated.View
            style={[
              styles.starIcon,
              { transform: [{ rotate: rotateInterpolation }], zIndex: 2 },
            ]}
          >
            <View style={[styles.starArm, styles.vertical]} />
            <View style={[styles.starArm, styles.horizontal]} />
          </Animated.View>
        </TouchableOpacity>

        {/* ไอคอนที่ 2 */}
        {showIcons && (
          <Animated.View
            style={[
              styles.animatedButton,
              {
                transform: [{ translateX: translation1 }],
                position: "absolute",
                zIndex: 1,
              },
            ]}
          >
            <Pressable style={styles.addButton} onPress={whenGotoAddroom}>
              {/* <Image source={require("../../assets/icons/add.png")} style={styles.icon} /> */}
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Pressable style={styles.evaluateButton} onPress={whenGotoChooseRoom}>
          <Image
            source={require("../../assets/icons/assessment.png")}
            style={styles.asessmentIcon}
          />
          <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
        </Pressable>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.graphContainer}>
          <Image
            source={require("../../assets/images/bar_chart.png")}
            style={styles.graphImage}
          />
        </View>
        <View style={styles.pieChartContainer}>
          <Image
            source={require("../../assets/images/pie_chart.png")}
            style={styles.pieChartImage}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    paddingTop: 50,
  },
  topSection: {
    flexDirection: "row",
    // alignItems: "center",
    marginBottom: 20,
    width: "100%",
    height: "23%",
    borderWidth: 2,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#FFEFD5",
    padding: 10,
    borderRadius: 10,
    width: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  roomInfo: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    // padding: 10,
    // borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    // width: "100%",
    // height: "100%",
    // marginLeft: 5,
    borderWidth: 2,
  },
  icon: {
    width: 50,
    height: 50,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  countText: {
    fontSize: 12,
    color: "#555",
  },
  addContainer: {
    flexDirection: "row",
  },
  addButton: {
    backgroundColor: "#FFF",
    marginLeft: 20,
    borderRadius: 30, // half width,height for cycle
    width: 62,
    height: 62,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
    bottom: 10,
  },
  addIcon: {
    width: 45,
    height: 45,
  },
  animatedButton: {
    position: "absolute", // ช่วยจัดตำแหน่ง
  },
  starIcon: {
    position: "relative",
    width: 50, // ขนาดของดาว
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  starArm: {
    position: "absolute",
    backgroundColor: "#8DD9BD",
    borderRadius: 2,
  },
  vertical: {
    width: 7, // ความกว้างของแฉก
    height: 30, // ความยาวของแฉก
  },
  horizontal: {
    width: 30, // ความยาวของแฉก
    height: 7, // ความกว้างของแฉก
  },
  //----------------------------------------------------------------

  middleSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    marginBottom: 10,

    paddingHorizontal: 20,
  },
  evaluateButton: {
    backgroundColor: "#ccfff5",
    flexDirection: "row",
    padding: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    width: "100%",
    height: 95,
  },
  asessmentIcon: {
    width: 65,
    height: 65,
    marginLeft: 10,
  },
  evaluateText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginLeft: 50,
  },
  //------------------------------------------------------------------
  bottomSection: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 20,
    marginLeft: 20,
    marginRight: 20,
    marginVertical: 10,
    height: "auto",
    marginBottom: 100,
  },
  graphContainer: {
    width: "100%",
    height: "50%",
    backgroundColor: "#ffffff",
    bottom: 5,
    borderRadius: 10,
  },
  graphImage: {
    width: "100%",
    height: "auto",
  },
  pieChartContainer: {
    width: "100%",
    height: "50%",
    backgroundColor: "#ffffff",
    top: 5,
    borderRadius: 10,
  },
  pieChartImage: {
    width: "80%",
    height: "auto",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#E0FFFF",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  footerIcon: {
    width: 30,
    height: 30,
  },
  //------------------------------------------------------------------
  CardRoom: {
    // flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // จัดเนื้อหาภายในการ์ดให้อยู่กึ่งกลาง
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: "24%", // ใช้ความกว้างแบบยืดหยุ่น
    height: "100%",
    // marginTop: 15,
    marginHorizontal: 10,
    borderWidth: 2,
  },
  ScrollView: {
    flex: 1,
    // width: "100%",
    // borderWidth: 2,
    // borderRadius: 20,
    // height: "100%",
    // marginBottom: 10,
  },
  scrollContent: {
    flexDirection: "row", // เรียงแนวนอน
    alignItems: "center", // จัดให้อยู่ตรงกลางแนวตั้ง
    // justifyContent: "flex-start", // ให้การ์ดเริ่มจากซ้ายไปขวา
    // paddingHorizontal: 15, // เพิ่ม padding ซ้าย-ขวา
    height: "100%", // ให้ ScrollView กินพื้นที่แนวตั้งทั้งหมด
  },
  profileCardIntro: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b0b0b0",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 350,
    height: 130,
  },
  profileIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
  },
  IntroContainer: {
    width: "95%",
    marginLeft: 4,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTextIntro: {
    fontSize: 14,
    color: "#000",
    padding: 2,
  },
  TextIntro: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailButtonIntro: {
    width: "80%",
    marginLeft: 18,
    marginTop: 9,
    backgroundColor: "#ececec",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsName: {
    width: "auto",

    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsAge: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
  },
  profileAge: {
    fontSize: 14,
    color: "#555",
  },
});
