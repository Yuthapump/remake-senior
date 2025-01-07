import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";

// custom components
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { MainSP } from "./components/MainSP";
import { MainPR } from "./components/MainPR";
import { store } from "./app/store";
import { Welcome } from "./components/Welcome";
import { Privacy } from "./components/Privacy";
import { HomeAD } from "./components/page/HomeAD";
import { SplashScreen } from "./components/SplashScreen";
import { AddChild } from "./components/page/Prame_AddChild";
// import { AddChild } from "./components/page/Updated_AddChild";
import { ChooseChild } from "./components/page/ChooseChild";
import { Assessment } from "./components/page/Assessment";
// import { GM } from "./components/assessment/GM-base"; // GM-base.tsx
import { GM } from "./components/assessment/GM";
import { FM } from "./components/assessment/FM";
import { RL } from "./components/assessment/RL";
import { EL } from "./components/assessment/EL";
import { PS } from "./components/assessment/PS";
import { Training } from "./components/assessment/Training";
import { UpdateProfile } from "./components/page/UpdateProfile";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="welcome"
            component={Welcome}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="register"
            component={Register}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="privacy"
            component={Privacy}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="mainPR"
            component={MainPR}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="mainSP"
            component={MainSP}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="choosechild"
            component={ChooseChild}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="addchild"
            component={AddChild}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="assessment"
            component={Assessment}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="gm"
            component={GM}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="fm"
            component={FM}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="rl"
            component={RL}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="el"
            component={EL}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ps"
            component={PS}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="training"
            component={Training}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="updateprofile"
            component={UpdateProfile}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="adminHome"
            component={HomeAD}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
