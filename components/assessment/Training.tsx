// Training.tsx
import React, { FC, useState } from "react";
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
import { AssessmentDetails } from "../assessment/GM";

type ChildRouteProp = RouteProp<{ assessment: { child: Child } }, "assessment">;

type AssessmentDetailsRouteProp = RouteProp<
  { assessment: { assessmentDetails: LocalAssessmentDetails } },
  "assessment"
>;

export interface LocalAssessmentDetails {
  assessment_details_id: number;
  age_range: string;
  assessment_name: string;
  assessment_image?: string;
  assessment_device_name: string | null;
  assessment_device_image?: string;
  assessment_device_detail: string | null;
  assessment_method: string;
  assessment_sucession: string;
  training_method: string;
  training_device_name: string;
  training__device_image?: string;
}

// export interface TrainingDetails {
//   training_method: string;
//   training_device_name: string;
//   training__device_image?: string;
// }

export const Training: FC = () => {
  // route
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<ChildRouteProp>();
  const { child } = route.params;
  const route2 = useRoute<AssessmentDetailsRouteProp>();
  const { assessmentDetails: assessmentDetailsFromRoute } = route2.params;

  // ฟังก์ชันเพื่อแปลงอายุจากสตริงเป็นจำนวนเดือน
  const convertAgeToMonths = (age: string): number => {
    const [years, months] = age.split(" ปี ").map((part) => parseInt(part, 10));
    return years * 12 + months;
  };

  // useState
  // const [assessmentDetails, setAssessmentDetails] =
  //   useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect

  // const childAgeInMonths = convertAgeToMonths(child.age?.toString() || "");

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const fetchAssessmentDetail = async () => {
  //       setLoading(true);
  //       setError(null);

  //       try {
  //         const user_id = await AsyncStorage.getItem("userId");
  //         console.log(
  //           "Fetching data for child_id:",
  //           child.child_id,
  //           "user_id:",
  //           user_id
  //         );

  //         const response = await fetch(
  //           `https://senior-test-deploy-production-1362.up.railway.app/api/assessment/assessments-get-details/${child.child_id}/GM/${user_id}/${childAgeInMonths}`,
  //           { method: "GET" }
  //         );

  //         if (response.ok) {
  //           const data = await response.json();
  //           console.log("Fetched data:", data);

  //           // ตั้งค่า assessmentDetails เป็นข้อมูลภายใน details
  //           setAssessmentDetails(data.data.details);
  //           console.log("AssessmentDetails after set:", data.data.details);
  //         } else {
  //           setError(
  //             `Failed to fetch assessment data. Status: ${response.status}`
  //           );
  //         }
  //       } catch (error) {
  //         setError(
  //           "Error fetching assessment data. Please check your connection."
  //         );
  //         console.error("Error fetching assessment data:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchAssessmentDetail();
  //   }, [child.child_id])
  // );

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
  const whenGotoHome = () => {
    navigation.navigate("mainPR");
  };

  // navigate goBack
  const whenGoBack = () => {
    navigation.goBack();
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // renderAssessmentDevice
  const renderAssessmentDevice = () => {
    if (!assessmentDetailsFromRoute) {
      console.log("assessmentDetailsFromRoute is null or undefined");
      return null; // ตรวจสอบว่า assessmentDetailsFromRoute ไม่มีค่า null
    }

    console.log("assessmentDetailsFromRoute:", assessmentDetailsFromRoute);

    if (
      assessmentDetailsFromRoute.training_method === "none" &&
      assessmentDetailsFromRoute.training_device_name === "none" &&
      assessmentDetailsFromRoute.training__device_image === "none"
    ) {
      return null; // ไม่แสดง renderAssessmentDevice
    }

    return (
      <View style={styles.assessmentDevice}>
        {/* {assessmentDetailsFromRoute.training__device_image !== "none" && (
          <Image
            source={getImageSource(
              assessmentDetailsFromRoute.training__device_image ?? ""
            )}
            style={styles.deviceIcon}
          />
        )} */}
        {assessmentDetailsFromRoute.training_device_name !== "none" && (
          <View>
            <Text style={styles.deviceText}>อุปกรณ์ที่ใช้: </Text>
            <Text style={styles.deviceDetail}>
              {assessmentDetailsFromRoute.training_device_name}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //imageMap

  interface ImageMap {
    [key: string]: any;
  }

  const imageMap: ImageMap = {
    "GM/gm-1": require("../../assets/assessment/GM/gm-3.png"),
    "GM/gm-dv-1": require("../../assets/assessment/GM/devices/gm-dv-1.png"),
    "GM/gm-tr-1": require("../../assets/assessment/GM/trainings/gm-tr-2.png"),
    "GM/gm-2": require("../../assets/assessment/GM/gm-4.png"),
    "GM/gm-dv-2": require("../../assets/assessment/GM/devices/gm-dv-2.png"),
    "GM/gm-tr-2": require("../../assets/assessment/GM/trainings/gm-tr-2.png"),
  };

  const getImageSource = (imagePath: string): any => {
    return (
      imageMap[imagePath] || require("../../assets/icons/trainingIcon.png")
    );
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
              <Text style={styles.profileName}>{child.nickName}</Text>
            </View>
            <View style={styles.detailsAge}>
              <Text style={styles.profileAge}>{child.age}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mid Section */}
      <View style={styles.midSection}>
        {/* assessment header */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Gross Motor (GM)</Text>
          <Text style={styles.headerAgeContainer}>
            อายุพัฒนาการ:{" "}
            {assessmentDetailsFromRoute?.age_range
              ? calculateAgeRange(
                  ...(assessmentDetailsFromRoute.age_range
                    .split("-")
                    .map(Number) as [number, number])
                )
              : "ข้อมูลไม่สมบูรณ์"}
          </Text>
        </View>
        {/* assessment rank */}
        {assessmentDetailsFromRoute && (
          <>
            <View style={styles.assessmentTop}>
              <View style={styles.assessmentNumberContainer}>
                <Text style={styles.assessmentNumber}>
                  {assessmentDetailsFromRoute?.assessment_details_id}
                </Text>
              </View>

              <View style={styles.assessmentTitleContainer}>
                <Text style={styles.assessmentTitle}>
                  {assessmentDetailsFromRoute.assessment_name}
                </Text>
              </View>
            </View>
            {/* assessment logo */}
            {assessmentDetailsFromRoute?.assessment_image && (
              <Image
                source={getImageSource(
                  assessmentDetailsFromRoute.assessment_image
                )}
                style={styles.assessmentLogo}
              />
            )}

            {/* assessment device */}
            {assessmentDetailsFromRoute &&
              (assessmentDetailsFromRoute.training_method !== "none" ||
                assessmentDetailsFromRoute.training__device_image !== "none" ||
                assessmentDetailsFromRoute.training_device_name !== "none") &&
              renderAssessmentDevice()}

            {/* assessment how to */}
            <View style={styles.assessmentHowto}>
              <Text style={styles.headerHowto}>วิธีฝึกทักษะ</Text>
              <Text style={styles.howtoText}>
                {assessmentDetailsFromRoute.training_method}
              </Text>
            </View>
            {/* assessment result */}
            <View style={styles.assessmentResult}>
              <Text style={styles.resultText}>
                ให้ทำการฝึกตามวิธีทักษะข้างต้น และทำแบบประเมินใหม่อีกครั้ง ภายใน
                1-2 สัปดาห์
              </Text>

              <View style={styles.resultButtonCantainer}>
                <Pressable
                  style={styles.tryAgainButton}
                  onPress={() => {
                    whenGoBack();
                  }}
                >
                  <Image
                    source={require("../../assets/icons/tryAgain.png")}
                    style={styles.tryAgainIcon}
                  />
                  <Text style={styles.tryAgainText}>ประเมินใหม่อีกครั้ง</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.sucessButton} onPress={whenGotoHome}>
            <Text style={styles.sucessText}>เสร็จสิ้น</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    //justifyContent: "center",
    alignItems: "center",
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  topSection: {
    //flex: 1,
    width: "100%",
    height: 150,
    alignItems: "center",
    paddingTop: 55,
    // borderWidth: 1,
  },
  midSection: {
    //flex: 1,
    width: 350,
    minHeight: "auto",
    marginTop: 5,
    paddingBottom: 5,
    //paddingVertical: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    backgroundColor: "#fff",
    // justifyContent: "center",
    alignItems: "center",
    // borderWidth: 2,
  },
  bottomSection: {
    flexDirection: "row",
    width: "100%",
    height: 85,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 12,
    // borderWidth: 1,
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
    // height: 40,
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
    marginRight: 10,
    textAlign: "center",
    // borderWidth: 2,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentLogo: {
    width: 90,
    height: 90,
    resizeMode: "cover",
    // borderWidth: 1,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentDevice: {
    width: "90%",
    paddingVertical: 10,
    marginBottom: 5,
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
    textAlign: "center",
    // borderWidth: 1,
  },
  deviceIcon: {
    width: 70,
    height: 70,
    // borderWidth: 1,
  },
  deviceDetail: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
    paddingHorizontal: 10,
    // borderWidth: 1,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  assessmentHowto: {
    width: "90%",
    height: 150,
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1, // line
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
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1, // line
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
    marginVertical: 5,
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
  tryAgainButton: {
    backgroundColor: "#DAF0C8",
    padding: 10,
    borderRadius: 30,
    width: "auto",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  tryAgainText: {
    fontSize: 13,
    marginLeft: 5,
  },
  tryAgainIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  buttonContainer: {
    flexDirection: "row",
    width: "90%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center", // Center the button horizontally
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
