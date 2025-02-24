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
import { LoadingScreenBaby } from "../LoadingScreen";

// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  Child,
  calculateAge,
  AssessmentDetails,
} from "../../components/page/HomePR";
import { LinearGradient } from "expo-linear-gradient";

export const ChooseChild: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [children, setChildren] = useState<Child[]>([]); // กำหนดประเภทเป็น array ของ Child
  const [assessmentDetails, setAssessmentDetails] = useState<
    AssessmentDetails[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

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

              setTimeout(() => {
                setChildren(updatedChildren);
                setLoading(false);
              }, 100); // set delay

              const allAssessments = jsonResponse.children.map(
                (child: any) => child.assessments || []
              );
              setAssessmentDetails(allAssessments.flat());
              console.log("Assessments fetched:", allAssessments);
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
    }, [])
  );

  // === ( LoadingScreen ) ===
  if (loading) {
    return <LoadingScreenBaby />;
  }

  const whenGotoAddChild = () => {
    navigation.navigate("addchild");
  };

  const whenGotoDetail = (id: number) => {
    navigation.navigate("detail", { id });
  };

  const whenGotoAssessment = (child: Child) => {
    navigation.navigate("assessment", { child });
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
      <Text style={styles.header}>เลือกเด็กที่ต้องการประเมิน</Text>
      {/* Profile Card Section */}
      <View style={styles.midSection}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
              <LinearGradient
                key={child.child_id}
                colors={
                  child.gender === "male"
                    ?["#fff", "#E7F6FF","#D6ECFD"]  // ไล่สีฟ้าสำหรับเด็กผู้ชาย
                    :["#fff", "#FFDEE4","#FFBED6"]  // ไล่สีชมพูสำหรับเด็กผู้หญิง
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={child.gender === "male" ? styles.profileCardBoy : styles.profileCardGirl}
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
                    <Text style={styles.profileName}>{child.nickName}</Text>
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
              </LinearGradient>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.Icon}
            />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  Container: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    //borderWidth: 2,
  },
  ScrollView: {
    width: "100%",
    
    borderRadius: 30,
  },
  midSection: {
    height: "70%",
    //borderWidth: 2,
  },
  bottomSection: {
    width: "auto",
    height: "15%",
    paddingTop: 30,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 80,
    marginBottom: 20,
  },
  profileCardGirl: {
    marginHorizontal:5,
    marginTop:5,
    marginBottom:10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 5
  },
  profileCardBoy: {
    marginHorizontal:5,
    marginTop:5,
    marginBottom:10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 5,
    width: 330,
    
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
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profileAge: {
    fontSize: 14,
    color: "#555",
  },
  detailsName: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsAge: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 9,
    alignItems: "center",
  },
  detailsText: {
    fontSize: 12,
    color: "#FFF",
    padding: 2,
    marginVertical: 2,
  },
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#98D4FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#76c6ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
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
    shadowColor: "#ff7aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: "row",

    paddingHorizontal: 20,
    width: "70%",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "60%",
    alignItems: "center",
  },
  Icon: {
    width: 30,
    height: 30,
  },

  // ----------------------------------------------------------------------------------
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
