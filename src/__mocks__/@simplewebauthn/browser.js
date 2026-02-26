// Manual Jest mock for @simplewebauthn/browser
// Provides mocked startRegistration and startAuthentication functions used in tests.
module.exports = {
  startRegistration: async (options) => {
    // Return a fake attestation object similar to what the real lib would return
    return Promise.resolve({
      id: 'mock-registration-id',
      rawId: 'mock-raw-id',
      response: {
        clientDataJSON: 'mock-client-data',
        attestationObject: 'mock-attestation'
      },
      type: 'public-key'
    });
  },
  startAuthentication: async (options) => {
    // Return a fake assertion object
    return Promise.resolve({
      id: 'mock-auth-id',
      rawId: 'mock-raw-id',
      response: {
        clientDataJSON: 'mock-client-data',
        authenticatorData: 'mock-auth-data',
        signature: 'mock-signature',
        userHandle: null
      },
      type: 'public-key'
    });
  }
};
