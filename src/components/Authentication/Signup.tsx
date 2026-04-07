// import React, { useState } from 'react';
// import {
//   IonPage,
//   IonContent,
//   IonInput,
//   IonLabel,
//   IonToast,
//   IonLoading
// } from '@ionic/react';
// import axios from 'axios';
// import { useHistory } from 'react-router-dom';

// const Signup: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [showOtpForm, setShowOtpForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const history = useHistory();
//   const role = 'driver';

//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email.includes('@')) {
//       setToastMsg('Enter a valid email');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup/send-otp', {
//         email,
//         role
//       });
//       if (response.status === 200) {
//         setToastMsg('OTP sent! Check your email.');
//         setShowOtpForm(true);
//       } else {
//         setToastMsg('Failed to send OTP');
//       }
//     } catch (error: any) {
//       setToastMsg(error.response?.data?.message || 'Server error');
//     }
//     setLoading(false);
//   };

//   const handleOtpSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!otp) {
//       setToastMsg('Enter OTP');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup', {
//         email,
//         otp,
//         role
//       });
//       if (response.status === 200) {
//         setToastMsg('Signup successful!');
//         setEmail('');
//         setOtp('');
//         setShowOtpForm(false);
//         history.push('/login');
//       } else {
//         setToastMsg('OTP verification failed');
//       }
//     } catch (error: any) {
//       setToastMsg(error.response?.data?.message || 'Server error');
//     }
//     setLoading(false);
//   };

//   return (
//     <IonPage>
//       <IonContent fullscreen className="bg-white">
        
//         {/* Center Container */}
//         <div className="flex justify-center items-center min-h-screen px-4">
          
//           {/* Card */}
//           <div className="w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-200 bg-white text-black">
            
//             {/* Header */}
//             <h2 className="text-3xl font-bold mb-2 text-center">Sign Up</h2>
//             <p className="text-gray-500 mb-6 text-center">
//               Create your driver account
//             </p>

//             {/* Form */}
//             <form
//               onSubmit={showOtpForm ? handleOtpSubmit : handleEmailSubmit}
//               className="space-y-5"
//             >
//               {!showOtpForm && (
//                 <div>
//                   <IonLabel className="block mb-1 font-medium">Email</IonLabel>
//                   <IonInput
//                     type="email"
//                     value={email}
//                     placeholder="Enter your email"
//                     required
//                     onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setEmail(e.detail.value!)}
//                     className="w-full px-4 py-3 rounded-lg bg-gray-100 text-black placeholder-gray-400"
//                   />
//                 </div>
//               )}

//               {showOtpForm && (
//                 <div>
//                   <p className="text-gray-500 mb-2 text-sm">
//                     Enter the OTP sent to your email
//                   </p>
//                   <IonInput
//                     type="text"
//                     maxlength={6}
//                     value={otp}
//                     placeholder="123456"
//                     onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setOtp(e.detail.value!)}
//                     className="w-full px-4 py-3 rounded-lg bg-gray-100 text-black placeholder-gray-400"
//                   />
//                 </div>
//               )}

//               {/* Button */}
//               <div className="flex justify-center mt-6">
//                 <button
//                   type="submit"
//                   className="w-64 h-10 text-white font-semibold rounded-full 
//                              bg-black hover:bg-gray-900 
//                              transition duration-300"
//                 >
//                   {showOtpForm ? 'Verify OTP' : 'Send OTP'}
//                 </button>
//               </div>
//             </form>

//             {/* Footer */}
//             <div className="mt-6 text-center">
//               <p className="text-gray-500 text-sm">
//                 Already have an account?{' '}
//                 <span
//                   className="text-black font-semibold cursor-pointer hover:underline"
//                   onClick={() => history.push('/login')}
//                 >
//                   Login
//                 </span>
//               </p>
//             </div>
//           </div>
//         </div>

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

// export default Signup;


