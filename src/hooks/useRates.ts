
import { useState, useEffect } from 'react';
import { fetchRatesFromAPI, RateData } from '@/services/rateService';

export const useRates = () => {
  const [rates, setRates] = useState<RateData>({
    gold: '₹6,250 per gram',
    silver: '₹75 per gram',
    lastUpdated: new Date().toLocaleString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching current rates from website...');
      const currentRates = await fetchRatesFromAPI();
      setRates(currentRates);
      console.log('Rates fetched successfully:', currentRates);
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError('Failed to fetch current rates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch rates on component mount
    fetchRates();
  }, []);

  return {
    rates,
    isLoading,
    error,
    refetchRates: fetchRates
  };
};
