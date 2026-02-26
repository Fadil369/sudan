/**
 * Offline Service - Offline-First Architecture
 * SGDUS Mobile App
 * 
 * Enables functionality in areas with poor/no connectivity
 * Critical for rural Sudan where network coverage is limited
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Storage keys
const OFFLINE_QUEUE_KEY = '@sgdus_offline_queue';
const CACHED_DATA_KEY = '@sgdus_cached_data';
const LAST_SYNC_KEY = '@sgdus_last_sync';

/**
 * Check network connectivity
 */
export const checkConnectivity = async () => {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected,
    type: state.type,
    isInternetReachable: state.isInternetReachable,
  };
};

/**
 * Add request to offline queue
 */
export const queueOfflineRequest = async (request) => {
  try {
    const queue = await getOfflineQueue();
    queue.push({
      ...request,
      timestamp: Date.now(),
      id: generateUUID(),
    });
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return { success: true, queued: queue.length };
  } catch (error) {
    console.error('Queue error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get offline queue
 */
export const getOfflineQueue = async () => {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Get queue error:', error);
    return [];
  }
};

/**
 * Process offline queue when online
 */
export const processOfflineQueue = async (apiCall) => {
  const { isConnected } = await checkConnectivity();
  
  if (!isConnected) {
    return { success: false, message: 'Offline' };
  }
  
  const queue = await getOfflineQueue();
  const results = [];
  
  for (const request of queue) {
    try {
      const result = await apiCall(request);
      results.push({ id: request.id, success: true, result });
    } catch (error) {
      results.push({ id: request.id, success: false, error: error.message });
    }
  }
  
  // Clear processed items
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([]));
  await updateLastSync();
  
  return { success: true, results };
};

/**
 * Cache data locally
 */
export const cacheData = async (key, data) => {
  try {
    const cached = await getCachedData();
    cached[key] = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHED_DATA_KEY, JSON.stringify(cached));
    return { success: true };
  } catch (error) {
    console.error('Cache error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get cached data
 */
export const getCachedData = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHED_DATA_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Get cache error:', error);
    return {};
  }
};

/**
 * Get cached item with expiry check
 */
export const getCachedItem = async (key, maxAgeMs = 3600000) => {
  const cached = await getCachedData();
  const item = cached[key];
  
  if (!item) return null;
  
  const age = Date.now() - item.timestamp;
  if (age > maxAgeMs) return null;
  
  return item.data;
};

/**
 * Update last sync timestamp
 */
export const updateLastSync = async () => {
  await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
};

/**
 * Get last sync time
 */
export const getLastSync = async () => {
  const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
  return timestamp ? parseInt(timestamp) : null;
};

/**
 * Clear all offline data
 */
export const clearOfflineData = async () => {
  await AsyncStorage.multiRemove([
    OFFLINE_QUEUE_KEY,
    CACHED_DATA_KEY,
    LAST_SYNC_KEY,
  ]);
};

/**
 * Generate UUID
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Offline-aware API wrapper
 */
export const offlineAwareFetch = async (apiCall, options = {}) => {
  const { cacheKey, cacheExpiryMs = 3600000, queueWhenOffline = true } = options;
  
  // Check connectivity
  const { isConnected } = await checkConnectivity();
  
  if (isConnected) {
    try {
      const result = await apiCall();
      
      // Cache successful response
      if (cacheKey && result.success) {
        await cacheData(cacheKey, result.data);
      }
      
      return result;
    } catch (error) {
      // If API fails, try to return cached data
      if (cacheKey) {
        const cached = await getCachedItem(cacheKey, cacheExpiryMs);
        if (cached) {
          return { success: true, data: cached, fromCache: true };
        }
      }
      throw error;
    }
  } else {
    // Offline - return cached data
    if (cacheKey) {
      const cached = await getCachedItem(cacheKey, cacheExpiryMs);
      if (cached) {
        return { success: true, data: cached, fromCache: true, offline: true };
      }
    }
    
    // Queue request for later if enabled
    if (queueWhenOffline) {
      return { success: false, queued: true };
    }
    
    return { success: false, offline: true };
  }
};

export default {
  checkConnectivity,
  queueOfflineRequest,
  getOfflineQueue,
  processOfflineQueue,
  cacheData,
  getCachedData,
  getCachedItem,
  updateLastSync,
  getLastSync,
  clearOfflineData,
  offlineAwareFetch,
};
