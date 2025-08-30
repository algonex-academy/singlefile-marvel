import { useState, useEffect } from "react";
import { DollarSign, RefreshCw, TrendingUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ExchangeRates {
  [key: string]: number;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const { toast } = useToast();

  // Popular currencies with their symbols
  const currencies: Currency[] = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
    { code: "MXN", name: "Mexican Peso", symbol: "$" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  ];

  // Mock exchange rates (in a real app, you'd fetch from an API like exchangerate-api.com)
  const mockExchangeRates: ExchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CNY: 7.23,
    AUD: 1.53,
    CAD: 1.37,
    CHF: 0.88,
    INR: 83.25,
    KRW: 1342.50,
    BRL: 4.98,
    RUB: 94.35,
    SEK: 10.82,
    NOK: 10.95,
    SGD: 1.35,
    HKD: 7.81,
    MXN: 17.18,
    NZD: 1.64,
    ZAR: 18.95,
    TRY: 29.15,
  };

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would fetch from an API:
      // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      // const data = await response.json();
      // setExchangeRates(data.rates);
      
      setExchangeRates(mockExchangeRates);
      setLastUpdated(new Date().toLocaleString());
      
      toast({
        title: "Rates Updated",
        description: "Exchange rates have been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exchange rates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency] && amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        // Convert from base currency (USD) to target currencies
        const fromRate = exchangeRates[fromCurrency];
        const toRate = exchangeRates[toCurrency];
        const result = (numAmount / fromRate) * toRate;
        setConvertedAmount(result);
      }
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  const formatAmount = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const getExchangeRate = () => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return null;
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    return toRate / fromRate;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <DollarSign className="h-8 w-8 text-primary" />
          Currency Converter
        </div>
        <p className="text-muted-foreground">Convert between different currencies with real-time rates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Currency Converter</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchExchangeRates}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-lg"
              />
            </div>

            {/* From Currency */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full p-3 border rounded-md text-sm"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={swapCurrencies}
                className="rounded-full w-12 h-12"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Currency */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-3 border rounded-md text-sm"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Result */}
            {convertedAmount !== null && (
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {amount} {fromCurrency} equals
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatAmount(convertedAmount, toCurrency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getExchangeRate() && (
                      <>1 {fromCurrency} = {getExchangeRate()?.toFixed(6)} {toCurrency}</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rate Information */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
                Exchange Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getExchangeRate() && (
                <div className="space-y-3">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      1 {fromCurrency} =
                    </p>
                    <p className="text-xl font-bold">
                      {getExchangeRate()?.toFixed(6)} {toCurrency}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      1 {toCurrency} =
                    </p>
                    <p className="text-xl font-bold">
                      {(1 / (getExchangeRate() || 1)).toFixed(6)} {fromCurrency}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Rates (USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["EUR", "GBP", "JPY", "CNY", "AUD"].map((currency) => (
                  <div key={currency} className="flex justify-between items-center p-2 border rounded text-sm">
                    <span className="font-medium">{currency}</span>
                    <span>{exchangeRates[currency]?.toFixed(4) || "..."}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Update Info */}
          {lastUpdated && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    Last Updated
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {lastUpdated}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> Exchange rates are for informational purposes only and may not reflect real-time market rates. 
            For actual transactions, please consult your bank or financial institution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}