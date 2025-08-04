import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { marketService, MarketPriceRecord, MarketFilters } from '../services/marketService';
import PriceTrends from '@/components/PriceTrends';

interface PriceRecord {
  commodity: string;
  market: string;
  state: string;
  district: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
  variety: string;
  grade: string;
}

// Dummy fallback record
const dummyFallback: PriceRecord = {
  commodity: 'Potato',
  market: 'Delhi',
  state: 'Delhi',
  district: 'New Delhi',
  min_price: 1200,
  max_price: 1500,
  modal_price: 1350,
  date: new Date().toISOString().split('T')[0],
  variety: 'Other',
  grade: 'FAQ'
};

const MarketPrices: React.FC = () => {
  const [commodities, setCommodities] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [commodity, setCommodity] = useState<string>('');
  const [market, setMarket] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [marketSearch, setMarketSearch] = useState('');
  const [commoditySearch, setCommoditySearch] = useState('');

  // Debug: Log all filter states
  React.useEffect(() => {
    console.log('Filters:', { state, district, market, commodity, date });
  }, [state, district, market, commodity, date]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading initial data...');
        
        // Load states first
        console.log('Loading states...');
        const statesData = await marketService.getStates();
        console.log('States loaded:', statesData.length, statesData);
        setStates(statesData);
        
        // Set default state and load its data
        if (statesData.length > 0) {
          const defaultState = statesData[0];
          setState(defaultState);
          
          // Load districts and commodities for the default state
          console.log('Loading data for default state:', defaultState);
            const [districtsData, commoditiesData] = await Promise.all([
            marketService.getDistricts(defaultState),
            marketService.getCommodities()
          ]);
          
          console.log('Districts loaded:', districtsData.length, districtsData);
          console.log('Commodities loaded:', commoditiesData.length, commoditiesData);
          
          setDistricts(districtsData);
          setCommodities(commoditiesData);
          
          if (commoditiesData.length > 0) setCommodity(commoditiesData[0]);
          if (districtsData.length > 0) setDistrict(districtsData[0]);
        }
        
        console.log('Initial data loading complete');
      } catch (e) {
        console.error('Error loading initial data:', e);
        setError('Failed to load initial data. Check your API key and network.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (state) {
      console.log('State changed to:', state);
      setDistricts([]); // Clear districts first
      setMarkets([]); // Clear markets
      setDistrict(''); // Reset district
      setMarket(''); // Reset market
      
      // Load districts for the selected state
      marketService.getDistricts(state).then(districts => {
        console.log('Districts loaded for', state, ':', districts);
        setDistricts(districts);
      });
      
      // Load commodities for the selected state
      marketService.getCommodities().then(commodities => {
        console.log('Commodities loaded for', state, ':', commodities);
        setCommodities(commodities);
        if (commodities.length > 0) {
          setCommodity(commodities[0]);
        }
      });
    }
  }, [state]);

  // Load markets when state or district changes
  useEffect(() => {
    if (state && district) {
      console.log('Loading markets for:', state, district);
      marketService.getMarkets(state, district).then(markets => {
        console.log('Markets loaded for', state, district, ':', markets);
        setMarkets(markets);
        if (markets.length > 0) {
          setMarket(markets[0]);
        }
      });
    } else if (state) {
      // If only state is selected, get markets for the state
      console.log('Loading markets for state:', state);
      marketService.getMarkets(state).then(markets => {
        console.log('Markets loaded for state', state, ':', markets);
        setMarkets(markets);
        if (markets.length > 0) {
          setMarket(markets[0]);
        }
      });
    }
  }, [state, district]);

  // Load commodities when state, district, or market changes
  useEffect(() => {
    if (state) {
      marketService.getCommodities().then(commodities => {
        console.log('Commodities loaded for', state, district, market, ':', commodities);
        setCommodities(commodities);
        if (commodities.length > 0) {
          setCommodity(commodities[0]);
        }
      });
    }
  }, [state, district, market]);

  // Remove the Get Prices button and fetchPrices manual trigger
  // Add useEffect for real-time price fetching on select
  useEffect(() => {
    // Only fetch if all required filters are selected
    if (state && district && market && commodity && date) {
      setLoading(true);
      setError(null);
      const fetch = async () => {
        try {
          const filters: MarketFilters = {
            commodity,
            market,
            arrivalDate: date,
            state,
            district,
            limit: 50
          };
          console.log('Fetching prices with filters:', filters);
          const response = await marketService.getMarketPrices(filters);
          console.log('API response:', response);
          if (!response.records || response.records.length === 0) {
            setPrices([]);
            setError('No real-time data found for this selection.');
            setLoading(false);
            return;
          }
          const parsed = response.records.map((rec) => ({
            commodity: rec.commodity,
            market: rec.market,
            state: rec.state,
            district: rec.district,
            min_price: Number(rec.min_price),
            max_price: Number(rec.max_price),
            modal_price: Number(rec.modal_price),
            date: rec.arrival_date,
            variety: rec.variety,
            grade: rec.grade
          })) as PriceRecord[];
          setPrices(parsed);
          console.log('Prices state updated:', parsed);
        } catch (err: unknown) {
          console.error('Error fetching prices:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch real-time data.');
          setPrices([]);
        } finally {
          setLoading(false);
        }
      };
      fetch();
    }
  }, [state, district, market, commodity, date]);

  // Real-time search for states
  useEffect(() => {
    marketService.getStates(stateSearch).then(setStates);
  }, [stateSearch]);

  // Real-time search for districts
  useEffect(() => {
    if (state) {
      marketService.getDistricts(state, districtSearch).then(setDistricts);
    }
  }, [state, districtSearch]);

  // Real-time search for markets
  useEffect(() => {
    if (state && district) {
      marketService.getMarkets(state, district, marketSearch).then(setMarkets);
    } else if (state) {
      marketService.getMarkets(state, undefined, marketSearch).then(setMarkets);
    }
  }, [state, district, marketSearch]);

  // Real-time search for commodities
  useEffect(() => {
    if (state) {
      marketService.getCommodities().then(setCommodities);
    }
  }, [state, district, market, commoditySearch]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold hero-text">Market Prices</h1>
          <p className="text-muted-foreground mt-1">
            View mandi prices using AGMARKNET API (real-time)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">AGMARKNET API</Badge>
        </div>
      </div>

      <Card className="agri-card">
        <CardHeader>
          <CardTitle>Select Location & Commodity</CardTitle>
          <CardDescription>Get real-time market prices from AGMARKNET</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading data...</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select value={state} onValueChange={setState} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Select State"} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input
                      placeholder="Search state..."
                      value={stateSearch}
                      onChange={e => setStateSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">District</label>
              <Select value={district} onValueChange={setDistrict} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Select District"} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input
                      placeholder="Search district..."
                      value={districtSearch}
                      onChange={e => setDistrictSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Market</label>
              <Select value={market} onValueChange={setMarket} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Select Market"} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input
                      placeholder="Search market..."
                      value={marketSearch}
                      onChange={e => setMarketSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {markets.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Commodity</label>
              <Select value={commodity} onValueChange={setCommodity} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Select Commodity"} />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input
                      placeholder="Search commodity..."
                      value={commoditySearch}
                      onChange={e => setCommoditySearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>
            {/* Remove the Get Prices button from the JSX */}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-600 font-medium">{error}</div>
      )}

      {/* Debug section - remove this later */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
          <CardDescription>Testing API connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>States loaded: {states.length}</p>
            <p>Commodities loaded: {commodities.length}</p>
            <Button 
              onClick={async () => {
                try {
                  console.log('Testing API...');
                  const response = await marketService.getMarketPrices({ limit: 10 });
                  console.log('API Response:', response);
                  alert(`API working! Got ${response.records?.length || 0} records`);
                } catch (e) {
                  console.error('API Test failed:', e);
                  alert('API test failed: ' + e.message);
                }
              }}
              variant="outline"
              size="sm"
            >
              Test API Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {prices.length > 0 && (
        <PriceTrends 
          records={prices.map(p => ({
            state: p.state,
            district: p.district,
            market: p.market,
            commodity: p.commodity,
            variety: p.variety,
            grade: p.grade,
            arrival_date: p.date,
            min_price: p.min_price.toString(),
            max_price: p.max_price.toString(),
            modal_price: p.modal_price.toString()
          }))}
          commodity={commodity}
        />
      )}

      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Market Price Results</span>
          </CardTitle>
          <CardDescription>
            Showing prices for {commodity} in {market}, {district}, {state}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Commodity</th>
                  <th className="p-2">Market</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Variety</th>
                  <th className="p-2">Grade</th>
                  <th className="p-2">Min Price</th>
                  <th className="p-2">Max Price</th>
                  <th className="p-2">Modal Price</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{p.commodity}</td>
                    <td className="p-2">{p.market}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span>{p.district}, {p.state}</span>
                      </div>
                    </td>
                    <td className="p-2">{p.variety}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {p.grade}
                      </Badge>
                    </td>
                    <td className="p-2 text-green-600 font-medium">₹{p.min_price}</td>
                    <td className="p-2 text-red-600 font-medium">₹{p.max_price}</td>
                    <td className="p-2 text-blue-600 font-medium">₹{p.modal_price}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{p.date}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPrices;
