import { useCallback } from 'react';
import axios from 'axios';

const useActionTracking = () => {
  const trackAction = useCallback(async (actionData) => {
    try {
      await axios.post('/api/actions/log', {
        type: actionData.type, // 'whatsapp', 'call', or 'form'
        name: actionData.name || '',
        phone: actionData.phone || '',
        email: actionData.email || '',
        message: actionData.message || '',
        page: window.location.pathname
      });
    } catch (error) {
      console.error('Error tracking action:', error);
      // Fail silently - don't disrupt user experience
    }
  }, []);

  const trackWhatsApp = useCallback((userInfo = {}) => {
    trackAction({
      type: 'whatsapp',
      name: userInfo.name || '',
      phone: userInfo.phone || '',
      email: userInfo.email || ''
    });
  }, [trackAction]);

  const trackCall = useCallback((userInfo = {}) => {
    trackAction({
      type: 'call',
      name: userInfo.name || '',
      phone: userInfo.phone || '',
      email: userInfo.email || ''
    });
  }, [trackAction]);

  const trackFormSubmission = useCallback((formData) => {
    trackAction({
      type: 'form',
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      message: formData.message || ''
    });
  }, [trackAction]);

  return {
    trackWhatsApp,
    trackCall,
    trackFormSubmission
  };
};

export default useActionTracking;