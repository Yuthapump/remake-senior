import React, { FC, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Pressable,
} from "react-native";
import { usePushNotifications } from "../../app/usePushNotifications"; // hook สำหรับ push notification
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

interface Notification {
  notification_id: number;
  // user_id: number;
  message: string;
  supervisor_id?: number;
  child_id?: number;
  status?: "unread" | "read";
  created_at?: string; // อนุญาตให้เป็น optional ถ้า API ไม่ส่งมา
  template_id?: number;
}

export const Notificate: FC = () => {
  const { notification } = usePushNotifications(); // รับการแจ้งเตือนจาก push notification
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ดึงข้อมูลการแจ้งเตือนจาก API
  useFocusEffect(
    useCallback(() => {
      const fetchNotifications = async () => {
        try {
          const user_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!user_id) {
            console.error("User ID is missing.");
            return;
          }

          const response = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/notifications/get-all-notificate?user_id=${user_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Error fetching notifications");
          }

          const data = await response.json();
          setNotifications(data.notifications);
          console.log("setNotifications: ", data.notifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      fetchNotifications();

      if (notification) {
        const newNotification: Notification = {
          notification_id:
            notification.request.content.data?.notification_id ?? Date.now(),
          // user_id: notification.data.user_id ?? 0, // ถ้ามี
          message: notification.request.content.body ?? "",
          supervisor_id: undefined, // ถ้าไม่มีค่าให้เป็น undefined
          child_id: undefined,
          status: "unread",
          created_at: new Date().toISOString(), // ใช้ค่า timestamp ปัจจุบัน
        };

        setNotifications((prevNotifications) => {
          const updatedNotifications = [newNotification, ...prevNotifications];

          if (updatedNotifications.length > 20) {
            updatedNotifications.pop(); // จำกัดรายการล่าสุด
          }

          return updatedNotifications;
        });
      }
    }, [notification])
  );

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api approveAccessRequest

  const handleApprove = async (child_id: number, supervisor_id: number) => {
    console.log("child_id: ", child_id);
    console.log("supervisor_id: ", supervisor_id);

    try {
      const parent_id = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      const response = await fetch(
        "https://senior-test-deploy-production-1362.up.railway.app/api/notifications/appprove-access-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ child_id, supervisor_id, parent_id }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Approval failed.");
      console.log("Approval successful:", data.message);
    } catch (error) {
      console.error("Error approving access request:", error);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api markAsRead
  const markAsRead = async (notification_id: number) => {
    try {
      const response = await fetch(
        "https://your-api-url.com/api/notifications/mark-notification-read",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notification_id }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("🔵 อัปเดตสถานะแจ้งเตือนเป็น 'read' แล้ว:", data);
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.notification_id === notification_id
              ? { ...notif, status: "read" }
              : notif
          )
        );
      } else {
        console.error("🔴 ไม่สามารถอัปเดตแจ้งเตือนได้:", data.message);
      }
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // render Teamplate Notificate
  const renderNotificate = () => {
    return (
      <ScrollView style={styles.ScrollView}>
        {notifications.map((notif, index) => {
          switch (notif.template_id) {
            case 1:
              return (
                <Pressable
                  key={index}
                  style={[
                    styles.notificationBox,
                    notif.status === "read"
                      ? styles.readNotification
                      : styles.unreadNotification,
                  ]}
                  onPress={() => markAsRead(notif.notification_id)}
                >
                  <Text style={styles.date}>
                    {notif.created_at
                      ? new Intl.DateTimeFormat("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(notif.created_at))
                      : "ไม่ทราบวันที่"}
                  </Text>
                  <View style={styles.notificationTopBox}>
                    <View style={styles.iconContainer}>
                      <Image
                        source={require("../../assets/icons/notification.png")}
                        style={styles.icon}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.message}>{notif.message}</Text>
                    </View>
                  </View>
                  <View style={styles.resultButtonCantainer}>
                    <Pressable
                      style={styles.yesButton}
                      onPress={() => {
                        if (
                          notif.child_id !== undefined &&
                          notif.supervisor_id !== undefined
                        ) {
                          handleApprove(notif.child_id, notif.supervisor_id);
                        } else {
                          console.error("child_id or supervisor_id is missing");
                        }
                      }}
                    >
                      <Text>ยินยอม</Text>
                    </Pressable>
                    <Pressable style={styles.noButton}>
                      <Text>ปฎิเสธ</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );

            case 2:
              return (
                <View key={index} style={styles.notificationBox}>
                  <Text style={styles.date}>
                    {notif.created_at
                      ? new Intl.DateTimeFormat("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(notif.created_at))
                      : "ไม่ทราบวันที่"}
                  </Text>
                  <View style={styles.notificationTopBox}>
                    <View style={styles.iconContainer}>
                      <Image
                        source={require("../../assets/icons/notification.png")}
                        style={styles.icon}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.message}>{notif.message}</Text>
                    </View>
                  </View>
                </View>
              );

            default:
              return (
                <View key={index} style={styles.notificationBox}>
                  <Text>ไม่มีการแจ้งเตือน</Text>
                </View>
              );
          }
        })}
      </ScrollView>
    );
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  return (
    <ImageBackground
      source={require("../../assets/background/bg1.png")}
      style={styles.background}
    >
      <Text style={styles.header}>การแจ้งเตือน</Text>
      {/* <ScrollView style={styles.ScrollView}> */}
      <View style={styles.container}>{renderNotificate()}</View>
      {/* </ScrollView> */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    // justifyContent: "center",
    alignItems: "center",
  },
  ScrollView: {
    width: "100%",
    marginBottom: "25%",
    borderRadius: 30,
    borderWidth: 2,
  },
  container: {
    flex: 1,
    width: "100%",
    padding: 10,
    // paddingTop: "15%",
    alignItems: "center",
    // borderWidth: 2,
  },
  notificationTopBox: {
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    // marginBottom: 10,
    borderColor: "#333333",
    width: "100%",
    height: "45%",
    // borderWidth: 1,
  },
  notificationBox: {
    // flexDirection: "row",
    // alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    // padding: 13,
    marginBottom: 10,
    borderColor: "#333333",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "100%",
    height: "22%",
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    width: 45,
    height: 45,
  },
  textContainer: {
    flex: 1,
    // marginTop: 10,
  },
  message: {
    fontSize: 16,
    color: "#333333",
  },
  name: {
    fontWeight: "bold",
    color: "#6495ED",
  },
  date: {
    fontSize: 12,
    color: "#999999",
    textAlign: "right",
    margin: 5,
    // paddingTop: 2,
  },
  header: {
    fontSize: 24,
    color: "#333333",
    fontWeight: "bold",
    marginTop: "16%",
    // marginBottom: 20,
  },

  resultButtonCantainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginVertical: 5,
    paddingHorizontal: "15%",
    // borderWidth: 2,
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

  // markAsRead or Unread
  unreadNotification: {
    backgroundColor: "#FFEBEE", // สีแดงอ่อนสำหรับแจ้งเตือนที่ยังไม่อ่าน
    borderColor: "#D32F2F",
  },
  readNotification: {
    backgroundColor: "#E0F7FA", // สีฟ้าอ่อนสำหรับแจ้งเตือนที่อ่านแล้ว
    borderColor: "#00ACC1",
  },
});
