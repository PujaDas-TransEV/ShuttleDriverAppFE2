// import React, { useState } from 'react';
// import {
//   IonPage,
//   IonContent,
//   IonInput,
//   IonLoading,
//   IonToast,
// } from '@ionic/react';
// import { useHistory } from 'react-router-dom';

// const Login: React.FC = () => {
//   const history = useHistory();

//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [showOtpForm, setShowOtpForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');

//   // Send OTP
//   const handleEmailSubmit = async () => {
//     if (!email.includes('@')) {
//       setToastMsg('Enter a valid email');
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch('https://be.shuttleapp.transev.site/auth/login/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });

//       if (!res.ok) throw new Error('Failed to send OTP');

//       setShowOtpForm(true);
//       setToastMsg(`OTP sent to ${email}`);
//     } catch (error: any) {
//       setToastMsg(error.message || 'Error sending OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Verify OTP
//   const handleOtpSubmit = async () => {
//     if (!otp || otp.length !== 6) {
//       setToastMsg('Enter a valid 6-digit OTP');
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch('https://be.shuttleapp.transev.site/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, otp }),
//       });

//       if (!res.ok) throw new Error('Invalid OTP');

//       setToastMsg('Login successful!');
//       setEmail('');
//       setOtp('');
//       setShowOtpForm(false);

//       setTimeout(() => {
//         history.push('/dashboard');
//       }, 1000);
//     } catch (error: any) {
//       setToastMsg(error.message || 'Error verifying OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <IonPage>
//       <IonContent fullscreen className="bg-white">
        
//         {/* Center Container */}
//         <div className="flex justify-center items-center min-h-screen px-4">
          
//           {/* Card */}
//           <div className="w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-200 bg-white text-black">
            
//             {/* Header */}
//             <h2 className="text-3xl font-bold mb-2 text-center">Login</h2>
//             <p className="text-gray-500 mb-6 text-center">
//               Enter your email to login
//             </p>

//             {/* Email Input */}
//             {!showOtpForm && (
//               <IonInput
//                 type="email"
//                 value={email}
//                 placeholder="Enter your email"
//                 onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setEmail(e.detail.value!)}
//                 className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-100 text-black placeholder-gray-400"
//               />
//             )}

//             {/* OTP Input */}
//             {showOtpForm && (
//               <>
//                 <p className="text-gray-500 mb-2 text-sm">
//                   Enter the OTP sent to your email
//                 </p>
//                 <IonInput
//                   type="text"
//                   maxlength={6}
//                   value={otp}
//                   placeholder="123456"
//                   onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setOtp(e.detail.value!)}
//                   className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-100 text-black placeholder-gray-400"
//                 />
//               </>
//             )}

//             {/* Button */}
//             <div className="flex justify-center mt-6">
//               {!showOtpForm ? (
//                 <button
//                   onClick={handleEmailSubmit}
//                   disabled={loading}
//                   className="w-64 h-12 text-white font-semibold rounded-full 
//                              bg-black hover:bg-gray-900
//                              transition duration-300 disabled:opacity-50"
//                 >
//                   Send OTP
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleOtpSubmit}
//                   disabled={loading}
//                   className="w-64 h-12 text-white font-semibold rounded-full 
//                              bg-black hover:bg-gray-900
//                              transition duration-300 disabled:opacity-50"
//                 >
//                   Verify OTP
//                 </button>
//               )}
//             </div>

//             {/* Signup Redirect */}
//             <div className="mt-6 text-center">
//               <p className="text-gray-500 text-sm">
//                 Don&apos;t have an account?{' '}
//                 <span
//                   className="text-black font-semibold cursor-pointer hover:underline"
//                   onClick={() => history.push('/signup')}
//                 >
//                   Sign Up
//                 </span>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Loading & Toast */}
//         <IonLoading isOpen={loading} message="Processing..." />
//         <IonToast
//           isOpen={!!toastMsg}
//           message={toastMsg}
//           duration={2500}
//           onDidDismiss={() => setToastMsg('')}
//         />
//       </IonContent>
//     </IonPage>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

const API_BASE = "https://be.shuttleapp.transev.site";

const Login: React.FC = () => {
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // ✅ Send OTP
  const handleEmailSubmit = async () => {
    if (!email.includes('@')) {
      setToastMsg('Enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Failed to send OTP');

      setShowOtpForm(true);
      setToastMsg(`OTP sent to ${email}`);
    } catch (error: any) {
      setToastMsg(error.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP and save access token
  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setToastMsg('Enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail?.message || data.message || 'Invalid OTP');

      // ✅ Save access token in localStorage
      localStorage.setItem('access_token', data.access_token);

      setToastMsg('Login successful!');
      setEmail('');
      setOtp('');
      setShowOtpForm(false);

      // ✅ Redirect to dashboard or profile page
      setTimeout(() => {
        history.push('/dashboard'); // change this to your desired page
      }, 1000);

    } catch (error: any) {
      setToastMsg(error.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-white">
        <div className="flex justify-center items-center min-h-screen px-4">
          <div className="w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-200 bg-white text-black">
            <h2 className="text-3xl font-bold mb-2 text-center">Login</h2>
            <p className="text-gray-500 mb-6 text-center">
              Enter your email to login
            </p>

            {/* Email Input */}
            {!showOtpForm && (
              <IonInput
                type="email"
                value={email}
                placeholder="Enter your email"
                onIonChange={(e: any) => setEmail(e.detail.value)}
                className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-100 text-black placeholder-gray-400"
              />
            )}

            {/* OTP Input */}
            {showOtpForm && (
              <>
                <p className="text-gray-500 mb-2 text-sm">
                  Enter the OTP sent to your email
                </p>
                <IonInput
                  type="text"
                  maxlength={6}
                  value={otp}
                  placeholder="123456"
                  onIonChange={(e: any) => setOtp(e.detail.value)}
                  className="w-full px-4 py-3 mb-4 rounded-lg bg-gray-100 text-black placeholder-gray-400"
                />
              </>
            )}

            {/* Button */}
            <div className="flex justify-center mt-6">
              {!showOtpForm ? (
                <button
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="w-64 h-12 text-white font-semibold rounded-full 
                             bg-black hover:bg-gray-900
                             transition duration-300 disabled:opacity-50"
                >
                  Send OTP
                </button>
              ) : (
                <button
                  onClick={handleOtpSubmit}
                  disabled={loading}
                  className="w-64 h-12 text-white font-semibold rounded-full 
                             bg-black hover:bg-gray-900
                             transition duration-300 disabled:opacity-50"
                >
                  Verify OTP
                </button>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{' '}
                <span
                  className="text-black font-semibold cursor-pointer hover:underline"
                  onClick={() => history.push('/signup')}
                >
                  Sign Up
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

export default Login;