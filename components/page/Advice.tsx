// Advice.tsx

// === ( Import ) ===
import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingScreenAdvice } from "../LoadingScreen";

// === ( HospitalData ) ===
interface HospitalData {
  latitude: any;
  longitude: any;
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  //rating?: number; // optional if not always provided
}

export const Advice: FC = () => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    requestLocationPermissionAndWatchPosition();
  }, []);

  const requestLocationPermissionAndWatchPosition = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "กรุณาเปิดการใช้ตำแหน่งใน Settings เพื่อใช้งานแผนที่",
          [{ text: "OK", onPress: () => Linking.openSettings() }]
        );
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          fetchNearbyHospitals(newLocation.coords);
        }
      );
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  const fetchNearbyHospitals = async (
    coords: Location.LocationObjectCoords
  ) => {
    setLoading(true);
    const url = `https://api.longdo.com/POIService/json/search?key=2b8d930d7d6a9dbac6b470669ad7319c&lat=${coords.latitude}&lon=${coords.longitude}&tag=hospital`;

    try {
      console.log("Fetching hospitals from:", url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Longdo API Response: ", data);

      if (data && data.data && Array.isArray(data.data)) {
        const hospitals = data.data
          .filter((item: { lat: any; lon: any }) => item.lat && item.lon)
          .map(
            (item: {
              id: { toString: () => any };
              name: any;
              address: any;
              lat: any;
              lon: any;
            }) => ({
              id: item.id.toString(),
              name: item.name || "Unknown",
              address: item.address || "No address available",
              latitude: item.lat,
              longitude: item.lon,
            })
          );

        setTimeout(() => {
          setHospitals(hospitals);
          setLoading(false);
        }, 1000); // set delay
      } else {
        console.error("Invalid API response format");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (location) {
      fetchNearbyHospitals(location);
    }
  };

  // === ( LoadingScreen ) ===
  if (loading) {
    return <LoadingScreenAdvice />;
  }

  return (
    <ImageBackground
      source={require("../../assets/background/bg1.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {location ? (
          <MapView
            style={styles.map}
            region={
              location
                ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }
                : undefined
            }
          >
            {hospitals.length > 0
              ? hospitals
                  .map((hospital) => {
                    if (!hospital.latitude || !hospital.longitude) {
                      console.warn("Invalid hospital coordinates:", hospital);
                      return null;
                    }

                    return (
                      <Marker
                        key={hospital.id}
                        coordinate={{
                          latitude: hospital.latitude,
                          longitude: hospital.longitude,
                        }}
                        title={hospital.name}
                        description={hospital.address}
                      />
                    );
                  })
                  .filter((marker) => marker !== null)
              : []}
          </MapView>
        ) : (
          <Text>กำลังโหลดแผนที่...</Text>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>

        <FlatList
          data={hospitals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.hospitalName}>{item.name}</Text>
              <Text>{item.address}</Text>
              {/*<Text>Rating: {item.rating}</Text>*/}
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    paddingTop: 70,
    paddingLeft: 30,
    paddingRight: 30,
    marginBottom: "25%",
  },
  map: {
    width: "100%",
    height: "45%",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  hospitalName: {
    fontWeight: "bold",
  },
  refreshButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#007BFF",
    borderRadius: 50,
    padding: 10,
    marginTop: 65,
    marginRight: 25,
  },
});
