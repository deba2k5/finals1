export interface MarketPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export interface MarketPricesResponse {
  // ...existing fields...
  records: MarketPriceRecord[];
}

export interface MarketFilters {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrivalDate?: string;
  limit?: number;
  offset?: number;
}

class MarketService {
  private baseUrl = '/api/agmarknet';

  /**
   * Fetch market prices with filters
   */
  async getMarketPrices(filters: MarketFilters = {}): Promise<MarketPricesResponse> {
    try {
      const params = new URLSearchParams();

      // Add filters to query parameters
      if (filters.state) params.append('filters[state]', filters.state);
      if (filters.district) params.append('filters[district]', filters.district);
      if (filters.market) params.append('filters[market]', filters.market);
      if (filters.commodity) params.append('filters[commodity]', filters.commodity);
      if (filters.variety) params.append('filters[variety]', filters.variety);
      if (filters.grade) params.append('filters[grade]', filters.grade);
      if (filters.arrivalDate) params.append('filters[arrival_date]', filters.arrivalDate);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market prices:', error);
      throw new Error('Failed to fetch market prices');
    }
  }

  /**
   * Get unique states from the dataset (cached dropdown)
   */
  async getStates(search?: string): Promise<string[]> {
    try {
      // Try to fetch from API as before
      const url = `${this.baseUrl}?dropdown=true&limit=2000`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      let states = [...new Set(data.records.map((record: MarketPriceRecord) => record.state))];
      // Merge with fallback states to ensure all are present
      states = Array.from(new Set([...states, ...this.getFallbackStates()]));
      if (search) {
        states = states.filter((s: string) => s.toLowerCase().includes(search.toLowerCase()));
      }
      return (states as string[]).sort();
    } catch (error) {
      console.error('Error fetching states:', error);
      // Always return fallback if API fails
      return this.getFallbackStates();
    }
  }

  /**
   * Get fallback list of major Indian states
   */
  private getFallbackStates(): string[] {
    return [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
      'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Puducherry',
      'Andaman and Nicobar Islands'
    ].sort();
  }

  /**
   * Get districts for a specific state (cached dropdown)
   */
  async getDistricts(state: string, search?: string): Promise<string[]> {
    try {
      const url = `${this.baseUrl}?dropdown=true&limit=2000&filters[state]=${encodeURIComponent(state)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      let districts: string[] = Array.from(new Set(data.records.map((record: MarketPriceRecord) => record.district)));
      if (search) {
        districts = districts.filter((d: string) => d.toLowerCase().includes(search.toLowerCase()));
      }
      return districts.sort();
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  /**
   * Get markets for a specific state and district (cached dropdown)
   */
  async getMarkets(state: string, district?: string, search?: string): Promise<string[]> {
    try {
      let url = `${this.baseUrl}?dropdown=true&limit=2000&filters[state]=${encodeURIComponent(state)}`;
      if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      let markets: string[] = [...new Set((data.records as MarketPriceRecord[]).map((record: MarketPriceRecord) => record.market))];
      if (search) {
        markets = markets.filter((m: string) => m.toLowerCase().includes(search.toLowerCase()));
      }
      return markets.sort();
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  }

  /**
   * Get commodities available in the dataset (cached dropdown)
   */
  async getCommodities(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}?dropdown=true&limit=2000`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const commodities: string[] = Array.from(new Set(data.records.map((record: MarketPriceRecord) => record.commodity)));
      return commodities.sort();
    } catch (error) {
      console.error('Error fetching commodities:', error);
      // Return fallback commodities
      return [
        'Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar', 'Ragi', 'Pulses',
        'Potato', 'Tomato', 'Onion', 'Garlic', 'Ginger', 'Turmeric',
        'Cotton', 'Sugarcane', 'Tea', 'Coffee', 'Cardamom', 'Pepper'
      ].sort();
    }
  }

  // ...rest of your methods (getCommoditiesByState, getPriceTrends, getLatestPrices, calculatePriceStats, etc.) remain unchanged...
}

export const marketService = new MarketService();
export default marketService;