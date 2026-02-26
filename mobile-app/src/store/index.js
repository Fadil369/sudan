/**
 * Redux Store Configuration
 * SGDUS Mobile App State Management
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import citizenReducer from './slices/citizenSlice';
import servicesReducer from './slices/servicesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    citizen: citizenReducer,
    services: servicesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore paths that might have non-serializable values
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
});

export default store;
