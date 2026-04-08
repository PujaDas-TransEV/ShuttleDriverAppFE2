import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  EnvelopeIcon,
  KeyIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

interface ErrorDetail {
  error?: string;
  message?: string;
}

const Login: React.FC = () => {
  const history = useHistory();

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

  const showErrorModal = (title: string, message: string) => {
    setErrorMessage(`${title}: ${message}`);
    setShowErrorPopup(true);
    setTimeout(() => setShowErrorPopup(false), 5000);
  };

  const handleEmailSubmit = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      showErrorModal('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Handle different error formats
        let errorMsg = '';
        if (data.detail?.message) {
          errorMsg = data.detail.message;
        } else if (data.detail?.error) {
          errorMsg = data.detail.error;
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (data.message) {
          errorMsg = data.message;
        } else {
          errorMsg = 'Failed to send OTP';
        }
        
        showErrorModal('OTP Failed', errorMsg);
        throw new Error(errorMsg);
      }

      setShowOtpForm(true);
      setResendTimer(60);
      showNotification(`OTP sent successfully to ${email}`, 'success');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      // Error already shown in modal
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
      const res = await fetch(`${API_BASE}/auth/login/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        let errorMsg = '';
        let waitTime = 0;
        
        // Check for specific error types
        if (data.detail?.error === 'otp_resend_too_soon' || 
            (data.detail?.message && data.detail.message.includes('wait'))) {
          // Extract wait time from message if possible
          const match = data.detail.message?.match(/(\d+)/);
          if (match) {
            waitTime = parseInt(match[1]);
            errorMsg = `Please wait ${waitTime} seconds before requesting another OTP`;
          } else {
            errorMsg = 'OTP was sent recently. Please wait before requesting another one.';
          }
        } else if (data.detail?.message) {
          errorMsg = data.detail.message;
        } else if (data.detail?.error) {
          errorMsg = data.detail.error;
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else {
          errorMsg = 'Failed to resend OTP';
        }
        
        showErrorModal('Resend Failed', errorMsg);
        
        // If server returns a wait time, use it
        if (waitTime > 0 && waitTime > resendTimer) {
          setResendTimer(waitTime);
        }
        
        throw new Error(errorMsg);
      }

      setResendTimer(60);
      showNotification(`OTP resent successfully to ${email}`, 'success');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showErrorModal('Invalid OTP', 'Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMsg = '';
        if (data.detail?.message) {
          errorMsg = data.detail.message;
        } else if (data.detail?.error) {
          errorMsg = data.detail.error;
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else {
          errorMsg = 'Invalid OTP. Please try again.';
        }
        
        showErrorModal('Login Failed', errorMsg);
        throw new Error(errorMsg);
      }

      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      showNotification('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        history.push('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowOtpForm(false);
    setOtp(['', '', '', '', '', '']);
    setErrorMessage('');
  };

  const styles = getStyles(isDarkMode);

  return (
    <IonPage>
      <IonContent style={{ '--background': isDarkMode ? '#000000' : '#F8F9FA' } as any}>
        <div style={styles.container}>
          
          {/* Background Decoration */}
          <div style={styles.bgDecoration} />
          
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
              <h1 style={styles.title}>Welcome Back</h1>
              <p style={styles.subtitle}>
                {!showOtpForm 
                  ? "Sign in to your driver account" 
                  : `Enter the verification code sent to ${email}`}
              </p>
            </div>

            {/* Form */}
            <div style={styles.form}>
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
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEmailSubmit();
                        }
                      }}
                    />
                  </div>
                  <button 
                    onClick={handleEmailSubmit} 
                    style={styles.submitButton} 
                    disabled={loading}
                  >
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
                  
                  <button onClick={handleOtpSubmit} style={styles.verifyButton} disabled={loading}>
                    <span>Verify OTP</span>
                    <ArrowRightIcon style={styles.buttonIcon} />
                  </button>
                  
                  <div style={styles.resendSection}>
                    <div style={styles.resendCard}>
                      <ClockIcon style={styles.clockIcon} />
                      <div>
                        <p style={styles.resendText}>
                          Didn't receive the code?
                        </p>
                        <button
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
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <p style={styles.footerText}>
                Don't have an account?{' '}
                <span
                  onClick={() => history.push('/signup')}
                  style={styles.signupLink}
                >
                  Sign Up
                </span>
              </p>
              <div style={styles.securityBadge}>
                <ShieldCheckIcon style={styles.securityIcon} />
                <span style={styles.securityText}>Secure Login</span>
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
  errorPopup: {
    position: 'fixed' as const,
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    animation: 'slideDown 0.3s ease-out'
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
    minWidth: '300px',
    maxWidth: '400px'
  },
  errorIconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    background: '#EF444420',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    color: '#EF4444'
  },
  errorTextContainer: {
    flex: 1
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
    margin: 0
  },
  errorCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: isDark ? '#9CA3AF' : '#6B7280',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px'
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
    transition: 'all 0.2s'
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
    transition: 'all 0.2s'
  },
  backIcon: {
    width: '18px',
    height: '18px'
  },
  // CHANGED: OTP box container - now forces single row
  otpBoxContainer: {
    display: 'flex',
    gap: '8px',  // Reduced gap
    justifyContent: 'center',
    flexWrap: 'nowrap' as const,  // Force single row
    width: '100%'
  },
  // CHANGED: OTP box size - smaller
  otpBox: {
    width: '48px',  // Smaller width
    height: '52px', // Smaller height
    textAlign: 'center' as const,
    fontSize: '20px', // Smaller font
    fontWeight: '600',
    background: isDark ? '#0A0A0A' : '#F9FAFB',
    border: `2px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    borderRadius: '12px', // Smaller border radius
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
    paddingTop: '24px',
    borderTop: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
  },
  footerText: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginBottom: '16px'
  },
  signupLink: {
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

// Add CSS animation
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
`;
document.head.appendChild(styleSheet);

export default Login;