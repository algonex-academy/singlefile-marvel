import { useState, useEffect } from "react";
import { Scale, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Unit {
  name: string;
  symbol: string;
  toBase: number; // multiplier to convert to base unit
}

interface UnitCategory {
  name: string;
  baseUnit: string;
  units: Unit[];
}

export default function UnitConverter() {
  const [selectedCategory, setSelectedCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("feet");
  const [inputValue, setInputValue] = useState("1");
  const [result, setResult] = useState<number | null>(null);

  const unitCategories: { [key: string]: UnitCategory } = {
    length: {
      name: "Length",
      baseUnit: "meter",
      units: [
        { name: "millimeter", symbol: "mm", toBase: 0.001 },
        { name: "centimeter", symbol: "cm", toBase: 0.01 },
        { name: "meter", symbol: "m", toBase: 1 },
        { name: "kilometer", symbol: "km", toBase: 1000 },
        { name: "inch", symbol: "in", toBase: 0.0254 },
        { name: "feet", symbol: "ft", toBase: 0.3048 },
        { name: "yard", symbol: "yd", toBase: 0.9144 },
        { name: "mile", symbol: "mi", toBase: 1609.34 },
        { name: "nautical mile", symbol: "nmi", toBase: 1852 },
      ]
    },
    weight: {
      name: "Weight",
      baseUnit: "kilogram",
      units: [
        { name: "milligram", symbol: "mg", toBase: 0.000001 },
        { name: "gram", symbol: "g", toBase: 0.001 },
        { name: "kilogram", symbol: "kg", toBase: 1 },
        { name: "ton", symbol: "t", toBase: 1000 },
        { name: "ounce", symbol: "oz", toBase: 0.0283495 },
        { name: "pound", symbol: "lb", toBase: 0.453592 },
        { name: "stone", symbol: "st", toBase: 6.35029 },
      ]
    },
    temperature: {
      name: "Temperature",
      baseUnit: "celsius",
      units: [
        { name: "celsius", symbol: "°C", toBase: 1 },
        { name: "fahrenheit", symbol: "°F", toBase: 1 },
        { name: "kelvin", symbol: "K", toBase: 1 },
      ]
    },
    volume: {
      name: "Volume",
      baseUnit: "liter",
      units: [
        { name: "milliliter", symbol: "ml", toBase: 0.001 },
        { name: "liter", symbol: "l", toBase: 1 },
        { name: "cubic meter", symbol: "m³", toBase: 1000 },
        { name: "fluid ounce", symbol: "fl oz", toBase: 0.0295735 },
        { name: "cup", symbol: "cup", toBase: 0.236588 },
        { name: "pint", symbol: "pt", toBase: 0.473176 },
        { name: "quart", symbol: "qt", toBase: 0.946353 },
        { name: "gallon", symbol: "gal", toBase: 3.78541 },
      ]
    },
    area: {
      name: "Area",
      baseUnit: "square meter",
      units: [
        { name: "square millimeter", symbol: "mm²", toBase: 0.000001 },
        { name: "square centimeter", symbol: "cm²", toBase: 0.0001 },
        { name: "square meter", symbol: "m²", toBase: 1 },
        { name: "square kilometer", symbol: "km²", toBase: 1000000 },
        { name: "square inch", symbol: "in²", toBase: 0.00064516 },
        { name: "square foot", symbol: "ft²", toBase: 0.092903 },
        { name: "square yard", symbol: "yd²", toBase: 0.836127 },
        { name: "acre", symbol: "ac", toBase: 4046.86 },
        { name: "hectare", symbol: "ha", toBase: 10000 },
      ]
    },
    speed: {
      name: "Speed",
      baseUnit: "meter per second",
      units: [
        { name: "meter per second", symbol: "m/s", toBase: 1 },
        { name: "kilometer per hour", symbol: "km/h", toBase: 0.277778 },
        { name: "mile per hour", symbol: "mph", toBase: 0.44704 },
        { name: "foot per second", symbol: "ft/s", toBase: 0.3048 },
        { name: "knot", symbol: "kn", toBase: 0.514444 },
      ]
    },
    energy: {
      name: "Energy",
      baseUnit: "joule",
      units: [
        { name: "joule", symbol: "J", toBase: 1 },
        { name: "kilojoule", symbol: "kJ", toBase: 1000 },
        { name: "calorie", symbol: "cal", toBase: 4.184 },
        { name: "kilocalorie", symbol: "kcal", toBase: 4184 },
        { name: "watt hour", symbol: "Wh", toBase: 3600 },
        { name: "kilowatt hour", symbol: "kWh", toBase: 3600000 },
        { name: "BTU", symbol: "BTU", toBase: 1055.06 },
      ]
    },
    time: {
      name: "Time",
      baseUnit: "second",
      units: [
        { name: "nanosecond", symbol: "ns", toBase: 0.000000001 },
        { name: "microsecond", symbol: "μs", toBase: 0.000001 },
        { name: "millisecond", symbol: "ms", toBase: 0.001 },
        { name: "second", symbol: "s", toBase: 1 },
        { name: "minute", symbol: "min", toBase: 60 },
        { name: "hour", symbol: "h", toBase: 3600 },
        { name: "day", symbol: "d", toBase: 86400 },
        { name: "week", symbol: "wk", toBase: 604800 },
        { name: "month", symbol: "mo", toBase: 2629746 },
        { name: "year", symbol: "yr", toBase: 31556952 },
      ]
    }
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    // Convert to Celsius first
    let celsius: number;
    switch (from) {
      case "celsius":
        celsius = value;
        break;
      case "fahrenheit":
        celsius = (value - 32) * 5/9;
        break;
      case "kelvin":
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    // Convert from Celsius to target
    switch (to) {
      case "celsius":
        return celsius;
      case "fahrenheit":
        return celsius * 9/5 + 32;
      case "kelvin":
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const convertUnits = (value: number, category: string, from: string, to: string): number => {
    if (category === "temperature") {
      return convertTemperature(value, from, to);
    }

    const categoryData = unitCategories[category];
    const fromUnit = categoryData.units.find(u => u.name === from);
    const toUnit = categoryData.units.find(u => u.name === to);

    if (!fromUnit || !toUnit) return 0;

    // Convert to base unit first, then to target unit
    const baseValue = value * fromUnit.toBase;
    return baseValue / toUnit.toBase;
  };

  useEffect(() => {
    const currentCategory = unitCategories[selectedCategory];
    if (currentCategory) {
      setFromUnit(currentCategory.units[0].name);
      setToUnit(currentCategory.units[1].name);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const converted = convertUnits(numValue, selectedCategory, fromUnit, toUnit);
        setResult(converted);
      }
    }
  }, [inputValue, selectedCategory, fromUnit, toUnit]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const getCurrentUnits = () => {
    return unitCategories[selectedCategory]?.units || [];
  };

  const getUnitSymbol = (unitName: string) => {
    const currentUnits = getCurrentUnits();
    return currentUnits.find(u => u.name === unitName)?.symbol || unitName;
  };

  const formatResult = (value: number): string => {
    if (value === 0) return "0";
    if (Math.abs(value) >= 1000000) {
      return value.toExponential(6);
    }
    if (Math.abs(value) < 0.001 && value !== 0) {
      return value.toExponential(6);
    }
    return parseFloat(value.toPrecision(8)).toString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Scale className="h-8 w-8 text-primary" />
          Unit Converter
        </div>
        <p className="text-muted-foreground">Convert between different units of measurement</p>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(unitCategories).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key)}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.units.length} units
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Converter */}
        <Card>
          <CardHeader>
            <CardTitle>{unitCategories[selectedCategory]?.name} Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="text-lg"
              />
            </div>

            {/* From Unit */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-3 border rounded-md text-sm"
              >
                {getCurrentUnits().map((unit) => (
                  <option key={unit.name} value={unit.name}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={swapUnits}
                className="rounded-full w-12 h-12"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Unit */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-3 border rounded-md text-sm"
              >
                {getCurrentUnits().map((unit) => (
                  <option key={unit.name} value={unit.name}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Result */}
            {result !== null && (
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {inputValue} {getUnitSymbol(fromUnit)} equals
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatResult(result)} {getUnitSymbol(toUnit)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            {result !== null && (
              <div className="space-y-3">
                <h4 className="font-medium">
                  1 {getUnitSymbol(fromUnit)} = {formatResult(convertUnits(1, selectedCategory, fromUnit, toUnit))} {getUnitSymbol(toUnit)}
                </h4>
                <div className="space-y-2">
                  {[0.1, 0.5, 1, 2, 5, 10, 100, 1000].map((multiplier) => {
                    const convertedValue = convertUnits(multiplier, selectedCategory, fromUnit, toUnit);
                    return (
                      <div key={multiplier} className="flex justify-between items-center p-2 border rounded text-sm">
                        <span>{multiplier} {getUnitSymbol(fromUnit)}</span>
                        <span className="font-medium">
                          {formatResult(convertedValue)} {getUnitSymbol(toUnit)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Common Conversions */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">Common Conversions</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {selectedCategory === "length" && (
                  <>
                    <div>• 1 meter = 3.28084 feet</div>
                    <div>• 1 kilometer = 0.621371 miles</div>
                    <div>• 1 inch = 2.54 centimeters</div>
                  </>
                )}
                {selectedCategory === "weight" && (
                  <>
                    <div>• 1 kilogram = 2.20462 pounds</div>
                    <div>• 1 ounce = 28.3495 grams</div>
                    <div>• 1 ton = 1000 kilograms</div>
                  </>
                )}
                {selectedCategory === "temperature" && (
                  <>
                    <div>• 0°C = 32°F = 273.15K</div>
                    <div>• 100°C = 212°F = 373.15K</div>
                    <div>• -40°C = -40°F = 233.15K</div>
                  </>
                )}
                {selectedCategory === "volume" && (
                  <>
                    <div>• 1 liter = 1000 milliliters</div>
                    <div>• 1 gallon = 3.78541 liters</div>
                    <div>• 1 cup = 236.588 milliliters</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}