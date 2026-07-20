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
//   ShieldCheckIcon,
//   ExclamationTriangleIcon,
//   ClockIcon,
//   ArrowLeftIcon
// } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// const Signup: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [showOtpForm, setShowOtpForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const [toastColor, setToastColor] = useState('success');
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [resendTimer, setResendTimer] = useState(0);
//   const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string>('');
//   const [showErrorPopup, setShowErrorPopup] = useState(false);
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

//   const showErrorModal = (title: string, message: string) => {
//     setErrorMessage(`${title}: ${message}`);
//     setShowErrorPopup(true);
//     setTimeout(() => setShowErrorPopup(false), 5000);
//   };

//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email.includes('@') || !email.includes('.')) {
//       showErrorModal('Invalid Email', 'Please enter a valid email address');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE}/auth/signup/send-otp`, {
//         email,
//         role
//       });
      
//       if (response.status === 200) {
//         showNotification('OTP sent successfully! Check your email', 'success');
//         setShowOtpForm(true);
//         setResendTimer(60);
//       }
//     } catch (error: any) {
//       let errorMsg = '';
//       const data = error.response?.data;
      
//       if (data?.detail?.message) {
//         errorMsg = data.detail.message;
//       } else if (data?.detail?.error) {
//         errorMsg = data.detail.error;
//       } else if (typeof data?.detail === 'string') {
//         errorMsg = data.detail;
//       } else if (data?.message) {
//         errorMsg = data.message;
//       } else {
//         errorMsg = 'Failed to send OTP. Please try again';
//       }
      