// import React, { useState, useEffect } from 'react';
// import {
//   IonPage,
//   IonContent,
//   IonToast,
//   IonLoading
// } from '@ionic/react';
// import axios from 'axios';
// import { useHistory } from 'react-router-dom';
// import {
//   EnvelopeIcon,
//   KeyIcon,
//   ArrowRightIcon,
//   CheckCircleIcon,
//   TruckIcon,
//   UserPlusIcon,
//   ShieldCheckIcon
// } from '@heroicons/react/24/outline';

// const Signup: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [showOtpForm, setShowOtpForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const [toastColor, setToastColor] = useState('success');
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [resendTimer, setResendTimer] = useState(0);
//   const history = useHistory();
//   const role = 'driver';

//   useEffect(() => {
//     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//     setIsDarkMode(prefersDark);
//   }, []);

//   useEffect(() => {
//     let interval: ReturnType<typeof setInterval>;
//     if (resendTimer > 0) {
//       interval = setInterval(() => {
//         setResendTimer((prev) => prev - 1);
//       }, 1000);
//     }
//     return () => {
//       if (interval) {
//         clearInterval(interval);
//       }
//     };
//   }, [resendTimer]);

//   const showNotification = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
//     setToastMsg(message);
//     setToastColor(color);
//     setTimeout(() => setToastMsg(''), 3000);
//   };

//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email.includes('@') || !email.includes('.')) {
//       showNotification('Please enter a valid email address', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup/send-otp', {
//         email,
//         role
//       });
//       if (response.status === 200) {
//         showNotification('OTP sent successfully! Check your email', 'success');
//         setShowOtpForm(true);
//         setResendTimer(60);
//       } else {
//         showNotification('Failed to send OTP. Please try again', 'error');
//       }
//     } catch (error: any) {
//       showNotification(error.response?.data?.message || 'Server error. Please try again', 'error');
//     }
//     setLoading(false);
//   };

//   const handleResendOtp = async () => {
//     if (resendTimer > 0) return;
    
//     setLoading(true);
//     try {
//       const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup/send-otp', {
//         email,
//         role
//       });
//       if (response.status === 200) {
//         showNotification('OTP resent successfully!', 'success');
//         setResendTimer(60);
//       } else {
//         showNotification('Failed to resend OTP', 'error');
//       }
//     } catch (error: any) {
//       showNotification(error.response?.data?.message || 'Server error', 'error');
//     }
//     setLoading(false);
//   };

//   const handleOtpChange = (index: number, value: string) => {
//     if (value.length <= 1 && /^\d*$/.test(value)) {
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);
      
//       // Auto-focus next input
//       if (value && index < 5) {
//         const nextInput = document.getElementById(`otp-input-${index + 1}`);
//         nextInput?.focus();
//       }
//     }
//   };

//   const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
//     // Handle backspace to go to previous input
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       const prevInput = document.getElementById(`otp-input-${index - 1}`);
//       prevInput?.focus();
//     }
//   };

//   const handleOtpSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const otpValue = otp.join('');
//     if (otpValue.length !== 6) {
//       showNotification('Please enter complete 6-digit OTP', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup', {
//         email,
//         otp: otpValue,
//         role
//       });
//       if (response.status === 200) {
//         showNotification('Signup successful! Redirecting to login...', 'success');
//         setTimeout(() => {
//           history.push('/login');
//         }, 1500);
//       } else {
//         showNotification('OTP verification failed. Please try again', 'error');
//       }
//     } catch (error: any) {
//       showNotification(error.response?.data?.message || 'Invalid OTP. Please try again', 'error');
//     }
//     setLoading(false);
//   };

//   const styles = getStyles(isDarkMode);

//   return (
//     <IonPage>
//       <IonContent style={{ '--background': isDarkMode ? '#000000' : '#F8F9FA' } as any}>
//         <div style={styles.container}>
          
//           {/* Background Decoration */}
//           <div style={styles.bgDecoration} />
          
//           {/* Main Card */}
//           <div style={styles.card}>
            
