// PS.tsx
import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Child } from "../page/HomePR";

type GMRouteProp = RouteProp<{ assessment: { child: Child } }, "assessment">;

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

export interface AssessmentInsert {
  assessment_id: number;
}

export interface UserId {
  user_id: number;
}

export const PS: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<GMRouteProp>();
  const { child } = route.params;

  // ฟังก์ชันเพื่อแปลงอายุจากสตริงเป็นจำนวนเดือน
  const convertAgeToMonths = (age: string): number => {
    const [years, months] = age.split(" ปี ").map((part) => parseInt(part, 10));
    return years * 12 + months;
  };

  // useState
  const [userId, setUserId] = useState<UserId | null>(null);
  const [assessmentDetails, setAssessmentDetails] =
    useState<AssessmentDetails | null>(null);
  const [assessmentInsert, setAssessmentInsert] =
    useState<AssessmentInsert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect

  // console.log("child:", child.age);

  const childAgeInMonths = convertAgeToMonths(child.age?.toString() || "");

  // console.log("childAgeInMonths:", childAgeInMonths);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAssessmentDetail = async () => {
        setLoading(true);
        setError(null);

        try {
          const user_id = await AsyncStorage.getItem("userId");
          console.log(
            "Fetching data for child_id:",
            child.child_id,
            "user_id:",
            user_id
          );

          const response = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/assessments/assessments-get-details/${child.child_id}/PS/${user_id}/${childAgeInMonths}`,
            { method: "GET" }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Fetched data:", data);

            setUserId({ user_id: parseInt(user_id || "0", 10) });
            setAssessmentDetails(data.data.details);
            // console.log("AssessmentDetails after set:", data.data.details);
            setAssessmentInsert({
              assessment_id: data.data.assessment_id,
            });
            // console.log("AssessmentInsert after set:", data.data.assessment_id);
          } else {
            setError(
              `Failed to fetch assessment data. Status: ${response.status}`
            );
          }
        } catch (error) {
          setError(
            "Error fetching assessment data. Please check your connection."
          );
          console.error("Error fetching assessment data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAssessmentDetail();
    }, [child.child_id])
  );

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // ตรวจสอบค่า assessmentInsert.assessment_id
  useEffect(() => {
    if (assessmentInsert) {
      console.log("Current assessment_id:", assessmentInsert.assessment_id);
    } else {
      console.log("assessmentInsert is null or undefined");
    }
  }, [assessmentInsert]);

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // calculateAgeRange

  const calculateAgeRange = (minMonths: number, maxMonths: number): string => {
    const formatAge = (months: number) => {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} ปี ${remainingMonths} เดือน`;
    };

    return `${formatAge(minMonths)} - ${formatAge(maxMonths)}`;
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // navigate

  const whenGotoTraining = (assessmentDetails: AssessmentDetails) => {
    navigation.navigate("training", { child, assessmentDetails });
  };

  const whenGotoHome = () => {
    navigation.navigate("mainPR");
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // renderAssessmentDevice
  const renderAssessmentDevice = () => {
    if (!assessmentDetails) {
      console.log("assessmentDetails is null or undefined");
      return null; // ตรวจสอบว่า assessmentDetails ไม่มีค่า null
    }

    // console.log("assessmentDetails:", assessmentDetails);

    if (
      assessmentDetails.assessment_device_name === "none" &&
      assessmentDetails.assessment_device_image === "none" &&
      assessmentDetails.assessment_device_detail === "none"
    ) {
      return null; // ไม่แสดง renderAssessmentDevice
    }

    return (
      <View style={styles.assessmentDevice}>
        {assessmentDetails.assessment_device_name !== "none" && (
          <Text style={styles.deviceText}>
            อุปกรณ์: {assessmentDetails.assessment_device_name}
          </Text>
        )}
        {assessmentDetails.assessment_device_image !== "none" && (
          <Image
            source={getImageSource(
              assessmentDetails.assessment_device_image ?? ""
            )}
            style={styles.deviceIcon}
          />
        )}
        {assessmentDetails.assessment_device_detail !== "none" && (
          <Text style={styles.deviceDetail}>
            {assessmentDetails.assessment_device_detail}
          </Text>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // imageMap

  interface ImageMap {
    [key: string]: any;
  }

  const imageMap: ImageMap = {
    "GM/gm-1": require("../../assets/assessment/GM/gm-3.png"),
    "GM/gm-dv-1": require("../../assets/assessment/GM/devices/gm-dv-1.png"),
    "GM/gm-2": require("../../assets/assessment/GM/gm-4.png"),
    "GM/gm-dv-2": require("../../assets/assessment/GM/devices/gm-dv-2.png"),
    "GM/gm-tr-2": require("../../assets/assessment/GM/trainings/gm-tr-2.png"),
  };

  const getImageSource = (imagePath: string): any => {
    return imageMap[imagePath] || require("../../assets/icons/banana.png");
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api fetch next assessment

  const fetchNextAssessment = async (
    child_id: number,
    aspect: string,
    assessment_id: number,
    user_id: number
  ) => {
    try {
      const response = await fetch(
        `https://senior-test-deploy-production-1362.up.railway.app/api/assessments/assessments-next/${child_id}/${aspect}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assessment_id, user_id }), // ส่ง assessment_id ใน body ของ request
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched next assessment:", data);

        // Update state with the fetched data
        setUserId({ user_id: data.next_assessment.user_id });
        setAssessmentDetails(data.next_assessment.details);
        setAssessmentInsert({
          assessment_id: data.next_assessment.assessment_id,
        });

        return data;
      } else {
        console.error("Failed to fetch next assessment:", response.status);
      }
    } catch (error) {
      console.error("Error fetching next assessment:", error);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // return

  return (
    <ImageBackground
      source={require("../../assets/background/bg2.png")}
      style={styles.background}
    >
      {/* Top Section */}
      <View style={styles.topSection}>
        <View
          key={child.child_id}
          style={
            child.gender === "male"
              ? styles.profileCardBoy
              : styles.profileCardGirl
          }
        >
          <Image source={{ uri: child.childPic }} style={styles.profileIcon} />
          <View style={styles.profileInfo}>
            <View style={styles.detailsName}>
              <Text style={styles.profileName}>{child.childName}</Text>
            </View>
            <View style={styles.detailsAge}>
              <Text style={styles.profileAge}>{child.age}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mid Section */}
      <View style={styles.midSection}>
        {loading ? (
          <Text>กำลังโหลด...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {/* assessment header */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>Receptive Language (RL)</Text>
              <Text style={styles.headerAgeContainer}>
                อายุพัฒนาการ:{" "}
                {assessmentDetails?.age_range
                  ? calculateAgeRange(
                      ...(assessmentDetails.age_range
                        .split("-")
                        .map(Number) as [number, number])
                    )
                  : "ข้อมูลไม่สมบูรณ์"}
              </Text>
            </View>

            {/* assessment rank */}
            <View style={styles.assessmentTop}>
              <View style={styles.assessmentNumberContainer}>
                <Text style={styles.assessmentNumber}>
                  {assessmentDetails?.assessment_details_id}
                </Text>
              </View>
              <Text style={styles.assessmentTitle}>
                {assessmentDetails?.assessment_name ?? "ไม่มีข้อมูล"}
              </Text>
            </View>

            {assessmentDetails?.assessment_image && (
              <Image
                source={getImageSource(assessmentDetails.assessment_image)}
                style={styles.assessmentLogo}
              />
            )}

            {/* assessment device */}
            {assessmentDetails &&
              (assessmentDetails.assessment_device_name !== "none" ||
                assessmentDetails.assessment_device_image !== "none" ||
                assessmentDetails.assessment_device_detail !== "none") &&
              renderAssessmentDevice()}

            {/* assessment how to */}
            <View style={styles.assessmentHowto}>
              <Text style={styles.headerHowto}>วิธีการประเมิน</Text>
              <Text style={styles.howtoText}>
                {assessmentDetails?.assessment_method ?? "ไม่มีข้อมูล"}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* assessment result */}
      <View style={styles.assessmentResult}>
        <View style={styles.headerResultContainer}>
          <Text style={styles.headerResult}>ผลการประเมิน</Text>
        </View>
        <Text style={styles.resultText}>
          {assessmentDetails?.assessment_succession ?? "ไม่มีข้อมูล"}
        </Text>

        <View style={styles.resultButtonCantainer}>
          <Pressable
            style={styles.yesButton}
            onPress={() => {
              if (assessmentInsert) {
                console.log(
                  "Calling fetchNextAssessment with assessmentInsert_id:",
                  assessmentInsert.assessment_id
                );
                fetchNextAssessment(
                  child.child_id,
                  "PS",
                  assessmentInsert.assessment_id,
                  userId?.user_id ?? 0
                );
              } else {
                console.log("assessmentInsert is null or undefined");
              }
            }}
          >
            <Text>ได้</Text>
          </Pressable>
          <Pressable
            style={styles.noButton}
            onPress={() =>
              assessmentDetails && whenGotoTraining(assessmentDetails)
            }
          >
            <Text>ไม่ได้</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.backIcon}
            />
          </Pressable>
          <Pressable style={styles.sucessButton} onPress={whenGotoHome}>
            <Text style={styles.sucessText}>เสร็จสิ้น</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    //justifyContent: "center",
    alignItems: "center",
  },

  topSection: {
    //flex: 1,
    width: "100%",
    height: 150,
    alignItems: "center",
    paddingTop: 55,
  },
  midSection: {
    //flex: 1,
    width: 350,
    height: "auto",
    marginTop: 0,
    paddingBottom: 5,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    backgroundColor: "#fff",
    // justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Add this line to prevent overflow
    // borderWidth: 2,
  },
  bottomSection: {
    flexDirection: "row",
    width: "100%",
    height: 85,
    // paddingVertical: 10,
    //paddingBottom: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  profileCardGirl: {
    flexDirection: "row",
    width: 350,
    height: "auto",
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  profileCardBoy: {
    flexDirection: "row",
    width: 350,
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  profileIcon: {
    width: 70,
    height: 70,
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
    marginTop: 5,
    backgroundColor: "#FFA2C4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 4,
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
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsAge: {
    width: "85%",
    marginLeft: 10,
    marginTop: 4,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
  },
  detailsText: {
    fontSize: 12,
    color: "#FFF",
    padding: 2,
  },
  backIcon: {
    width: 35,
    height: 35,
  },
  childDev: {
    flexDirection: "row",
    width: "90%",
    paddingVertical: 15,
    marginVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  childDevIcon: {
    width: 45,
    height: 45,
    right: 15,
  },
  childDevtext: {
    fontSize: 18,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  headerTextContainer: {
    width: "100%",
    height: 70,
    borderRadius: 30,
    backgroundColor: "#5F5F5F",
    alignItems: "center", // แกน x
    // justifyContent: "center", // แกน y
    marginBottom: 10,
    // borderWidth: 2,
  },
  headerText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    top: 6,
  },

  headerAgeContainer: {
    // fontSize: 12,
    width: "auto",
    // height: 30,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 15,
    padding: 4,
    marginVertical: 10, // ระยะห่างข้างล่าง
    textAlign: "center",
    // borderWidth: 2,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DFF2EA",
    borderRadius: 25,
    marginBottom: 10,
    width: "90%",
    height: 50,
  },
  assessmentNumberContainer: {
    backgroundColor: "#8DD9BD",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    width: 60,
    height: "100%",
  },
  assessmentNumber: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "bold",
  },
  assessmentTitleContainer: {
    flexDirection: "row",
    width: "70%",
    alignItems: "center",
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 60,
    textAlign: "center",
    // borderWidth: 2,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentLogo: {
    width: 80,
    height: 80,
    resizeMode: "cover",
    // borderWidth: 1,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentDevice: {
    width: "90%",
    // paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  deviceText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  deviceIcon: {
    width: 70,
    height: 70,
    // borderWidth: 1,
  },
  deviceDetail: {
    fontSize: 12,
    color: "#555",
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentHowto: {
    width: "90%",
    height: "auto",
    // paddingBottom: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  headerHowto: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    //borderWidth: 2,
  },
  howtoText: {
    fontSize: 13,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  headerResultContainer: {
    width: "100%",
    height: 40,
    borderRadius: 30,
    backgroundColor: "#5F5F5F",
    justifyContent: "center",
  },
  assessmentResult: {
    width: "90%",
    marginVertical: 10,
    borderRadius: 30,
    backgroundColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    alignItems: "center",
  },
  headerResult: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  resultText: {
    fontSize: 13,
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  resultButtonCantainer: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-around",
    //marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    //borderWidth: 2,
  },
  yesButton: {
    backgroundColor: "#DAF0C8",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },
  noButton: {
    backgroundColor: "#FFC1C1",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  buttonContainer: {
    flexDirection: "row",
    width: "90%",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    //borderWidth: 2,
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "35%",
    height: "60%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  sucessButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "60%",
    height: "60%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  sucessText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  errorText: {
    color: "red",
    fontSize: 16,
  },
});
