
// import React from 'react';
// import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
// import { IonReactRouter } from '@ionic/react-router';
// import { Route, Redirect, Switch } from 'react-router-dom';

// /* Pages */
// import Signup from './components/Authentication/Signup';
// import Login from './components/Authentication/Login';
// import Dashboard from './components/users/pages/Dashboard';
// import Profile from './components/Authentication/Profile';
// import VehicleRegistration from './components/users/pages/VehicleRegistration';
// import BusandTripManagement from './components/users/pages/BusManagement';
// import PassengerBooking from './components/users/pages/PassengerBooking';
// import LiveTracking from './components/users/pages/LiveTracking';
// import RevenuePayments from './components/users/pages/Revenue';
// import Notification from './components/users/pages/Notification';
// import Support from './components/users/pages/Support';
// import Kyc from './components/users/pages/KYC';
// import TripManagemnet from './components/users/pages/TripManagement';
// import CreateTrip from './components/users/pages/CreateTrip';
// import CurrentTrips from './components/users/pages/CurrentTrips';
// import Analytics from './components/users/pages/Analytics';
// import LandingPage from './components/users/pages/LandingPage';
// import Fine from './components/users/pages/Fine';
// /* Core CSS */
// import '@ionic/react/css/core.css';
// import '@ionic/react/css/normalize.css';
// import '@ionic/react/css/structure.css';
// import '@ionic/react/css/typography.css';
// import '@ionic/react/css/padding.css';
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/display.css';
// import './theme/variables.css';

// setupIonicReact();

// const App: React.FC = () => {
//   return (
//     <IonApp>
//       <IonReactRouter>
//         <IonRouterOutlet>
//           <Switch>
//             {/* Always show Signup/Login */}
//             <Route exact path="/signup">
//               <Signup />
//             </Route>
//              <Route exact path="/">
//               <LandingPage />
//             </Route>

//             <Route exact path="/login">
//               <Login />
//             </Route>

//             <Route exact path="/dashboard">
//               <Dashboard />
//             </Route>

//             <Route exact path="/profile-setup">
//               <Profile />
//             </Route>

//             <Route exact path="/vehicle-registration">
//               <VehicleRegistration />
//             </Route>

//             <Route exact path="/bus-and-trip-management">
//               <BusandTripManagement />
//             </Route>

//             <Route exact path="/passenger-booking">
//               <PassengerBooking />
//             </Route>

//             <Route exact path="/live-tracking">
//               <LiveTracking />
//             </Route>
//              <Route exact path="/revenue-payments">
//               <RevenuePayments />
//             </Route>
//             <Route exact path="/notification">
//               <Notification />
//             </Route>
//             <Route exact path="/trip-management">
//               <TripManagemnet />
//             </Route>
//             <Route exact path="/support">
//               <Support />
//             </Route>
//             <Route exact path="/create-trip">
//               <CreateTrip />
//             </Route>
//             <Route exact path="/current-trips">
//               <CurrentTrips />
//             </Route>
//             <Route exact path="/kyc-verification">
//               <Kyc />
//             </Route>
//               <Route exact path="/analytics">
//               <Analytics />
//             </Route>
//             <Route exact path="/fines">
//               <Fine />
//             </Route>

//             {/* Catch All */}
//             <Route path="*">
//               <Redirect to="/" />
//             </Route>
//           </Switch>
//         </IonRouterOutlet>
//       </IonReactRouter>
//     </IonApp>
//   );
// };

// export default App;
import React, { useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch, useLocation, useHistory } from 'react-router-dom';

/* Pages */
import Signup from './components/Authentication/Signup';
import Login from './components/Authentication/Login';
import Dashboard from './components/users/pages/Dashboard';
import Profile from './components/Authentication/Profile';
import VehicleRegistration from './components/users/pages/VehicleRegistration';
import BusandTripManagement from './components/users/pages/BusManagement';
import PassengerBooking from './components/users/pages/PassengerBooking';
import LiveTracking from './components/users/pages/LiveTracking';
import RevenuePayments from './components/users/pages/Revenue';
import Notification from './components/users/pages/Notification';
import Support from './components/users/pages/Support';
import Kyc from './components/users/pages/KYC';
import TripManagemnet from './components/users/pages/TripManagement';
import CreateTrip from './components/users/pages/CreateTrip';
import CurrentTrips from './components/users/pages/CurrentTrips';
import Analytics from './components/users/pages/Analytics';
import LandingPage from './components/users/pages/LandingPage';
import Fine from './components/users/pages/Fine';

/* Session Management Utils */
import { isSessionExpired, getAccessToken } from './utils/session';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';

setupIonicReact();


interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const expired = await isSessionExpired();
      const token = await getAccessToken();
      setIsAuthenticated(!expired && !!token);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Redirect to="/login?session=expired" />;
};


const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <AppRoutes />
      </IonReactRouter>
    </IonApp>
  );
};


const AppRoutes: React.FC = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const checkAuth = async () => {
      const expired = await isSessionExpired();
      const token = await getAccessToken();
      const loggedIn = !expired && !!token;
      setIsLoggedIn(loggedIn);
      setAuthChecked(true);

    
      if (loggedIn && ['/', '/login', '/signup'].includes(location.pathname)) {
        history.replace('/dashboard');
      }
      
    
      if (!loggedIn && location.pathname !== '/' && 
          location.pathname !== '/login' && 
          location.pathname !== '/signup') {
     
      }
    };
    checkAuth();
  }, [location.pathname, history]);

  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        Checking session...
      </div>
    );
  }

  return (
    <IonRouterOutlet>
      <Switch>
        {/* পাবলিক রাউট - সবসময় এক্সেসযোগ্য */}
        <Route exact path="/signup">
          <Signup />
        </Route>
        
        <Route exact path="/">
          <LandingPage />
        </Route>

        <Route exact path="/login">
          <Login />
        </Route>

        {/* প্রটেক্টেড রাউট - শুধুমাত্র লগইন করা ইউজারদের জন্য */}
        <Route exact path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>

        <Route exact path="/profile-setup">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>

        <Route exact path="/vehicle-registration">
          <ProtectedRoute>
            <VehicleRegistration />
          </ProtectedRoute>
        </Route>

        <Route exact path="/bus-and-trip-management">
          <ProtectedRoute>
            <BusandTripManagement />
          </ProtectedRoute>
        </Route>

        <Route exact path="/passenger-booking">
          <ProtectedRoute>
            <PassengerBooking />
          </ProtectedRoute>
        </Route>

        <Route exact path="/live-tracking">
          <ProtectedRoute>
            <LiveTracking />
          </ProtectedRoute>
        </Route>

        <Route exact path="/revenue-payments">
          <ProtectedRoute>
            <RevenuePayments />
          </ProtectedRoute>
        </Route>

        <Route exact path="/notification">
          <ProtectedRoute>
            <Notification />
          </ProtectedRoute>
        </Route>

        <Route exact path="/trip-management">
          <ProtectedRoute>
            <TripManagemnet />
          </ProtectedRoute>
        </Route>

        <Route exact path="/support">
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        </Route>

        <Route exact path="/create-trip">
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        </Route>

        <Route exact path="/current-trips">
          <ProtectedRoute>
            <CurrentTrips />
          </ProtectedRoute>
        </Route>

        <Route exact path="/kyc-verification">
          <ProtectedRoute>
            <Kyc />
          </ProtectedRoute>
        </Route>

        <Route exact path="/analytics">
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        </Route>

        <Route exact path="/fines">
          <ProtectedRoute>
            <Fine />
          </ProtectedRoute>
        </Route>

   
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </IonRouterOutlet>
  );
};

export default App;