//             {/* Logo/Icon Section */}
//             <div style={styles.iconContainer}>
//               <div style={styles.iconWrapper}>
//                 <TruckIcon style={styles.mainIcon} />
//               </div>
//             </div>

//             {/* Header */}
//             <div style={styles.header}>
//               <h1 style={styles.title}>Create Account</h1>
//               <p style={styles.subtitle}>
//                 {!showOtpForm 
//                   ? "Join as a driver and start your journey" 
//                   : "Enter the verification code sent to your email"}
//               </p>
//             </div>

//             {/* Form */}
//             <form onSubmit={showOtpForm ? handleOtpSubmit : handleEmailSubmit} style={styles.form}>
//               {!showOtpForm ? (
//                 // Email Input Section
//                 <div style={styles.inputGroup}>
//                   <div style={styles.inputWrapper}>
//                     <EnvelopeIcon style={styles.inputIcon} />
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="Enter your email address"
//                       style={styles.input}
//                       required
//                     />
//                   </div>
//                   <button type="submit" style={styles.submitButton} disabled={loading}>
//                     <span>Send OTP</span>
//                     <ArrowRightIcon style={styles.buttonIcon} />
//                   </button>
//                 </div>
//               ) : (
//                 // OTP Input Section
//                 <div style={styles.otpSection}>
//                   <div style={styles.otpBoxContainer}>
//                     {otp.map((digit, index) => (
//                       <input
//                         key={index}
//                         id={`otp-input-${index}`}
//                         type="text"
//                         maxLength={1}
//                         value={digit}
//                         onChange={(e) => handleOtpChange(index, e.target.value)}
//                         onKeyDown={(e) => handleKeyDown(index, e)}
//                         style={styles.otpBox}
//                         autoFocus={index === 0}
//                       />
//                     ))}
//                   </div>
                  
//                   <button type="submit" style={styles.verifyButton} disabled={loading}>
//                     <CheckCircleIcon style={styles.buttonIcon} />
//                     <span>Verify OTP</span>
//                   </button>
                  
//                   <div style={styles.resendSection}>
//                     <p style={styles.resendText}>
//                       Didn't receive the code?
//                     </p>
//                     <button
//                       type="button"
//                       onClick={handleResendOtp}
//                       disabled={resendTimer > 0 || loading}
//                       style={{
//                         ...styles.resendButton,
//                         opacity: resendTimer > 0 ? 0.5 : 1,
//                         cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
//                       }}
//                     >
//                       {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </form>

//             {/* Footer */}
//             <div style={styles.footer}>
//               <p style={styles.footerText}>
//                 Already have an account?{' '}
//                 <span
//                   onClick={() => history.push('/login')}
//                   style={styles.loginLink}
//                 >
//                   Sign In
//                 </span>
//               </p>
//               <div style={styles.securityBadge}>
//                 <ShieldCheckIcon style={styles.securityIcon} />
//                 <span style={styles.securityText}>Secure & Encrypted</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <IonLoading isOpen={loading} message="Processing..." />
//         <IonToast
//           isOpen={!!toastMsg}
//           message={toastMsg}
//           duration={3000}
//           color={toastColor}
//           position="top"
//         />
//       </IonContent>
//     </IonPage>
//   );
// };

