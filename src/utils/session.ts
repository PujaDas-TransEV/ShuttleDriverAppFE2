import { Preferences } from '@capacitor/preferences';
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};


export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'refresh_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};


export const setTokens = async (accessToken: string, expiresAt: string, refreshToken?: string): Promise<boolean> => {
  try {
    await Preferences.set({ key: 'access_token', value: accessToken });
    await Preferences.set({ key: 'expires_at', value: expiresAt });
    
    if (refreshToken) {
      await Preferences.set({ key: 'refresh_token', value: refreshToken });
    }
    
   
    await Preferences.set({ key: 'login_timestamp', value: Date.now().toString() });
    
    console.log('Tokens saved successfully');
    console.log('Expires at:', expiresAt);
    return true;
  } catch (error) {
    console.error('Error saving tokens:', error);
    return false;
  }
};


export const clearTokens = async (): Promise<void> => {
  try {
    await Preferences.remove({ key: 'access_token' });
    await Preferences.remove({ key: 'refresh_token' });
    await Preferences.remove({ key: 'expires_at' });
    await Preferences.remove({ key: 'login_timestamp' });
    console.log('All tokens cleared');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};


export const isTokenValid = async (): Promise<boolean> => {
  const token = await getAccessToken();
  
  if (!token) {
    console.log('No token found');
    return false;
  }

  try {
    const { value: expiresAtStr } = await Preferences.get({ key: 'expires_at' });
    
    if (!expiresAtStr) {
      console.log('No expires_at found');
      return false;
    }
    
    const expiresAt = new Date(expiresAtStr);
    const now = new Date();
    const isValid = expiresAt > now;
    
    if (!isValid) {
      console.log('Token expired at:', expiresAt.toISOString());
      console.log('Current time:', now.toISOString());
    } else {
      const timeLeft = expiresAt.getTime() - now.getTime();
      const hoursLeft = timeLeft / (1000 * 60 * 60);
      console.log(`Token valid for ${hoursLeft.toFixed(2)} more hours`);
    }
    
    return isValid;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};


export const isSessionExpired = async (): Promise<boolean> => {

  const tokenValid = await isTokenValid();
  
  if (!tokenValid) {
    console.log('Session expired: Token is invalid');
    await clearTokens(); 
    return true;
  }

 
  const { value: loginTimeStr } = await Preferences.get({ key: 'login_timestamp' });
  
  if (loginTimeStr) {
    const loginTime = parseInt(loginTimeStr, 10);
    const threeMonthsInMs = 3 * 30 * 24 * 60 * 60 * 1000;
    const timeElapsed = Date.now() - loginTime;
    
    if (timeElapsed > threeMonthsInMs) {
      console.log('Session expired: 3 months passed');
      await clearTokens();
      return true;
    }
    
   
    const daysLeft = Math.floor((threeMonthsInMs - timeElapsed) / (24 * 60 * 60 * 1000));
    console.log(`Session valid for ${daysLeft} more days`);
  }

  return false;
};


export const getExpiresAt = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: 'expires_at' });
  return value || null;
};


export const logout = async (): Promise<void> => {
  await clearTokens();
  console.log('User logged out successfully');
};