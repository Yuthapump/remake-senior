// Advice.tsx
import React, { FC, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface HospitalData {
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

  useEffect(() => {
    requestLocationPermissionAndWatchPosition();
  }, []);

  const requestLocationPermissionAndWatchPosition = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }

    Location.watchPositionAsync(
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
  };

  const fetchNearbyHospitals = async (
    coords: Location.LocationObjectCoords
  ) => {
    const url = `https://api.longdo.com/POIService/json/search?key=2b8d930d7d6a9dbac6b470669ad7319c&lat=${coords.latitude}&lon=${coords.longitude}&tag=hospital`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log("Longdo API Response: ", data);

      if (data && data.data) {
        const hospitals = data.data.map((item: HospitalData) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          latitude: item.lat,
          longitude: item.lon,
          //rating: item.rating || 4.0,
        }));

        setHospitals(hospitals);
      } else {
        console.error("No data found or API response is invalid.");
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const handleRefresh = () => {
    if (location) {
      fetchNearbyHospitals(location);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background/bg1.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {hospitals.map((hospital) => {
              if (hospital.lat && hospital.lat) {
                return (
                  <Marker
                    key={hospital.id}
                    coordinate={{
                      latitude: hospital.lat,
                      longitude: hospital.lon,
                    }}
                    title={hospital.name}
                    description={hospital.address}
                  />
                );
              }
              return null; // คืนค่า null ถ้าค่าพิกัดไม่ถูกต้อง
            })}
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
