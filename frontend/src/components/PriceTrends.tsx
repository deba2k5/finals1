import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
// Define MarketPriceRecord type locally if the module is missing
export interface MarketPriceRecord {
  min_price: string;
  max_price: string;
  modal_price: string;
  arrival_date: string;
}

interface PriceTrendsProps {
  records: MarketPriceRecord[];
  commodity: string;
}

const PriceTrends: React.FC<PriceTrendsProps> = ({ records, commodity }) => {
  React.useEffect(() => {
    console.log('PriceTrends props updated:', { records, commodity });
  }, [records, commodity]);

  if (records.length === 0) {
    return (
      <Card className="agri-card">
        <CardHeader>
          <CardTitle>Price Trends</CardTitle>
          <CardDescription>No data available for trends</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate price statistics
  const prices = records.map(r => ({
    min: parseFloat(r.min_price),
    max: parseFloat(r.max_price),
    modal: parseFloat(r.modal_price)
  }));

  const allPrices = prices.flatMap(p => [p.min, p.max, p.modal]);
  const avgPrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  // Calculate price change (comparing first and last records)
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime()
  );

  const firstRecord = sortedRecords[0];
  const lastRecord = sortedRecords[sortedRecords.length - 1];
  
  const firstAvg = (parseFloat(firstRecord.min_price) + parseFloat(firstRecord.max_price) + parseFloat(firstRecord.modal_price)) / 3;
  const lastAvg = (parseFloat(lastRecord.min_price) + parseFloat(lastRecord.max_price) + parseFloat(lastRecord.modal_price)) / 3;
  
  const priceChange = lastAvg - firstAvg;
  const priceChangePercent = ((priceChange / firstAvg) * 100);

  const getTrendIcon = () => {
    if (priceChange > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (priceChange < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (priceChange > 0) return 'text-green-600';
    if (priceChange < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="agri-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">₹{Math.round(avgPrice)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">per quintal</p>
        </CardContent>
      </Card>

      <Card className="agri-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Min: ₹{minPrice}</span>
              <span className="text-red-600">Max: ₹{maxPrice}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="agri-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Price Change</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-lg font-bold ${getTrendColor()}`}>
              {priceChange > 0 ? '+' : ''}₹{Math.abs(Math.round(priceChange))}
            </span>
          </div>
          <p className={`text-xs ${getTrendColor()} mt-1`}>
            {priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card className="agri-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Data Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-lg">
              {records.length}
            </Badge>
            <span className="text-sm text-muted-foreground">records</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {commodity} prices
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceTrends; 