// const getStyles = (isDark: boolean) => ({
//   container: {
//     minHeight: '100vh',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: '20px',
//     position: 'relative' as const,
//     background: isDark ? '#000000' : '#F8F9FA'
//   },
//   bgDecoration: {
//     position: 'absolute' as const,
//     top: 0,
//     left: 0,
//     right: 0,
//     height: '300px',
//     background: 'linear-gradient(135deg, #10B98120, #3B82F620)',
//     borderRadius: '0 0 50% 50%',
//     filter: 'blur(60px)'
//   },
//   card: {
//     maxWidth: '480px',
//     width: '100%',
//     background: isDark ? '#111111' : '#FFFFFF',
//     borderRadius: '32px',
//     padding: '40px 32px',
//     boxShadow: isDark 
//       ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
//       : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
//     border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
//     position: 'relative' as const,
//     zIndex: 2
//   },
//   iconContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     marginBottom: '24px'
//   },
//   iconWrapper: {
//     width: '80px',
//     height: '80px',
//     borderRadius: '40px',
//     background: 'linear-gradient(135deg, #10B981, #059669)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
//   },
//   mainIcon: {
//     width: '40px',
//     height: '40px',
//     color: '#FFFFFF'
//   },
//   header: {
//     textAlign: 'center' as const,
//     marginBottom: '32px'
//   },
//   title: {
//     fontSize: '32px',
//     fontWeight: 'bold',
//     background: 'linear-gradient(135deg, #10B981, #60A5FA)',
//     WebkitBackgroundClip: 'text',
//     WebkitTextFillColor: 'transparent',
//     marginBottom: '8px'
//   },
//   subtitle: {
//     fontSize: '14px',
//     color: isDark ? '#9CA3AF' : '#6B7280',
//     lineHeight: '1.5'
//   },
//   form: {
//     marginBottom: '24px'
//   },
//   inputGroup: {
//     display: 'flex',
//     flexDirection: 'column' as const,
//     gap: '20px'
//   },
//   inputWrapper: {
//     position: 'relative' as const,
//     display: 'flex',
//     alignItems: 'center'
//   },
//   inputIcon: {
//     position: 'absolute' as const,
//     left: '16px',
//     width: '20px',
//     height: '20px',
//     color: isDark ? '#6B7280' : '#9CA3AF'
//   },
//   input: {
//     width: '100%',
//     padding: '16px 16px 16px 48px',
//     fontSize: '16px',
//     background: isDark ? '#0A0A0A' : '#F9FAFB',
//     border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
//     borderRadius: '16px',
//     color: isDark ? '#FFFFFF' : '#111827',
//     outline: 'none',
//     transition: 'all 0.2s'
//   },
//   submitButton: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '10px',
//     width: '100%',
//     padding: '16px',
//     background: '#10B981',
//     border: 'none',
//     borderRadius: '16px',
//     color: '#FFFFFF',
//     fontSize: '16px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s'
//   },
//   otpSection: {
//     display: 'flex',
//     flexDirection: 'column' as const,
//     gap: '24px'
//   },
//   otpBoxContainer: {
//     display: 'flex',
//     gap: '12px',
//     justifyContent: 'center',
//     flexWrap: 'wrap' as const
//   },
//   otpBox: {
//     width: '60px',
//     height: '70px',
//     textAlign: 'center' as const,
//     fontSize: '24px',
//     fontWeight: '600',
//     background: isDark ? '#0A0A0A' : '#F9FAFB',
//     border: `2px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
//     borderRadius: '16px',
//     color: isDark ? '#FFFFFF' : '#111827',
//     outline: 'none',
//     transition: 'all 0.2s'
//   },
//   verifyButton: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '10px',
//     width: '100%',
//     padding: '16px',
//     background: '#10B981',
//     border: 'none',
//     borderRadius: '16px',
//     color: '#FFFFFF',
//     fontSize: '16px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s'
//   },
//   resendSection: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '8px',
//     flexWrap: 'wrap' as const
//   },
//   resendText: {
//     fontSize: '13px',
//     color: isDark ? '#9CA3AF' : '#6B7280',
//     margin: 0
//   },
//   resendButton: {
//     background: 'transparent',
//     border: 'none',
//     color: '#10B981',
//     fontSize: '13px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s'
//   },
//   footer: {
//     textAlign: 'center' as const,
//     marginTop: '24px',
//     paddingTop: '24px',
//     borderTop: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
//   },
//   footerText: {
//     fontSize: '14px',
//     color: isDark ? '#9CA3AF' : '#6B7280',
//     marginBottom: '16px'
//   },
//   loginLink: {
//     color: '#10B981',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s'
//   },
//   securityBadge: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '8px'
//   },
//   securityIcon: {
//     width: '16px',
//     height: '16px',
//     color: '#10B981'
//   },
//   securityText: {
//     fontSize: '12px',
//     color: isDark ? '#6B7280' : '#9CA3AF'
//   },
//   buttonIcon: {
//     width: '18px',
//     height: '18px'
//   }
// });

