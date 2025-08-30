import { useState, useEffect } from "react";
import { CloudSun, MapPin, Thermometer, Droplets, Wind, Eye, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  icon: string;
}

interface ForecastDay {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
}

export default function Weather() {
  const [location, setLocation] = useState("New York");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unit, setUnit] = useState<"celsius" | "fahrenheit">("celsius");
  const { toast } = useToast();

  // Mock weather data (in production, you'd use a real API like OpenWeatherMap)
  const mockWeatherData: { [key: string]: WeatherData } = {
    "new york": {
      location: "New York, NY",
      temperature: 22,
      description: "Partly Cloudy",
      humidity: 65,
      windSpeed: 12,
      visibility: 10,
      pressure: 1013,
      uvIndex: 6,
      sunrise: "06:45",
      sunset: "19:30",
      icon: "partly-cloudy"
    },
    "london": {
      location: "London, UK",
      temperature: 15,
      description: "Light Rain",
      humidity: 80,
      windSpeed: 8,
      visibility: 8,
      pressure: 1008,
      uvIndex: 3,
      sunrise: "07:15",
      sunset: "18:45",
      icon: "rainy"
    },
    "tokyo": {
      location: "Tokyo, Japan",
      temperature: 28,
      description: "Sunny",
      humidity: 55,
      windSpeed: 6,
      visibility: 12,
      pressure: 1020,
      uvIndex: 8,
      sunrise: "05:30",
      sunset: "18:50",
      icon: "sunny"
    },
    "paris": {
      location: "Paris, France",
      temperature: 19,
      description: "Overcast",
      humidity: 70,
      windSpeed: 10,
      visibility: 9,
      pressure: 1015,
      uvIndex: 4,
      sunrise: "07:00",
      sunset: "19:15",
      icon: "cloudy"
    },
    "sydney": {
      location: "Sydney, Australia",
      temperature: 25,
      description: "Clear",
      humidity: 45,
      windSpeed: 15,
      visibility: 15,
      pressure: 1018,
      uvIndex: 7,
      sunrise: "06:00",
      sunset: "19:45",
      icon: "sunny"
    }
  };

  const mockForecast: ForecastDay[] = [
    { date: "Today", high: 25, low: 18, description: "Partly Cloudy", icon: "partly-cloudy" },
    { date: "Tomorrow", high: 27, low: 20, description: "Sunny", icon: "sunny" },
    { date: "Wed", high: 23, low: 16, description: "Light Rain", icon: "rainy" },
    { date: "Thu", high: 21, low: 14, description: "Overcast", icon: "cloudy" },
    { date: "Fri", high: 26, low: 19, description: "Partly Cloudy", icon: "partly-cloudy" },
    { date: "Sat", high: 29, low: 22, description: "Sunny", icon: "sunny" },
    { date: "Sun", high: 24, low: 17, description: "Scattered Showers", icon: "rainy" },
  ];

  const fetchWeather = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const locationKey = location.toLowerCase();
      const weather = mockWeatherData[locationKey] || mockWeatherData["new york"];
      
      setWeatherData(weather);
      setForecast(mockForecast);
      
      toast({
        title: "Weather Updated",
        description: `Loaded weather for ${weather.location}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          setLocation("Current Location");
          toast({
            title: "Location Updated",
            description: "Using your current location",
          });
          fetchWeather();
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not get your location",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const convertTemperature = (temp: number) => {
    if (unit === "fahrenheit") {
      return Math.round(temp * 9/5 + 32);
    }
    return temp;
  };

  const getTemperatureUnit = () => {
    return unit === "celsius" ? "°C" : "°F";
  };

  const getWeatherIcon = (iconName: string) => {
    const icons = {
      "sunny": <Sun className="h-8 w-8 text-yellow-500" />,
      "partly-cloudy": <CloudSun className="h-8 w-8 text-blue-500" />,
      "cloudy": <CloudSun className="h-8 w-8 text-gray-500" />,
      "rainy": <Droplets className="h-8 w-8 text-blue-600" />,
    };
    return icons[iconName as keyof typeof icons] || <CloudSun className="h-8 w-8" />;
  };

  const getUVIndexColor = (uv: number) => {
    if (uv <= 2) return "bg-green-500";
    if (uv <= 5) return "bg-yellow-500";
    if (uv <= 7) return "bg-orange-500";
    if (uv <= 10) return "bg-red-500";
    return "bg-purple-500";
  };

  const getUVIndexText = (uv: number) => {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <CloudSun className="h-8 w-8 text-primary" />
          Weather Tracker
        </div>
        <p className="text-muted-foreground">Check current weather conditions and forecasts</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            />
            <Button onClick={fetchWeather} disabled={isLoading}>
              {isLoading ? "Loading..." : "Search"}
            </Button>
            <Button variant="outline" onClick={getCurrentLocation}>
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")}
            >
              {getTemperatureUnit()}
            </Button>
          </div>
        </CardContent>
      </Card>

      {weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Weather */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {weatherData.location}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Weather */}
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    {getWeatherIcon(weatherData.icon)}
                  </div>
                  <div>
                    <div className="text-5xl font-bold">
                      {convertTemperature(weatherData.temperature)}{getTemperatureUnit()}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {weatherData.description}
                    </div>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                      <div className="font-medium">{weatherData.humidity}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded">
                    <Wind className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Wind</div>
                      <div className="font-medium">{weatherData.windSpeed} km/h</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded">
                    <Eye className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Visibility</div>
                      <div className="font-medium">{weatherData.visibility} km</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Pressure</div>
                      <div className="font-medium">{weatherData.pressure} hPa</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* UV Index and Sun Times */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground mb-1">UV Index</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getUVIndexColor(weatherData.uvIndex)}`}></div>
                    <span className="font-medium">{weatherData.uvIndex}</span>
                    <span className="text-sm text-muted-foreground">({getUVIndexText(weatherData.uvIndex)})</span>
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground mb-1">Sunrise</div>
                  <div className="flex items-center justify-center gap-1">
                    <Sun className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{weatherData.sunrise}</span>
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground mb-1">Sunset</div>
                  <div className="flex items-center justify-center gap-1">
                    <Moon className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{weatherData.sunset}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(day.icon)}
                      <div>
                        <div className="font-medium">{day.date}</div>
                        <div className="text-sm text-muted-foreground">{day.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {convertTemperature(day.high)}{getTemperatureUnit()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {convertTemperature(day.low)}{getTemperatureUnit()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Cities */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {["New York", "London", "Tokyo", "Paris", "Sydney"].map((city) => (
              <Button
                key={city}
                variant="outline"
                onClick={() => {
                  setLocation(city);
                  setTimeout(fetchWeather, 100);
                }}
                className="h-auto p-3"
              >
                {city}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}