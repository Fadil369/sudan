/**
 * Biometric Service - Fingerprint & Face ID Integration
 * SGDUS Mobile App
 */

import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

/**
 * Check if biometric authentication is available
 */
export const checkBiometricAvailability = async () => {
  try {
    const { available, biometryTypes } = await rnBiometrics.isSensorAvailable();
    return {
      available,
      biometryType: biometryTypes?.[0] || null, // 'FaceID', 'TouchID', 'Biometrics'
    };
  } catch (error) {
    console.error('Biometric check error:', error);
    return { available: false, biometryType: null };
  }
};

/**
 * Authenticate with biometrics
 */
export const authenticateWithBiometrics = async (promptMessage = 'Verify your identity') => {
  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });
    return { success };
  } catch (error) {
    console.error('Biometric auth error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create biometric keys for secure storage
 */
export const createBiometricKeys = async () => {
  try {
    const { publicKey } = await rnBiometrics.createKeys();
    return { success: true, publicKey };
  } catch (error) {
    console.error('Key creation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete biometric keys
 */
export const deleteBiometricKeys = async () => {
  try {
    const { keysDeleted } = await rnBiometrics.deleteKeys();
    return { success: keysDeleted };
  } catch (error) {
    console.error('Key deletion error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if keys exist
 */
export const checkBiometricKeys = async () => {
  try {
    const { keysExist } = await rnBiometrics.biometricKeysExist();
    return { keysExist };
  } catch (error) {
    console.error('Key check error:', error);
    return { keysExist: false };
  }
};

/**
 * Face ID / Touch ID specific handlers
 */
export const biometricTypes = {
  FACE_ID: 'FaceID',
  TOUCH_ID: 'TouchID',
  BIOMETRICS: 'Biometrics',
};

/**
 * Get biometric type display name
 */
export const getBiometricTypeName = (type) => {
  switch (type) {
    case biometricTypes.FACE_ID:
      return 'Face ID';
    case biometricTypes.TOUCH_ID:
      return 'Touch ID';
    case biometricTypes.BIOMETRICS:
      return 'Fingerprint';
    default:
      return 'Biometrics';
  }
};

export default {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  createBiometricKeys,
  deleteBiometricKeys,
  checkBiometricKeys,
  getBiometricTypeName,
  biometricTypes,
};