//       showErrorModal('OTP Failed', errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOtp = async () => {
//     if (resendTimer > 0) {
//       showErrorModal('Please Wait', `Please wait ${resendTimer} seconds before requesting another OTP`);
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE}/auth/signup/send-otp`, {
//         email,
//         role
//       });
      
//       if (response.status === 200) {
//         showNotification('OTP resent successfully!', 'success');
//         setResendTimer(60);
//       }
//     } catch (error: any) {
//       let errorMsg = '';
//       let waitTime = 0;
//       const data = error.response?.data;
      
//       if (data?.detail?.error === 'otp_resend_too_soon' || 
//           (data?.detail?.message && data.detail.message.includes('wait'))) {
//         const match = data.detail.message?.match(/(\d+)/);
//         if (match) {
//           waitTime = parseInt(match[1]);
//           errorMsg = `Please wait ${waitTime} seconds before requesting another OTP`;
//         } else {
//           errorMsg = 'OTP was sent recently. Please wait before requesting another one.';
//         }
//       } else if (data?.detail?.message) {
//         errorMsg = data.detail.message;
//       } else if (data?.detail?.error) {
//         errorMsg = data.detail.error;
//       } else if (typeof data?.detail === 'string') {
//         errorMsg = data.detail;
//       } else {
//         errorMsg = 'Failed to resend OTP';
//       }
      
//       showErrorModal('Resend Failed', errorMsg);
      
//       if (waitTime > 0 && waitTime > resendTimer) {
//         setResendTimer(waitTime);
//       }
//     } finally {
//       setLoading(false);
//     }
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
//       showErrorModal('Invalid OTP', 'Please enter complete 6-digit OTP');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE}/auth/signup`, {
//         email,
//         otp: otpValue,
//         role
//       });
      
//       if (response.status === 200) {
//         showNotification('Signup successful! Redirecting to login...', 'success');
//         setTimeout(() => {
//           history.push('/login');
//         }, 1500);
//       }
//     } catch (error: any) {
//       let errorMsg = '';
//       const data = error.response?.data;
      
//       if (data?.detail?.message) {
//         errorMsg = data.detail.message;
//       } else if (data?.detail?.error) {
//         errorMsg = data.detail.error;
//       } else if (typeof data?.detail === 'string') {
//         errorMsg = data.detail;
//       } else if (data?.message) {
//         errorMsg = data.message;
//       } else {
//         errorMsg = 'Invalid OTP. Please try again';
//       }
      
//       showErrorModal('Verification Failed', errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBackToEmail = () => {
//     setShowOtpForm(false);
//     setOtp(['', '', '', '', '', '']);
//     setErrorMessage('');
//   };

//   const styles = getStyles(isDarkMode);

//   return (
//     <IonPage>
//       <IonContent style={{ '--background': isDarkMode ? '#000000' : '#F8F9FA' } as any}>
//         <div style={styles.container}>
          
//           {/* Background Decoration */}
//           <div style={styles.bgDecoration} />
          
//           {/* Error Popup */}
//           {showErrorPopup && (
//             <div style={styles.errorPopup}>
//               <div style={styles.errorPopupContent}>
//                 <div style={styles.errorIconContainer}>
//                   <ExclamationTriangleIcon style={styles.errorIcon} />
//                 </div>
//                 <div style={styles.errorTextContainer}>
//                   <h4 style={styles.errorTitle}>Error</h4>
//                   <p style={styles.errorMessage}>{errorMessage}</p>
//                 </div>
//                 <button 
//                   onClick={() => setShowErrorPopup(false)}
//                   style={styles.errorCloseBtn}
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//           )}
          
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
//                   : `Enter the verification code sent to ${email}`}
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
//                   <button onClick={handleBackToEmail} style={styles.backButton}>
//                     <ArrowLeftIcon style={styles.backIcon} />
//                     <span>Back to email</span>
//                   </button>
                  
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
//                         onFocus={() => setFocusedOtpIndex(index)}
//                         onBlur={() => setFocusedOtpIndex(null)}
//                         style={{
//                           ...styles.otpBox,
//                           ...(digit && styles.otpBoxFilled),
//                           ...(focusedOtpIndex === index && styles.otpBoxFocused)
//                         }}
//                         autoFocus={index === 0}
//                       />
//                     ))}
//                   </div>
                  
//                   <button type="submit" style={styles.verifyButton} disabled={loading}>
//                     <CheckCircleIcon style={styles.buttonIcon} />
//                     <span>Verify OTP</span>
//                   </button>
                  
//                   <div style={styles.resendSection}>
//                     <div style={styles.resendCard}>
//                       <ClockIcon style={styles.clockIcon} />
//                       <div>
//                         <p style={styles.resendText}>
//                           Didn't receive the code?
//                         </p>
//                         <button
//                           type="button"
//                           onClick={handleResendOtp}
//                           disabled={resendTimer > 0 || loading}
//                           style={{
//                             ...styles.resendButton,
//                             opacity: resendTimer > 0 ? 0.5 : 1,
//                             cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
//                           }}
//                         >
//                           {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
//                         </button>
//                       </div>
//                     </div>
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
//     background: 'linear-gradient(135deg, #FFFFFF10, #FFFFFF05)',
//     borderRadius: '0 0 50% 50%',
//     filter: 'blur(60px)'
//   },
//   errorPopup: {
//     position: 'fixed' as const,
//     top: '20px',
//     left: '50%',
//     transform: 'translateX(-50%)',
//     zIndex: 1000,
//     animation: 'slideDown 0.3s ease-out'
//   },
//   errorPopupContent: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//     background: isDark ? '#1A1A1A' : '#FFFFFF',
//     border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
//     borderRadius: '16px',
//     padding: '16px 20px',
//     boxShadow: isDark 
//       ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
//       : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
//     backdropFilter: 'blur(10px)',
//     minWidth: '300px',
//     maxWidth: '400px'
//   },
//   errorIconContainer: {
//     width: '40px',
//     height: '40px',
//     borderRadius: '20px',
//     background: '#EF444420',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   errorIcon: {
//     width: '20px',
//     height: '20px',
//     color: '#EF4444'
//   },
//   errorTextContainer: {
//     flex: 1
//   },
//   errorTitle: {
//     fontSize: '14px',
//     fontWeight: '600',
//     color: '#EF4444',
//     margin: 0,
//     marginBottom: '4px'
//   },
//   errorMessage: {
//     fontSize: '12px',
//     color: isDark ? '#D1D5DB' : '#4B5563',
//     margin: 0
//   },
//   errorCloseBtn: {
//     background: 'transparent',
//     border: 'none',
//     color: isDark ? '#9CA3AF' : '#6B7280',
//     cursor: 'pointer',
//     fontSize: '16px',
//     padding: '4px'
//   },
//   card: {
//     maxWidth: '480px',
//     width: '100%',
//     background: isDark ? '#0A0A0A' : '#FFFFFF',
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
//     background: isDark ? '#FFFFFF' : '#000000',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     boxShadow: isDark 
//       ? '0 8px 20px rgba(255, 255, 255, 0.1)'
//       : '0 8px 20px rgba(0, 0, 0, 0.1)'
//   },
//   mainIcon: {
//     width: '40px',
//     height: '40px',
//     color: isDark ? '#000000' : '#FFFFFF'
//   },
//   header: {
//     textAlign: 'center' as const,
//     marginBottom: '32px'
//   },
//   title: {
//     fontSize: '32px',
//     fontWeight: 'bold',
//     color: isDark ? '#FFFFFF' : '#000000',
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
//     background: isDark ? '#FFFFFF' : '#000000',
//     border: 'none',
//     borderRadius: '16px',
//     color: isDark ? '#000000' : '#FFFFFF',
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
//   backButton: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     background: 'transparent',
//     border: 'none',
//     color: isDark ? '#9CA3AF' : '#6B7280',
//     fontSize: '14px',
//     cursor: 'pointer',
//     padding: '8px 0',
//     width: 'fit-content',
//     transition: 'all 0.2s'
//   },
//   backIcon: {
//     width: '18px',
//     height: '18px'
//   },
//   otpBoxContainer: {
//     display: 'flex',
//     gap: '10px',
//     justifyContent: 'center',
//     flexWrap: 'wrap' as const
//   },
//   otpBox: {
//     width: '50px',
//     height: '56px',
//     textAlign: 'center' as const,
//     fontSize: '22px',
//     fontWeight: '600',
//     background: isDark ? '#0A0A0A' : '#F9FAFB',
//     border: `2px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
//     borderRadius: '14px',
//     color: isDark ? '#FFFFFF' : '#000000',
//     outline: 'none',
//     transition: 'all 0.2s ease',
//     fontFamily: 'monospace',
//     caretColor: isDark ? '#FFFFFF' : '#000000'
//   },
//   otpBoxFilled: {
//     borderColor: isDark ? '#FFFFFF' : '#000000',
//     background: isDark ? '#1A1A1A' : '#FFFFFF'
//   },
//   otpBoxFocused: {
//     borderColor: isDark ? '#FFFFFF' : '#000000',
//     boxShadow: isDark 
//       ? '0 0 0 3px rgba(255, 255, 255, 0.1)'
//       : '0 0 0 3px rgba(0, 0, 0, 0.1)',
//     transform: 'scale(1.02)'
//   },
//   verifyButton: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '10px',
//     width: '100%',
//     padding: '16px',
//     background: isDark ? '#FFFFFF' : '#000000',
//     border: 'none',
//     borderRadius: '16px',
//     color: isDark ? '#000000' : '#FFFFFF',
//     fontSize: '16px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s'
//   },
//   resendSection: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   resendCard: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//     padding: '12px 20px',
//     background: isDark ? '#1A1A1A' : '#F9FAFB',
//     borderRadius: '16px',
//     border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`
//   },
//   clockIcon: {
//     width: '20px',
//     height: '20px',
//     color: isDark ? '#9CA3AF' : '#6B7280'
//   },
//   resendText: {
//     fontSize: '12px',
//     color: isDark ? '#9CA3AF' : '#6B7280',
//     margin: 0,
//     marginBottom: '4px'
//   },
//   resendButton: {
//     background: 'transparent',
//     border: 'none',
//     color: isDark ? '#FFFFFF' : '#000000',
//     fontSize: '13px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     padding: 0
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
//     color: isDark ? '#FFFFFF' : '#000000',
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
//     color: isDark ? '#FFFFFF' : '#000000'
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

// // Add CSS animation
// const styleSheet = document.createElement("style");
// styleSheet.textContent = `
//   @keyframes slideDown {
//     from {
//       opacity: 0;
//       transform: translateX(-50%) translateY(-20px);
//     }
//     to {
//       opacity: 1;
//       transform: translateX(-50%) translateY(0);
//     }
//   }
// `;
// document.head.appendChild(styleSheet);

// export default Signup;


import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowLeftIcon,
  SparklesIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

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
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  
  // Fix: Use proper ref array with useRef
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

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

  // Check if OTP is complete
  useEffect(() => {
    setIsOtpComplete(otp.every(digit => digit !== ''));
  }, [otp]);

  // Focus first OTP input when OTP form appears
  useEffect(() => {
    if (showOtpForm) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showOtpForm]);

  const showNotification = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg(message);
    setToastColor(color);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const showErrorModal = (title: string, message: string) => {
    setErrorMessage(`${title}: ${message}`);
    setShowErrorPopup(true);
    setTimeout(() => setShowErrorPopup(false), 5000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      showErrorModal('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/signup/send-otp`, {
        email,
        role
      });
      
      if (response.status === 200) {
        showNotification('OTP sent successfully! Check your email', 'success');
        setShowOtpForm(true);
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error: any) {
      let errorMsg = '';
      const data = error.response?.data;
      
      if (data?.detail?.message) {
        errorMsg = data.detail.message;
      } else if (data?.detail?.error) {
        errorMsg = data.detail.error;
      } else if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else if (data?.message) {
        errorMsg = data.message;
      } else {
        errorMsg = 'Failed to send OTP. Please try again';
      }
      
      showErrorModal('OTP Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      showErrorModal('Please Wait', `Please wait ${resendTimer} seconds before requesting another OTP`);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/signup/send-otp`, {
        email,
        role
      });
      
      if (response.status === 200) {
        showNotification('OTP resent successfully!', 'success');
        setResendTimer(60);
      }
    } catch (error: any) {
      let errorMsg = '';
      let waitTime = 0;
      const data = error.response?.data;
      
      if (data?.detail?.error === 'otp_resend_too_soon' || 
          (data?.detail?.message && data.detail.message.includes('wait'))) {
        const match = data.detail.message?.match(/(\d+)/);
        if (match) {
          waitTime = parseInt(match[1]);
          errorMsg = `Please wait ${waitTime} seconds before requesting another OTP`;
        } else {
          errorMsg = 'OTP was sent recently. Please wait before requesting another one.';
        }
      } else if (data?.detail?.message) {
        errorMsg = data.detail.message;
      } else if (data?.detail?.error) {
        errorMsg = data.detail.error;
      } else if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else {
        errorMsg = 'Failed to resend OTP';
      }
      
      showErrorModal('Resend Failed', errorMsg);
      
      if (waitTime > 0 && waitTime > resendTimer) {
        setResendTimer(waitTime);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = inputRefs.current[index + 1];
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      prevInput?.focus();
    }
    
    // Handle Enter key to submit
    if (e.key === 'Enter' && otp.every(digit => digit !== '')) {
      handleOtpSubmit(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    if (pastedData.length === 6 && /^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Auto-focus the last input
      const lastInput = inputRefs.current[5];
      lastInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showErrorModal('Invalid OTP', 'Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/signup`, {
        email,
        otp: otpValue,
        role
      });
      
      if (response.status === 200) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          history.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      let errorMsg = '';
      const data = error.response?.data;
      
      if (data?.detail?.message) {
        errorMsg = data.detail.message;
      } else if (data?.detail?.error) {
        errorMsg = data.detail.error;
      } else if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else if (data?.message) {
        errorMsg = data.message;
      } else {
        errorMsg = 'Invalid OTP. Please try again';
      }
      
      showErrorModal('Verification Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowOtpForm(false);
    setOtp(['', '', '', '', '', '']);
    setErrorMessage('');
  };

  // Fix: Proper ref assignment function
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const styles = getStyles(isDarkMode);

  return (
    <IonPage>
      <IonContent style={{ '--background': isDarkMode ? '#000000' : '#F8F9FA' } as any}>
        <div style={styles.container}>
          
          {/* Background Decoration */}
          <div style={styles.bgDecoration1} />
          <div style={styles.bgDecoration2} />
          <div style={styles.bgDecoration3} />
          
          {/* Error Popup */}
          {showErrorPopup && (
            <div style={styles.errorPopup}>
              <div style={styles.errorPopupContent}>
                <div style={styles.errorIconContainer}>
                  <ExclamationTriangleIcon style={styles.errorIcon} />
                </div>
                <div style={styles.errorTextContainer}>
                  <h4 style={styles.errorTitle}>Error</h4>
                  <p style={styles.errorMessage}>{errorMessage}</p>
                </div>
                <button 
                  onClick={() => setShowErrorPopup(false)}
                  style={styles.errorCloseBtn}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Success Popup */}
          {showSuccessPopup && (
            <div style={styles.successPopup}>
              <div style={styles.successPopupContent}>
                <div style={styles.successIconContainer}>
                  <CheckCircleIcon style={styles.successIcon} />
                </div>
                <h4 style={styles.successTitle}>🎉 Signup Successful!</h4>
                <p style={styles.successMessage}>
                  Your account has been created. Redirecting to login...
                </p>
              </div>
            </div>
          )}
          
          {/* Main Card */}
          <div style={styles.card}>
            
            {/* Logo/Icon Section */}
            <div style={styles.iconContainer}>
              <div style={styles.iconWrapper}>
                <TruckIcon style={styles.mainIcon} />
              </div>
              {!showOtpForm && (
                <div style={styles.badgeContainer}>
                  <UserPlusIcon style={styles.badgeIcon} />
                  <span style={styles.badgeText}>Driver</span>
                </div>
              )}
            </div>

            {/* Header */}
            <div style={styles.header}>
              <h1 style={styles.title}>
                {!showOtpForm ? 'Create Account' : 'Verify OTP'}
              </h1>
              <p style={styles.subtitle}>
                {!showOtpForm 
                  ? "Join as a driver and start your journey with us" 
                  : `We've sent a 6-digit code to ${email}`}
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
                      autoFocus
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
                  <button onClick={handleBackToEmail} style={styles.backButton}>
                    <ArrowLeftIcon style={styles.backIcon} />
                    <span>Back to email</span>
                  </button>
                  
                  <div style={styles.otpContainer}>
                    <div style={styles.otpBoxContainer}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={setInputRef(index)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          onFocus={() => setFocusedOtpIndex(index)}
                          onBlur={() => setFocusedOtpIndex(null)}
                          style={{
                            ...styles.otpBox,
                            ...(digit && styles.otpBoxFilled),
                            ...(focusedOtpIndex === index && styles.otpBoxFocused),
                            ...(isOtpComplete && styles.otpBoxComplete)
                          }}
                          autoFocus={index === 0}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                      ))}
                    </div>
                    
                    {isOtpComplete && (
                      <div style={styles.otpCompleteIndicator}>
                        <CheckCircleIcon style={styles.otpCompleteIcon} />
                        <span style={styles.otpCompleteText}>OTP complete</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    style={{
                      ...styles.verifyButton,
                      ...(isOtpComplete && styles.verifyButtonActive)
                    }} 
                    disabled={loading || !isOtpComplete}
                  >
                    <CheckCircleIcon style={styles.buttonIcon} />
                    <span>Verify Account</span>
                  </button>
                  
                  <div style={styles.resendSection}>
                    <div style={styles.resendCard}>
                      <ClockIcon style={styles.clockIcon} />
                      <div>
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
                <span style={styles.divider}>•</span>
                <DevicePhoneMobileIcon style={styles.securityIcon} />
                <span style={styles.securityText}>Mobile Ready</span>
              </div>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Processing..." />
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={3000}
          onDidDismiss={() => setToastMsg("")}
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
    padding: '16px',
    position: 'relative' as const,
    background: isDark ? '#000000' : '#F8F9FA',
    overflow: 'hidden' as const
  },
  bgDecoration1: {
    position: 'absolute' as const,
    top: '-200px',
    right: '-200px',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(96, 165, 250, 0.08), transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none' as const
  },
  bgDecoration2: {
    position: 'absolute' as const,
    bottom: '-200px',
    left: '-200px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06), transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none' as const
  },
  bgDecoration3: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.01), transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none' as const
  },
  errorPopup: {
    position: 'fixed' as const,
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    animation: 'slideDown 0.3s ease-out',
    maxWidth: '90%'
  },
  errorPopupContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: isDark ? '#1A1A1A' : '#FFFFFF',
    border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    borderRadius: '16px',
    padding: '16px 20px',
    boxShadow: isDark 
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    minWidth: '280px',
    maxWidth: '400px'
  },
  errorIconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    background: '#EF444420',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    color: '#EF4444'
  },
  errorTextContainer: {
    flex: 1,
    minWidth: 0
  },
  errorTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#EF4444',
    margin: 0,
    marginBottom: '4px'
  },
  errorMessage: {
    fontSize: '12px',
    color: isDark ? '#D1D5DB' : '#4B5563',
    margin: 0,
    wordBreak: 'break-word' as const
  },
  errorCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: isDark ? '#9CA3AF' : '#6B7280',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    flexShrink: 0
  },
  successPopup: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    animation: 'scaleIn 0.4s ease-out',
    maxWidth: '90%',
    width: '400px'
  },
  successPopupContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
    background: isDark ? '#1A1A1A' : '#FFFFFF',
    border: `2px solid ${isDark ? '#22C55E' : '#22C55E'}`,
    borderRadius: '24px',
    padding: '40px 32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center' as const
  },
  successIconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    background: '#22C55E20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'bounce 0.6s ease-out'
  },
  successIcon: {
    width: '48px',
    height: '48px',
    color: '#22C55E'
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#000000',
    margin: 0
  },
  successMessage: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    margin: 0
  },
  card: {
    maxWidth: '460px',
    width: '100%',
    background: isDark ? '#0A0A0A' : '#FFFFFF',
    borderRadius: '32px',
    padding: '32px 24px',
    boxShadow: isDark 
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
    position: 'relative' as const,
    zIndex: 2
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '24px',
    position: 'relative' as const
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
      : '0 8px 20px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  },
  mainIcon: {
    width: '40px',
    height: '40px',
    color: isDark ? '#000000' : '#FFFFFF'
  },
  badgeContainer: {
    position: 'absolute' as const,
    bottom: '-10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: isDark ? '#1A1A1A' : '#F3F4F6',
    padding: '4px 12px',
    borderRadius: '20px',
    border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  badgeIcon: {
    width: '14px',
    height: '14px',
    color: isDark ? '#FFFFFF' : '#000000'
  },
  badgeText: {
    fontSize: '12px',
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '28px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    lineHeight: '1.6',
    maxWidth: '320px',
    margin: '0 auto'
  },
  form: {
    marginBottom: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
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
    border: `2px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
    borderRadius: '16px',
    color: isDark ? '#FFFFFF' : '#111827',
    outline: 'none',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: isDark ? '#FFFFFF' : '#000000',
      boxShadow: isDark 
        ? '0 0 0 4px rgba(255, 255, 255, 0.05)'
        : '0 0 0 4px rgba(0, 0, 0, 0.05)'
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
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
    },
    '&:active': {
      transform: 'scale(0.98)'
    }
  },
  otpSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    color: isDark ? '#9CA3AF' : '#6B7280',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0',
    width: 'fit-content',
    transition: 'all 0.2s',
    '&:hover': {
      color: isDark ? '#FFFFFF' : '#000000'
    }
  },
  backIcon: {
    width: '18px',
    height: '18px'
  },
  otpContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px'
  },
  otpBoxContainer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    width: '100%'
  },
  otpBox: {
    flex: 1,
    maxWidth: '48px',
    height: '52px',
    textAlign: 'center' as const,
    fontSize: '20px',
    fontWeight: '600',
    background: isDark ? '#0A0A0A' : '#F9FAFB',
    border: `2px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    borderRadius: '12px',
    color: isDark ? '#FFFFFF' : '#000000',
    outline: 'none',
    transition: 'all 0.15s ease',
    fontFamily: 'monospace',
    caretColor: isDark ? '#FFFFFF' : '#000000',
    padding: 0
  },
  otpBoxFilled: {
    borderColor: isDark ? '#60A5FA' : '#3B82F6',
    background: isDark ? '#1A1A2E' : '#EFF6FF'
  },
  otpBoxFocused: {
    borderColor: isDark ? '#FFFFFF' : '#000000',
    boxShadow: isDark 
      ? '0 0 0 3px rgba(255, 255, 255, 0.1)'
      : '0 0 0 3px rgba(0, 0, 0, 0.1)',
    transform: 'scale(1.05)'
  },
  otpBoxComplete: {
    borderColor: '#22C55E',
    background: isDark ? '#1A2E1A' : '#F0FDF4'
  },
  otpCompleteIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    animation: 'fadeIn 0.3s ease-out'
  },
  otpCompleteIcon: {
    width: '16px',
    height: '16px',
    color: '#22C55E'
  },
  otpCompleteText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#22C55E'
  },
  verifyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px',
    background: isDark ? '#2A2A2A' : '#E5E7EB',
    border: 'none',
    borderRadius: '16px',
    color: isDark ? '#6B7280' : '#9CA3AF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    transition: 'all 0.2s',
    opacity: 0.6
  },
  verifyButtonActive: {
    background: isDark ? '#FFFFFF' : '#000000',
    color: isDark ? '#000000' : '#FFFFFF',
    cursor: 'pointer',
    opacity: 1,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
    }
  },
  resendSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resendCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: isDark ? '#1A1A1A' : '#F9FAFB',
    borderRadius: '16px',
    border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`
  },
  clockIcon: {
    width: '20px',
    height: '20px',
    color: isDark ? '#9CA3AF' : '#6B7280'
  },
  resendText: {
    fontSize: '12px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    margin: 0,
    marginBottom: '4px'
  },
  resendButton: {
    background: 'transparent',
    border: 'none',
    color: isDark ? '#FFFFFF' : '#000000',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    padding: 0
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
  },
  footerText: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginBottom: '12px'
  },
  loginLink: {
    color: isDark ? '#FFFFFF' : '#000000',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const
  },
  securityIcon: {
    width: '14px',
    height: '14px',
    color: isDark ? '#6B7280' : '#9CA3AF'
  },
  securityText: {
    fontSize: '11px',
    color: isDark ? '#6B7280' : '#9CA3AF'
  },
  divider: {
    fontSize: '12px',
    color: isDark ? '#2A2A2A' : '#E5E7EB'
  },
  buttonIcon: {
    width: '18px',
    height: '18px'
  }
});

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  input[type="text"]:focus {
    outline: none;
  }
`;
document.head.appendChild(styleSheet);

export default Signup;