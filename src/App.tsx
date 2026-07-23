import { useEffect, useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import DynamicRoute from "./DynamicRoutes";

/* Core CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";


/* Global Themes */
import "./theme/global.css";

/* Component Shells & Pages */
import MainLayout from "./components/MainLayout";

import Login from "./pages/Login";
import Home from "./pages/Home";





setupIonicReact();

const App: React.FC = () => {
  // Track auth session dynamically
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

  const storedUser = localStorage.getItem("user");

  const authUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  useEffect(() => {
    const checkUserSession = () => {
      setUser(localStorage.getItem("user"));
    };
    
    // Check local storage updates
    window.addEventListener("storage", checkUserSession);
    const authInterval = setInterval(checkUserSession, 800);
    
    return () => {
      window.removeEventListener("storage", checkUserSession);
      clearInterval(authInterval);
    };
  }, []);




  return (
    <IonApp>
      <IonReactRouter>
        {!user ? (
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Redirect from="*" to="/login" />
            </Switch>
          </IonRouterOutlet>
        ) : (
          <MainLayout>

            
              <Switch>

    <Route exact path="/home" component={Home} />

    <Route
        path="/:module/:type/:page"
        render={({ location }) => (
            <DynamicRoute path={location.pathname} />
        )}
    />

    <Redirect to="/home" />

</Switch>
          </MainLayout>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
