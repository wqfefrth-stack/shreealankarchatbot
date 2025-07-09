
export interface RateData {
  gold: string;
  silver: string;
  lastUpdated: string;
}

export const fetchCurrentRates = async (): Promise<RateData> => {
  try {
    // Since we can't directly scrape from the browser due to CORS,
    // we'll use a CORS proxy or implement a different approach
    const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://shreealankar.lovable.app/'));
    
    if (!response.ok) {
      throw new Error('Failed to fetch rates');
    }
    
    const data = await response.json();
    const htmlContent = data.contents;
    
    // Parse HTML to extract rates (you'll need to adjust these selectors based on your website structure)
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // These selectors need to be updated based on your actual website structure
    const goldRateElement = doc.querySelector('[data-rate="gold"], .gold-rate, #gold-rate');
    const silverRateElement = doc.querySelector('[data-rate="silver"], .silver-rate, #silver-rate');
    
    const goldRate = goldRateElement?.textContent?.trim() || '₹6,250 per gram';
    const silverRate = silverRateElement?.textContent?.trim() || '₹75 per gram';
    
    return {
      gold: goldRate,
      silver: silverRate,
      lastUpdated: new Date().toLocaleString()
    };
  } catch (error) {
    console.error('Error fetching rates from website:', error);
    
    // Fallback to default rates if website fetch fails
    return {
      gold: '₹6,250 per gram',
      silver: '₹75 per gram',
      lastUpdated: new Date().toLocaleString()
    };
  }
};

// Alternative method using a simple JSON endpoint (if you can add one to your website)
export const fetchRatesFromAPI = async (): Promise<RateData> => {
  try {
    // If you can add a simple JSON endpoint to your website like /api/rates.json
    const response = await fetch('https://shreealankar.lovable.app/api/rates.json');
    
    if (!response.ok) {
      throw new Error('API endpoint not available');
    }
    
    const rates = await response.json();
    return {
      gold: rates.gold || '₹6,250 per gram',
      silver: rates.silver || '₹75 per gram',
      lastUpdated: rates.lastUpdated || new Date().toLocaleString()
    };
  } catch (error) {
    console.log('JSON API not available, using fallback method');
    return fetchCurrentRates();
  }
};
