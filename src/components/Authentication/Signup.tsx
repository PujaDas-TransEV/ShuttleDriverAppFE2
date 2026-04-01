import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonLabel,
  IonToast,
  IonLoading
} from '@ionic/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const history = useHistory();
  const role = 'driver';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setToastMsg('Enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup/send-otp', {
        email,
        role
      });
      if (response.status === 200) {
        setToastMsg('OTP sent! Check your email.');
        setShowOtpForm(true);
      } else {
        setToastMsg('Failed to send OTP');
      }
    } catch (error: any) {
      setToastMsg(error.response?.data?.message || 'Server error');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setToastMsg('Enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup', {
        email,
        otp,
        role
      });
      if (response.status === 200) {
        setToastMsg('Signup successful!');
        setEmail('');
        setOtp('');
        setShowOtpForm(false);
        history.push('/login');
      } else {
        setToastMsg('OTP verification failed');
      }
    } catch (error: any) {
      setToastMsg(error.response?.data?.message || 'Server error');
    }
    setLoading(false);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-white">
        
        {/* Center Container */}
        <div className="flex justify-center items-center min-h-screen px-4">
          
          {/* Card */}
          <div className="w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-200 bg-white text-black">
            
            {/* Header */}
            <h2 className="text-3xl font-bold mb-2 text-center">Sign Up</h2>
            <p className="text-gray-500 mb-6 text-center">
              Create your driver account
            </p>

            {/* Form */}
            <form
              onSubmit={showOtpForm ? handleOtpSubmit : handleEmailSubmit}
              className="space-y-5"
            >
              {!showOtpForm && (
                <div>
                  <IonLabel className="block mb-1 font-medium">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    placeholder="Enter your email"
                    required
                    onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setEmail(e.detail.value!)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 text-black placeholder-gray-400"
                  />
                </div>
              )}

              {showOtpForm && (
                <div>
                  <p className="text-gray-500 mb-2 text-sm">
                    Enter the OTP sent to your email
                  </p>
                  <IonInput
                    type="text"
                    maxlength={6}
                    value={otp}
                    placeholder="123456"
                    onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setOtp(e.detail.value!)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 text-black placeholder-gray-400"
                  />
                </div>
              )}

              {/* Button */}
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="w-64 h-10 text-white font-semibold rounded-full 
                             bg-black hover:bg-gray-900 
                             transition duration-300"
                >
                  {showOtpForm ? 'Verify OTP' : 'Send OTP'}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <span
                  className="text-black font-semibold cursor-pointer hover:underline"
                  onClick={() => history.push('/login')}
                >
                  Login
                </span>
              </p>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Processing..." />
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default Signup;