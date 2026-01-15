import React, { createContext, useState, useContext, useEffect } from 'react';

const InquiryContext = createContext();

export const useInquiry = () => useContext(InquiryContext);

export const InquiryProvider = ({ children }) => {
  const [inquiryItems, setInquiryItems] = useState(() => {
    const savedItems = localStorage.getItem('upsanaCateringInquiry');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    event: '',
    preferredMenu: '',
    comments: ''
  });

  useEffect(() => {
    localStorage.setItem('upsanaCateringInquiry', JSON.stringify(inquiryItems));
  }, [inquiryItems]);

  const addToInquiry = (item) => {
    setInquiryItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromInquiry = (itemId) => {
    setInquiryItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateInquiryQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromInquiry(itemId);
      return;
    }
    
    setInquiryItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearInquiry = () => {
    setInquiryItems([]);
  };

  const updateContactInfo = (info) => {
    setContactInfo(prev => ({ ...prev, ...info }));
  };

  const generateWhatsAppMessage = () => {
    const itemsText = inquiryItems.map(item => 
      `• ${item.quantity}x ${item.name} - ₹${item.price * item.quantity}`
    ).join('\n');
    
    const itemsTotal = inquiryItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    return `
*CATERING INQUIRY - UPSANA CATERING*

👤 *Customer Details:*
Name: ${contactInfo.name || 'Not provided'}
Phone: ${contactInfo.phone || 'Not provided'}
Email: ${contactInfo.email || 'Not provided'}
Location: ${contactInfo.location || 'Not provided'}
Event: ${contactInfo.event || 'Not specified'}

🍽️ *Menu Interest:*
${contactInfo.preferredMenu || 'Not specified'}

📋 *Requested Items:*
${itemsText || 'No items selected'}
---
Subtotal: ₹${itemsTotal}
Estimated Total: ₹${Math.round(itemsTotal * 1.18)} (incl. GST)

💭 *Comments:*
${contactInfo.comments || 'No comments'}

_This inquiry was submitted through upsanacatering.com_
    `.trim();
  };

  const inquiryItemCount = inquiryItems.reduce((sum, item) => sum + item.quantity, 0);
  const inquiryTotal = inquiryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <InquiryContext.Provider value={{
      inquiryItems,
      inquiryItemCount,
      inquiryTotal,
      contactInfo,
      addToInquiry,
      removeFromInquiry,
      updateInquiryQuantity,
      clearInquiry,
      updateContactInfo,
      generateWhatsAppMessage
    }}>
      {children}
    </InquiryContext.Provider>
  );
};