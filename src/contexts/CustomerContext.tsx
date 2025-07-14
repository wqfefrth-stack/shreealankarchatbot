
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CustomerContextType {
  customerName: string;
  whatsappNo: string;
  setCustomerName: (name: string) => void;
  setWhatsappNo: (whatsappNo: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider = ({ children }: CustomerProviderProps) => {
  const [customerName, setCustomerName] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');

  return (
    <CustomerContext.Provider value={{ customerName, whatsappNo, setCustomerName, setWhatsappNo }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
