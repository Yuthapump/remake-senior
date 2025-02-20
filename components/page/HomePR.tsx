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

import { LinearGradient } from "expo-linear-gradient";

import {
  usePushNotifications,
  sendExpoPushTokenToBackend,
} from "../../app/usePushNotifications";

import { LoadingScreenBaby } from "../LoadingScreen";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// กำหนด interface สำหรับข้อมูลเด็ก
export interface Child {
  child_id: number;
  firstName: string;
  lastName: string;
  nickName: string;
  birthday: string;
  gender: string;
  childPic: string;
  age?: number; // Add age property (optional)
  assessments: AssessmentDetails[];
}

export interface AssessmentDetails {
  assessment_details_id: number;
  aspect: string;
  age_range: string;
  assessment_name: string;
  assessment_image?: string;
  assessment_device_name: string | null;
  assessment_device_image?: string;
  assessment_device_detail: string | null;
  assessment_method: string;
  assessment_succession: string;
  assessmentInsert_id: number;
  child_id: number;
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
  const [children, setChildren] = useState<Child[]>([]);
  const [assessmentDetails, setAssessmentDetails] = useState<
    AssessmentDetails[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { expoPushToken } = usePushNotifications();

  // useEffect
  useFocusEffect(
    React.useCallback(() => {
      const fetchChildDataForParent = async () => {
        try {
          const parent_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!parent_id) {
            console.error("Parent ID is missing.");
            return;
          }

          if (!token) {
            console.error("token is missing.");
            return;
          }

          if (expoPushToken) {
            const user_id = parseInt(parent_id, 10);
            if (!isNaN(user_id)) {
              await sendExpoPushTokenToBackend(expoPushToken, user_id);
            } else {
              console.error("Invalid user ID.");
            }
          }

          setLoading(true);
          const response = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/childs/get-child-data?parent_id=${parent_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const jsonResponse = await response.json();
            console.log("Fetch child data successfully");

            if (jsonResponse.children) {
              const updatedChildren: Child[] = jsonResponse.children.map(
                (child: Child) => {
                  const { years, months } = calculateAge(child.birthday);
                  const imageUrl = `https://senior-test-deploy-production-1362.up.railway.app/${child.childPic}`;
                  return {
                    ...child,
                    age: `${years} ปี ${months} เดือน`,
                    childPic: imageUrl,
                  };
                }
              );
              // setChildren(updatedChildren);
              setTimeout(() => {
                setChildren(updatedChildren);
                setLoading(false);
              }, 100); // set delay

              const allAssessments = jsonResponse.children.map(
                (child: any) => child.assessments || []
              );
              setAssessmentDetails(allAssessments.flat());
              // console.log("Assessments fetched:", allAssessments);
            } else {
              console.log("No children found.");
              setChildren([]);
              setAssessmentDetails([]);
              setLoading(false);
            }
          } else {
            console.error(
              `Error fetching data: ${response.status} ${response.statusText}`
            );
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching child data:", error);
          setLoading(false);
        }
      };

      fetchChildDataForParent();
    }, [expoPushToken])
  );

  // === ( LoadingScreen ) ===
  if (loading) {
    return <LoadingScreenBaby />;
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // renderAssessmentState

  const renderAssessmentState = (childId: number) => {
    if (!assessmentDetails) {
      console.log("assessmentDetails is null or undefined");
      return null; // Return null if assessmentDetails is not available
    }
    // console.log("childId:", childId);
    // console.log("assessmentDetails:", assessmentDetails);

    // Filter the assessment details by childId to ensure we only display relevant data
    const childAssessmentDetails = children
      .filter((child) => child.child_id === childId)
      .flatMap((child) =>
        child.assessments.filter((detail) => detail.aspect !== "none")
      );

    // If no assessment details for this child, return null (nothing to render)
    if (childAssessmentDetails.length === 0) {
      return null;
    }

    return (
      <View style={styles.stateContainer}>
        {/* Loop through each aspect and filter corresponding details */}
        {["GM", "FM", "RL", "EL", "PS"].map((aspect) => {
          const filteredDetails = childAssessmentDetails.filter(
            (detail) => detail.aspect === aspect && detail.aspect !== "none"
          );

          // If there are no details for this aspect, skip rendering
          if (filteredDetails.length === 0) return null;

          // Select the correct icon based on the aspect
          let aspectImage;
          switch (aspect) {
            case "GM":
              aspectImage = require("../../assets/icons/stateGM.png");
              break;
            case "FM":
              aspectImage = require("../../assets/icons/stateFM.png");
              break;
            case "RL":
              aspectImage = require("../../assets/icons/stateRL.png");
              break;
            case "EL":
              aspectImage = require("../../assets/icons/stateEL.png");
              break;
            case "PS":
              aspectImage = require("../../assets/icons/statePS.png");
              break;
            default:
              aspectImage = require("../../assets/icons/childIcon.png"); // Fallback image
          }

          return (
            <View key={aspect}>
              {/* Render each detail for this aspect */}
              {filteredDetails.map((detail) => (
                <View
                  key={detail.assessment_details_id}
                  style={styles.assessmentsState}
                >
                  {/* Render the icon for the current aspect */}
                  <Image source={aspectImage} style={styles.stateIcon} />
                  <View style={styles.stateNumber}>
                    <Text style={styles.textState}>
                      {detail.assessment_details_id}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

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
                    <View style={styles.profileCard}>
                      <View style={styles.profileInfo}>
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
                        <View style={styles.childInfo}>
                          <View style={styles.detailsName}>
                            <Text style={styles.profileName}>
                              {child.nickName}
                            </Text>
                          </View>
                          <View style={styles.detailsAge}>
                            <Text style={styles.profileAge}>{child.age}</Text>
                          </View>
                        </View>
                      </View>

                      {/* render assessmentsState */}
                      {renderAssessmentState(child.child_id)}

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
    // borderWidth: 2,
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
    left: "78%",
    position: "absolute",
    bottom: 0,
    marginBottom: 110,
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
    height: "70%",
    marginTop: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  },

  profileIcon: {
    width: 61,
    height: 61,
    marginTop: 10,
    borderRadius: 50,
  },
  profileInfo: {
    flexDirection: "row",
    // borderWidth: 2,
  },
  profileCard: {
    flex: 1,
  },
  childInfo: {
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

  // ----------------------------------------------------------------------------------

  stateContainer: {
    flexDirection: "row",
    flex: 2,
    justifyContent: "space-between", // Add space between elements
    alignItems: "center",
    width: "100%",
    height: "40%",
  },
  assessmentsState: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: "auto",
    borderRadius: 15,
    borderWidth: 1,
  },
  textState: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  stateIcon: {
    width: 50,
    height: 40,
    borderRadius: 10,
  },
  stateNumber: {
    width: 50,
    height: 40,
    borderRadius: 10,
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
