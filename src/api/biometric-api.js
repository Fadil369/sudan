import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// Mock server-side storage for credentials
const mockCredentials = {};

export const registerBiometric = async (username) => {
  try {
    // Simulate server-side request for registration options
    const registrationOptions = {
      rp: {
        name: 'SudanGovPortal',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(username),
        name: username,
        displayName: username,
      },
      challenge: new Uint8Array(32),
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'direct',
    };

    const attResp = await startRegistration(registrationOptions);

    // Simulate server-side verification and storage
    mockCredentials[username] = attResp;
    console.log('Biometric registration successful:', attResp);
    return { success: true, message: 'Biometric registration successful!' };
  } catch (error) {
    console.error('Biometric registration failed:', error);
    return { success: false, message: `Biometric registration failed: ${error.message}` };
  }
};

export const authenticateBiometric = async (username) => {
  try {
    const credential = mockCredentials[username];
    if (!credential) {
      throw new Error('No biometric credential found for this user.');
    }

    // Simulate server-side request for authentication options
    const authenticationOptions = {
      challenge: new Uint8Array(32),
      allowCredentials: [{
        id: credential.rawId,
        type: 'public-key',
        transports: ['internal', 'hybrid'],
      }],
      userVerification: 'required',
      timeout: 60000,
    };

    const authResp = await startAuthentication(authenticationOptions);

    // Simulate server-side verification
    console.log('Biometric authentication successful:', authResp);
    return { success: true, message: 'Biometric authentication successful!' };
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return { success: false, message: `Biometric authentication failed: ${error.message}` };
  }
};
