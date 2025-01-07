// GM.tsx
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

type AssessmentRouteProp = RouteProp<
  { assessment: { child: Child } },
  "assessment"
>;

interface AssessmentDetails {
  assessment_id: number;
  age_range: string;
  assessment_name: string;
  assessment_image?: string;
  assessment_device_name: string;
  assessment_device_image?: string;
  assessment_device_detail: string;
  assessment_method: string;
  assessment_sucession: string;
}

export const GM: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<AssessmentRouteProp>();
  const { child } = route.params;

  const [assessmentDetails, setAssessmentDetails] =
    useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAssessmentDetail = async () => {
        setLoading(true);
        setError(null);
        try {
          const user_id = await AsyncStorage.getItem("userId");
          // console.log("user_id: ", user_id);
          // console.log("child_id: ", child.child_id);

          const response = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/assessment/assessments-get-details/${child.child_id}/GM/${user_id}`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setAssessmentDetails(data);
          } else {
            setError(
              "Failed to fetch assessment data. Please try again later."
            );
            console.error("Failed to fetch assessment data:", response.status);
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

  const calculateAgeRange = (minMonths: number, maxMonths: number): string => {
    const formatAge = (months: number) => {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} ปี ${remainingMonths} เดือน`;
    };

    return `${formatAge(minMonths)} - ${formatAge(maxMonths)}`;
  };

  const whenGotoHome = () => {
    navigation.navigate("mainPR");
  };

  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

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
        {/* assessment header */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Gross Motor (GM)</Text>
          <Text style={styles.headerAgeContainer}>
            อายุพัฒนาการ:{" "}
            {/* {assessmentDetails ? calculateAgeRange(16, 17) : "กำลังโหลด..."} */}
          </Text>
        </View>
        {/* assessment rank */}
        {assessmentDetails && (
          <>
            <View style={styles.assessmentTop}>
              <View style={styles.assessmentNumberContainer}>
                {/* <Text style={styles.assessmentNumber}>
              {assessmentDetails.assessment_id}
            </Text> */}
                <Text style={styles.assessmentNumber}>70</Text>
              </View>
              {/* <Text style={styles.assessmentTitle}>
                {assessmentDetails.assessment_name}
              </Text> */}
              <View style={styles.assessmentTitleContainer}>
                <Text style={styles.assessmentTitle}>
                  กระโดดข้ามเชือกบนพื้นไปข้างหน้า
                </Text>
              </View>
            </View>

            {/* assessment logo */}
            <Image
              // source={ uri: assessmentDetails.assessment_image }
              source={require("../../assets/assessment/GM/GM-70.png")}
              style={styles.assessmentLogo}
            />

            {/* assessment device */}
            <View style={styles.assessmentDevice}>
              <Text style={styles.deviceText}>อุปกรณ์: เชือก</Text>
              <Image
                // source={ uri: assessmentDetails.assessment_device_image }
                source={require("../../assets/assessment/GM/device/GM-DV-70.png")}
                style={styles.deviceIcon}
              />
              {/* <Text style={styles.deviceDetail}>
                {assessmentDetails.assessment_device_detail}
              </Text> */}
              <Text style={styles.deviceDetail}>
                ริบบิ้น เชือกฟาง ไม้หรือชอล์ก ขีดเส้นตรงบนพื้น
              </Text>
            </View>

            {/* assessment how to */}
            <View style={styles.assessmentHowto}>
              <Text style={styles.headerHowto}>วิธีการประเมิน</Text>
              {/* <Text style={styles.howtoText}>
                {assessmentDetails.assessment_method}
              </Text> */}
              <Text style={styles.howtoText}>
                จัดให้เด็กอยู่ในท่านอนคว่ำบนเบาะนอนแขนทั้งสองข้างอยู่หน้าไหล่
                สังเกตเด็ก ยกศีรษะ
              </Text>
            </View>
          </>
        )}
      </View>
      {/* assessment result */}
      <View style={styles.assessmentResult}>
        <Text style={styles.headerResult}>ผลการประเมิน</Text>
        {/* <Text style={styles.howtoText}>
                {assessmentDetails.assessment_sucession}
              </Text> */}
        <Text style={styles.resultText}>
          เด็กสามารถกระโดดข้ามเชือกได้โดยเท้าลงพื้นพร้อมกัน
        </Text>
        <View style={styles.resultButtonCantainer}>
          <Pressable style={styles.yesButton}>
            <Text>ได้</Text>
          </Pressable>
          <Pressable style={styles.noButton}>
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    //justifyContent: "center",
    alignItems: "center",
  },

  // -----------------------------------------------------------------------------

  topSection: {
    //flex: 1,
    width: "100%",
    height: "auto",
    alignItems: "center",
    marginTop: 48,
    paddingTop: 10,
    //borderWidth: 1,
  },
  midSection: {
    //flex: 1,
    width: 350,
    minHeight: "auto",
    marginTop: 10,
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
    borderWidth: 2,
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

  // -----------------------------------------------------------------------------

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
    marginTop: 32,
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

  // -----------------------------------------------------------------------------

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

  // -----------------------------------------------------------------------------

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
    marginLeft: 20,
    marginRight: 30,
    textAlign: "center",
  },

  // -----------------------------------------------------------------------------

  assessmentLogo: {
    width: 80,
    height: 90,
  },

  // -----------------------------------------------------------------------------

  assessmentDevice: {
    width: "90%",
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  deviceText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  deviceIcon: {
    width: 45,
    height: 45,
  },
  deviceDetail: {
    fontSize: 12,
    color: "#555",
  },

  // -----------------------------------------------------------------------------

  assessmentHowto: {
    width: "90%",
    paddingBottom: 10,
    paddingHorizontal: 23,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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

  // -----------------------------------------------------------------------------

  assessmentResult: {
    width: "90%",
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  resultText: {
    fontSize: 13,
    textAlign: "center",
  },
  resultButtonCantainer: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-around",
    //marginHorizontal: 20,
    marginTop: 5,
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

  // -----------------------------------------------------------------------------

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
  // -----------------------------------------------------------------------------
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
