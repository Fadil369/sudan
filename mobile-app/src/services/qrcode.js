/**
 * QR Code Service - Identity Verification
 * SGDUS Mobile App
 * 
 * Enables quick identity verification via QR codes
 * OID Root: 1.3.6.1.4.1.61026
 */

import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Generate QR data for citizen
 */
export const generateQRData = (oid, options = {}) => {
  const { includeBasicInfo = true, citizenData = null, expiryMinutes = 60 } = options;
  
  const qrData = {
    oid: oid,
    timestamp: Date.now(),
    expiry: Date.now() + (expiryMinutes * 60 * 1000),
    signature: generateSignature(oid),
  };
  
  if (includeBasicInfo && citizenData) {
    qrData.name = citizenData.name;
    qrData.state = citizenData.state;
  }
  
  return JSON.stringify(qrData);
};

/**
 * Generate mock signature (in production, use cryptographic signing)
 */
const generateSignature = (oid) => {
  // Simple hash for demo - in production use proper crypto
  const data = `${oid}:${Date.now()}:sgdus`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

/**
 * Validate QR code data
 */
export const validateQRData = (qrString) => {
  try {
    const data = JSON.parse(qrString);
    
    // Check required fields
    if (!data.oid || !data.timestamp || !data.expiry || !data.signature) {
      return { valid: false, error: 'Invalid QR format' };
    }
    
    // Check expiry
    if (Date.now() > data.expiry) {
      return { valid: false, error: 'QR code expired' };
    }
    
    // Verify signature
    const expectedSignature = generateSignature(data.oid);
    if (data.signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    return { 
      valid: true, 
      data: {
        oid: data.oid,
        name: data.name,
        state: data.state,
      }
    };
  } catch (error) {
    return { valid: false, error: 'Parse error' };
  }
};

/**
 * QR Code Component for display
 */
export const QRCodeDisplay = ({ oid, citizenData, size = 200 }) => {
  const qrData = generateQRData(oid, { 
    includeBasicInfo: true, 
    citizenData 
  });
  
  return (
    <View style={styles.qrContainer}>
      <QRCode
        value={qrData}
        size={size}
        backgroundColor="white"
        color="black"
      />
      <Text style={styles.oidText}>{oid}</Text>
    </View>
  );
};

/**
 * Share QR code image
 */
export const shareQRCode = async (oid, citizenData) => {
  try {
    const qrData = generateQRData(oid, { 
      includeBasicInfo: true, 
      citizenData,
      expiryMinutes: 1440 // 24 hours for shared codes
    });
    
    await Share.open({
      title: 'My SGDUS Identity',
      message: `My Government Identity:\nOID: ${oid}\n\nVerify with SGDUS app`,
      url: `data:image/png;base64,${qrData}`,
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Generate verification QR for specific service
 */
export const generateServiceQR = (oid, serviceCode, purpose) => {
  const qrData = {
    oid,
    service: serviceCode,
    purpose,
    timestamp: Date.now(),
    expiry: Date.now() + (30 * 60 * 1000), // 30 minutes
    signature: generateSignature(`${oid}:${serviceCode}:${purpose}`),
  };
  
  return JSON.stringify(qrData);
};

/**
 * Parse QR code from scanner
 */
export const parseScannedQR = async (scannedData) => {
  return validateQRData(scannedData);
};

/**
 * Offline QR verification (without server)
 */
export const offlineVerifyQR = (qrString) => {
  const result = validateQRData(qrString);
  if (result.valid) {
    return {
      verified: true,
      oid: result.data.oid,
      message: 'Verified offline',
    };
  }
  return {
    verified: false,
    message: result.error,
  };
};

const styles = StyleSheet.create({
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  oidText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666',
  },
});

export default {
  generateQRData,
  validateQRData,
  QRCodeDisplay,
  shareQRCode,
  generateServiceQR,
  parseScannedQR,
  offlineVerifyQR,
};
