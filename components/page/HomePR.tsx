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
import { Assessment } from "./Assessment";
import { LinearGradient } from "expo-linear-gradient";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

export interface AssessmentDetails {
  assessment_details_id: number;
  age_range: string;
  assessment_name: string;
  assessment_image?: string;
  assessment_device_name: string | null;
  assessment_device_image?: string;
  assessment_device_detail: string | null;
  assessment_method: string;
  assessment_succession: string;
  assessmentInsert_id: number;
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
  // useState
  const navigation = useNavigation<NavigationProp<any>>();
  const [children, setChildren] = useState<Child[]>([]); // กำหนดประเภทเป็น array ของ Child
  const [assessmentDetails, setAssessmentDetails] =
    useState<AssessmentDetails | null>(null);

  // useEffect
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
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // renderAssessmentState

  const renderAssessmentState = () => {
    if (!assessmentDetails) {
      console.log("assessmentDetails is null or undefined");
      return null; // ตรวจสอบว่า assessmentDetails ไม่มีค่า null
    }
  };
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // navigate

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

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  return (
    <SafeAreaProvider>
      <ImageBackground
        source={require("../../assets/background/bg2.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          {/* start assessments Section */}
          <View style={styles.startassessmentsSection}>
            <Pressable onPress={whenGotoChooseChild}>
              <LinearGradient
                colors={["#FFFFFF", "#E6FFF0", "#DCF5F0"]}
                style={styles.evaluateButton}
              >
                <Image
                  source={require("../../assets/icons/assessment.png")}
                  style={styles.asessmentIcon}
                />
                <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Child data Section */}
          <View style={styles.midSection}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {children.length === 0 ? (
                <View style={styles.howtousesection}></View>
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

                      {/* render assessmentsState */}
                      <View style={styles.stateContainer}>
                        <View style={styles.assessmentsState}>
                          <Image
                            source={require("../../assets/icons/stateGM.png")}
                            style={styles.stateIcon}
                          />
                          <View style={styles.stateNumber}>
                            <Text style={styles.textState}>10</Text>
                          </View>
                        </View>

                        <View style={styles.assessmentsState}>
                          <Image
                            source={require("../../assets/icons/stateGM.png")}
                            style={styles.stateIcon}
                          />
                          <View style={styles.stateNumber}>
                            <Text style={styles.textState}>10</Text>
                          </View>
                        </View>

                        <View style={styles.assessmentsState}>
                          <Image
                            source={require("../../assets/icons/stateGM.png")}
                            style={styles.stateIcon}
                          />
                          <View style={styles.stateNumber}>
                            <Text style={styles.textState}>10</Text>
                          </View>
                        </View>

                        <View style={styles.assessmentsState}>
                          <Image
                            source={require("../../assets/icons/stateGM.png")}
                            style={styles.stateIcon}
                          />
                          <View style={styles.stateNumber}>
                            <Text style={styles.textState}>10</Text>
                          </View>
                        </View>

                        <View style={styles.assessmentsState}>
                          <Image
                            source={require("../../assets/icons/stateGM.png")}
                            style={styles.stateIcon}
                          />
                          <View style={styles.stateNumber}>
                            <Text style={styles.textState}>10</Text>
                          </View>
                        </View>
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
            </ScrollView>
          </View>
          <Pressable style={styles.addButton} onPress={whenGotoAddChild}>
            <Image
              source={require("../../assets/icons/add.png")}
              style={styles.addIcon}
            />
          </Pressable>
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
    // justifyContent: "center",
  },
  background: {
    flex: 1,
    // resizeMode: "cover",
    // height: 850,
    height: "100%",
    borderWidth: 2,
  },
  ScrollView: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 30,
  },
  addButton: {
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 30,
    width: 60,
    height: 60,
    left: "80%",
    position: "absolute",
    bottom: 0,
    marginBottom: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
  },
  addIcon: {
    width: 45,
    height: 45,
  },

  // ---------------------------------------------------------------------------------------------

  midSection: {
    width: "90%",
    height: 570,
    marginTop: 15,
    marginBottom: 15,
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "center",
    shadowColor: "#808080", // กำหนดสีของเงาเป็นสีดำ (สีในรูปแบบ Hex)
    shadowOffset: { width: 0, height: 4 }, // กำหนดการเลื่อนของเงาในแนวนอน (width) และแนวตั้ง (height)
    shadowOpacity: 0.3, // กำหนดความทึบของเงา (0 คือโปร่งใส, 1 คือทึบเต็มที่)
    shadowRadius: 2, // กำหนดรัศมีการกระจายของเงา
    elevation: 6, // กำหนดระดับความสูงของเงา (ใช้ใน Android)
    // borderWidth: 2,
  },
  profileCardBoy: {
    flexDirection: "row",
    // alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    width: 350,
    height: "auto",
    marginTop: 15,
  },
  profileCardGirl: {
    flexDirection: "row",
    // alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 30,
    width: 350,
    height: "auto",
    marginTop: 15,
    // borderWidth: 2,
  },

  profileIcon: {
    width: 61,
    height: 61,
    // marginRight: 10,
    marginTop: 10,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    // borderWidth: 2,
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

  // ----------------------------------------------------------------------------------

  stateContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Add this line to wrap content if it overflows
    justifyContent: "center",
    width: 400,
    height: "auto",
    right: 80,
    // borderWidth: 2,
  },
  assessmentsState: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Add space between elements
    width: 96,
    height: 50,
    borderRadius: 30,
    marginTop: 15,
    padding: 8,
    marginRight: 5, // Add some margin to the right for spacing
    // borderWidth: 1,
  },
  textState: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  stateIcon: {
    width: 37,
    height: 37,
    borderRadius: 30,
  },
  stateNumber: {
    width: 37,
    height: 37,
    borderRadius: 30,
    backgroundColor: "#FF6565",
    justifyContent: "center",
    // borderWidth: 1,
  },

  // ---------------------------------------------------------------------------------------------

  startassessmentsSection: {
    alignItems: "center",
    width: "90%",
    height: "auto",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  evaluateButton: {
    backgroundColor: "#ccfff5",
    flexDirection: "row",
    width: "100%",
    height: 110,
    borderRadius: 25,
    // padding: 15,
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#fff",
    // shadowOffset: { width: 0, height: 5 },
    // shadowOpacity: 1,
    // shadowRadius: 3,
    // elevation: 4,
    // borderWidth: 2,
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
    marginHorizontal: 25,
  },
  // ---------------------------------------------------------------------------------------------

  howtousesection: {
    backgroundColor: "#F8F1FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: 350,
    height: 550,
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
