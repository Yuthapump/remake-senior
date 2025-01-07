import React, { FC, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// กำหนด interface สำหรับข้อมูลเด็ก
export interface Child {
  child_id: number;
  childName: string;
  nickname: string;
  birthday: string;
  gender: string;
  childPic: string;
  age?: number; // Add age property (optional)
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

export const HomePR: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [children, setChildren] = useState<Child[]>([]); // กำหนดประเภทเป็น array ของ Child

  useFocusEffect(
    React.useCallback(() => {
      const fetchChildData = async () => {
        try {
          const parent_id = await AsyncStorage.getItem("userId");

          if (parent_id) {
            const response = await fetch(
              `https://senior-test-deploy-production-1362.up.railway.app/api/childs/get-child-data?parent_id=${parent_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              const jsonResponse = await response.json();

              if (jsonResponse.success && jsonResponse.children) {
                const updatedChildren: Child[] = jsonResponse.children.map(
                  (child: Child) => {
                    const { years, months } = calculateAge(child.birthday); // calculate years/months
                    const imageUrl = `https://senior-test-deploy-production-1362.up.railway.app/${child.childPic}`;
                    return {
                      ...child,
                      age: `${years} ปี ${months} เดือน`, // set age
                      childPic: imageUrl,
                    };
                  }
                );

                setChildren(updatedChildren); // setting age child
              } else {
                setChildren([]);
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

  const whenGotoAddChild = () => {
    navigation.navigate("addchild");
  };

  const whenGotoDetail = (id: number) => {
    navigation.navigate("detail", { id });
  };

  const whenGotoAssessment = (child: Child) => {
    navigation.navigate("assessment", { child });
  };

  const whenGotoChooseChild = () => {
    navigation.navigate("choosechild");
  };

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/background/bg1.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.topSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {children.length === 0 ? (
                <View style={styles.profileCardIntro}>
                  <Image
                    source={require("../../assets/icons/User_Icon.png")}
                    style={styles.profileIcon}
                  />
                  <View style={styles.profileInfo}>
                    <View style={styles.IntroContainer}>
                      <Text style={styles.TextIntro}>กรุณาเพิ่มข้อมูลเด็ก</Text>
                    </View>
                    <Pressable
                      style={styles.detailButtonIntro}
                      onPress={whenGotoAddChild}
                    >
                      <Text style={styles.detailTextIntro}>
                        เพิ่มข้อมูลเด็กที่นี่
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                children.map((child) => (
                  <View
                    key={child.child_id}
                    style={
                      child.gender === "male"
                        ? styles.profileCardBoy
                        : styles.profileCardGirl
                    }
                  >
                    <Pressable onPress={() => whenGotoAssessment(child)}>
                      <Image
                        source={
                          child.childPic
                            ? { uri: child.childPic }
                            : require("../../assets/icons/User_Icon.png")
                        }
                        style={styles.profileIcon}
                      />
                    </Pressable>
                    <View style={styles.profileInfo}>
                      <View style={styles.detailsName}>
                        <Text style={styles.profileName}>
                          {child.childName}
                        </Text>
                      </View>
                      <View style={styles.detailsAge}>
                        <Text style={styles.profileAge}>{child.age}</Text>
                      </View>
                      <Pressable
                        key={child.child_id}
                        style={
                          child.gender === "male"
                            ? styles.detailsButtonBoy
                            : styles.detailsButtonGirl
                        }
                        //onPress={() => whenGotoDetail(child.id)}
                      >
                        <Text style={styles.detailsText}>ดูรายละเอียด</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
              <Pressable style={styles.addButton} onPress={whenGotoAddChild}>
                <Image
                  source={require("../../assets/icons/add.png")}
                  style={styles.addIcon}
                />
              </Pressable>
            </ScrollView>
          </View>

          <View style={styles.middleSection}>
            <Pressable
              style={styles.evaluateButton}
              onPress={whenGotoChooseChild}
            >
              <Image
                source={require("../../assets/icons/assessment.png")}
                style={styles.asessmentIcon}
              />
              <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
            </Pressable>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.assessmentCard}>
              <View style={styles.assessmentTop}>
                <View style={styles.assessmentNumberContainer}>
                  <Text style={styles.assessmentNumber}>71</Text>
                </View>
                <View style={styles.assessmentTitleContainer}>
                  <Text style={styles.assessmentTitle}>
                    ขว้างลูกบอลขนาดเล็กได้โดยยกมือขึ้นเหนือศีรษะ
                  </Text>
                </View>
              </View>
              <Image
                source={require("../../assets/image/child_playing.png")}
                style={styles.assessmentImage}
              />
              <View style={styles.skillContainer}>
                <Text style={styles.skillHeader}>วิธีฝึกทักษะ</Text>
                <Text style={styles.skillText}>
                  1. ขว้างลูกบอลให้เด็กดูโดยยกมือขึ้นเหนือศีรษะ
                  ไปทางด้านหลังแล้ว ขว้างลูกบอลไปข้างหน้า
                </Text>
                <Text style={styles.skillText}>
                  2. จัดเด็กยืนในท่าที่มั่นคงจับมือเด็กข้างที่ถนัด ถือลูกบอล
                  แล้วยก ลูกบอลขึ้นเหนือศีรษะไปทางด้านหลัง แล้วขว้างลูกบอลออกไป
                </Text>
                <Text style={styles.skillText}>
                  3. เมื่อเด็กเริ่มทำได้ ลดการช่วยเหลือจนเด็กขว้างลูกบอลได้เอง
                </Text>
                <Text style={styles.skillText}>
                  4. เล่นขว้างลูกบอลกับเด็กบ่อย ๆ
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    flex: 1,
    // resizeMode: "cover",
    // height: 850,
  },
  SafeAreaProvider: {
    flex: 1,
    backfaceVisibility: "visible",
  },

  // ---------------------------------------------------------------------------------------------

  topSection: {
    width: "100%",
    marginTop: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profileCardBoy: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 250,
    height: 130,
    marginLeft: 10,
  },
  profileCardGirl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 250,
    height: 130,
    marginLeft: 10,
  },

  profileIcon: {
    width: 61,
    height: 61,
    marginRight: 10,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profileAge: {
    fontSize: 14,
    color: "#555",
  },
  detailsButtonGirl: {
    width: "85%",
    marginLeft: 10,
    marginTop: 9,
    backgroundColor: "#FFA2C4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 9,
    backgroundColor: "#98D4FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },

  detailsName: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center", // จัดแนวตัวอักษรในแนวแกน X ให้อยู่ตรงกลาง
    justifyContent: "center", // จัดแนวตัวอักษรในแนวแกน Y ให้อยู่ตรงกลาง
  },
  detailsAge: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center",
  },

  detailsText: {
    fontSize: 12,
    color: "#FFF",
    padding: 2,
  },
  addButton: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 30, // half width,height for cycle
    width: 62,
    height: 62,
    marginLeft: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
    marginTop: 32,
    right: 15,
  },
  addIcon: {
    width: 45,
    height: 45,
  },
  // ---------------------------------------------------------------------------------------------

  middleSection: {
    alignItems: "center",
    width: "90%",
    marginBottom: 15,
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
  // ---------------------------------------------------------------------------------------------

  bottomSection: {
    flex: 1,
    width: "94%",
    marginBottom: 15,
  },
  assessmentCard: {
    backgroundColor: "#F8F1FF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    alignItems: "center",
    height: "100%",
  },
  assessmentTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    marginBottom: 10,
  },
  assessmentNumberContainer: {
    backgroundColor: "#FFD2DC",
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 25,
    width: 65,
    height: "100%",
    alignItems: "center",
  },
  assessmentNumber: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "bold",
  },
  assessmentTitleContainer: {
    flexDirection: "row",
    width: "80%",
    alignItems: "center",
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 40,
  },
  assessmentImage: {
    width: "50%",
    height: "30%",
    marginBottom: 15,
  },
  skillContainer: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    height: "52%",
  },
  skillHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    left: 100,
    right: 100,
  },
  skillText: {
    fontSize: 14,
    color: "#555",
  },

  // ----------------------------------------------------------------------------------
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
    width: 280,
    height: 130,
    marginLeft: 10,
  },
  IntroContainer: {
    width: "90%",
    marginLeft: 4,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  detailButtonIntro: {
    width: "80%",
    marginLeft: 13,
    marginTop: 9,
    backgroundColor: "#ececec",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
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
});
