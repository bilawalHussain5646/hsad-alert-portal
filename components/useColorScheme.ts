import { useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { AppContext } from '../store/AppStore';

export function useColorScheme() {
  const systemScheme = useSystemColorScheme();
  const context = useContext(AppContext); // Use Context directly to avoid circular hook calls if any

  if (!context) {
    // console.log('[Theme Debug] No context, using system:', systemScheme);
    return systemScheme;
  }

  const { userTheme } = context;
  // console.log('[Theme Debug] userTheme:', userTheme, 'system:', systemScheme);
  
  if (userTheme === 'system') return systemScheme;
  return userTheme;
}
