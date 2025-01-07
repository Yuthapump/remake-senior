import { FC } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";

export const HomeSP: FC = () => {
  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.card}>
          <Image
            source={require("../../assets/image/chicken.png")}
            style={styles.icon}
          />
          <Text style={styles.cardText}>อนุบาล ก.ไก่</Text>
          <Text style={styles.countText}>20 คน</Text>
        </View>
        <View style={styles.card}>
          <Image
            source={require("../../assets/image/grape.jpg")}
            style={styles.icon}
          />
          <Text style={styles.cardText}>อนุบาล อ.องุ่น</Text>
          <Text style={styles.countText}>20 คน</Text>
        </View>
        <View style={styles.card}>
          <Image
            source={require("../../assets/image/banana.png")}
            style={styles.icon}
          />
          <Text style={styles.cardText}>อนุบาล ค.คน</Text>
          <Text style={styles.countText}>20 คน</Text>
        </View>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Pressable style={styles.evaluateButton}>
          <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
        </Pressable>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.graphContainer}>
          <Image
            source={require("../../assets/image/bar_chart.png")}
            style={styles.graphImage}
          />
        </View>
        <View style={styles.pieChartContainer}>
          <Image
            source={require("../../assets/image/pie_chart.png")}
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
    padding: 16,
    paddingTop: 50,
    //marginTop: 45, //กรอบสีขาว
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#FFEFD5",
    padding: 10,
    borderRadius: 10,
    width: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  countText: {
    fontSize: 12,
    color: "#555",
  },
  middleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  evaluateButton: {
    backgroundColor: "#E0FFFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  evaluateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "space-around",
  },
  graphContainer: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  graphImage: {
    width: "100%",
    height: 150,
  },
  pieChartContainer: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  pieChartImage: {
    width: "100%",
    height: 150,
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
});