// export default Signup;

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonToast,
  IonLoading
} from '@ionic/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import {
  EnvelopeIcon,
  KeyIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TruckIcon,
  UserPlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState('success');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(null);
  const history = useHistory();
  const role = 'driver';

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  const showNotification = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg(message);
    setToastColor(color);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup/send-otp', {
        email,
        role
      });
      if (response.status === 200) {
        showNotification('OTP sent successfully! Check your email', 'success');
        setShowOtpForm(true);
        setResendTimer(60);
      } else {
        showNotification('Failed to send OTP. Please try again', 'error');
      }
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Server error. Please try again', 'error');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup/send-otp', {
        email,
        role
      });
      if (response.status === 200) {
        showNotification('OTP resent successfully!', 'success');
        setResendTimer(60);
      } else {
        showNotification('Failed to resend OTP', 'error');
      }
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Server error', 'error');
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showNotification('Please enter complete 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://be.shuttleapp.transev.site/auth/signup', {
        email,
        otp: otpValue,
        role
      });
      if (response.status === 200) {
        showNotification('Signup successful! Redirecting to login...', 'success');
        setTimeout(() => {
          history.push('/login');
        }, 1500);
      } else {
        showNotification('OTP verification failed. Please try again', 'error');
      }
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Invalid OTP. Please try again', 'error');
    }
    setLoading(false);
  };

  const styles = getStyles(isDarkMode);

  return (
    <IonPage>
      <IonContent style={{ '--background': isDarkMode ? '#000000' : '#F8F9FA' } as any}>
        <div style={styles.container}>
          
          {/* Background Decoration */}
          <div style={styles.bgDecoration} />
          
          {/* Main Card */}
          <div style={styles.card}>
            
            {/* Logo/Icon Section */}
            <div style={styles.iconContainer}>
              <div style={styles.iconWrapper}>
                <TruckIcon style={styles.mainIcon} />
              </div>
            </div>

            {/* Header */}
            <div style={styles.header}>
              <h1 style={styles.title}>Create Account</h1>
              <p style={styles.subtitle}>
                {!showOtpForm 
                  ? "Join as a driver and start your journey" 
                  : "Enter the verification code sent to your email"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={showOtpForm ? handleOtpSubmit : handleEmailSubmit} style={styles.form}>
              {!showOtpForm ? (
                // Email Input Section
                <div style={styles.inputGroup}>
                  <div style={styles.inputWrapper}>
                    <EnvelopeIcon style={styles.inputIcon} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      style={styles.input}
                      required
                    />
                  </div>
                  <button type="submit" style={styles.submitButton} disabled={loading}>
                    <span>Send OTP</span>
                    <ArrowRightIcon style={styles.buttonIcon} />
                  </button>
                </div>
              ) : (
                // OTP Input Section
                <div style={styles.otpSection}>
                  <div style={styles.otpBoxContainer}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onFocus={() => setFocusedOtpIndex(index)}
                        onBlur={() => setFocusedOtpIndex(null)}
                        style={{
                          ...styles.otpBox,
                          ...(digit && styles.otpBoxFilled),
                          ...(focusedOtpIndex === index && styles.otpBoxFocused)
                        }}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  
                  <button type="submit" style={styles.verifyButton} disabled={loading}>
                    <CheckCircleIcon style={styles.buttonIcon} />
                    <span>Verify OTP</span>
                  </button>
                  
                  <div style={styles.resendSection}>
                    <p style={styles.resendText}>
                      Didn't receive the code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                      style={{
                        ...styles.resendButton,
                        opacity: resendTimer > 0 ? 0.5 : 1,
                        cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div style={styles.footer}>
              <p style={styles.footerText}>
                Already have an account?{' '}
                <span
                  onClick={() => history.push('/login')}
                  style={styles.loginLink}
                >
                  Sign In
                </span>
              </p>
              <div style={styles.securityBadge}>
                <ShieldCheckIcon style={styles.securityIcon} />
                <span style={styles.securityText}>Secure & Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Processing..." />
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={3000}
          color={toastColor}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

const getStyles = (isDark: boolean) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative' as const,
    background: isDark ? '#000000' : '#F8F9FA'
  },
  bgDecoration: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '300px',
    background: 'linear-gradient(135deg, #FFFFFF10, #FFFFFF05)',
    borderRadius: '0 0 50% 50%',
    filter: 'blur(60px)'
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    background: isDark ? '#0A0A0A' : '#FFFFFF',
    borderRadius: '32px',
    padding: '40px 32px',
    boxShadow: isDark 
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
    position: 'relative' as const,
    zIndex: 2
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px'
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    background: isDark ? '#FFFFFF' : '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark 
      ? '0 8px 20px rgba(255, 255, 255, 0.1)'
      : '0 8px 20px rgba(0, 0, 0, 0.1)'
  },
  mainIcon: {
    width: '40px',
    height: '40px',
    color: isDark ? '#000000' : '#FFFFFF'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    lineHeight: '1.5'
  },
  form: {
    marginBottom: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '16px',
    width: '20px',
    height: '20px',
    color: isDark ? '#6B7280' : '#9CA3AF'
  },
  input: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    fontSize: '16px',
    background: isDark ? '#0A0A0A' : '#F9FAFB',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
    borderRadius: '16px',
    color: isDark ? '#FFFFFF' : '#111827',
    outline: 'none',
    transition: 'all 0.2s',
    ':focus': {
      borderColor: isDark ? '#FFFFFF' : '#000000'
    }
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px',
    background: isDark ? '#FFFFFF' : '#000000',
    border: 'none',
    borderRadius: '16px',
    color: isDark ? '#000000' : '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  otpSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '28px'
  },
  otpBoxContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const
  },
  otpBox: {
    width: '60px',
    height: '70px',
    textAlign: 'center' as const,
    fontSize: '24px',
    fontWeight: '600',
    background: isDark ? '#0A0A0A' : '#F9FAFB',
    border: `2px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    borderRadius: '16px',
    color: isDark ? '#FFFFFF' : '#000000',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'monospace',
    caretColor: isDark ? '#FFFFFF' : '#000000'
  },
  otpBoxFilled: {
    borderColor: isDark ? '#FFFFFF' : '#000000',
    background: isDark ? '#1A1A1A' : '#FFFFFF'
  },
  otpBoxFocused: {
    borderColor: isDark ? '#FFFFFF' : '#000000',
    boxShadow: isDark 
      ? '0 0 0 3px rgba(255, 255, 255, 0.1)'
      : '0 0 0 3px rgba(0, 0, 0, 0.1)',
    transform: 'scale(1.02)'
  },
  verifyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px',
    background: isDark ? '#FFFFFF' : '#000000',
    border: 'none',
    borderRadius: '16px',
    color: isDark ? '#000000' : '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  resendSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const
  },
  resendText: {
    fontSize: '13px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    margin: 0
  },
  resendButton: {
    background: 'transparent',
    border: 'none',
    color: isDark ? '#FFFFFF' : '#000000',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'underline'
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
  },
  footerText: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginBottom: '16px'
  },
  loginLink: {
    color: isDark ? '#FFFFFF' : '#000000',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  securityIcon: {
    width: '16px',
    height: '16px',
    color: isDark ? '#FFFFFF' : '#000000'
  },
  securityText: {
    fontSize: '12px',
    color: isDark ? '#6B7280' : '#9CA3AF'
  },
  buttonIcon: {
    width: '18px',
    height: '18px'
  }
});

export default Signup;