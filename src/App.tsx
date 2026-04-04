
import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';

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

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
            {/* Always show Signup/Login */}
            <Route exact path="/">
              <Signup />
            </Route>

            <Route exact path="/login">
              <Login />
            </Route>

            <Route exact path="/dashboard">
              <Dashboard />
            </Route>

            <Route exact path="/profile-setup">
              <Profile />
            </Route>

            <Route exact path="/vehicle-registration">
              <VehicleRegistration />
            </Route>

            <Route exact path="/bus-and-trip-management">
              <BusandTripManagement />
            </Route>

            <Route exact path="/passenger-booking">
              <PassengerBooking />
            </Route>

            <Route exact path="/live-tracking">
              <LiveTracking />
            </Route>
             <Route exact path="/revenue-payments">
              <RevenuePayments />
            </Route>
            <Route exact path="/notification">
              <Notification />
            </Route>
            <Route exact path="/trip-management">
              <TripManagemnet />
            </Route>
            <Route exact path="/support">
              <Support />
            </Route>
            <Route exact path="/create-trip">
              <CreateTrip />
            </Route>
            <Route exact path="/current-trips">
              <CurrentTrips />
            </Route>
            <Route exact path="/kyc-verification">
              <Kyc />
            </Route>

            {/* Catch All */}
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;