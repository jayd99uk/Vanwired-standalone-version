import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Calculator, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WattsTriangle() {
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [power, setPower] = useState("");
  const [results, setResults] = useState({});

  useEffect(() => {
    const calculateValues = () => {
      const V = parseFloat(voltage);
      const I = parseFloat(current);
      const P = parseFloat(power);

      let newResults = {};

      // V and I known
      if (!isNaN(V) && !isNaN(I)) {
        newResults.power = (V * I).toFixed(2);
      }
      // V and P known
      else if (!isNaN(V) && !isNaN(P)) {
        newResults.current = (P / V).toFixed(2);
      }
      // I and P known
      else if (!isNaN(I) && !isNaN(P)) {
        newResults.voltage = (P / I).toFixed(2);
      }
      
      setResults(newResults);
    };

    calculateValues();
  }, [voltage, current, power]);

  const clearAll = () => {
    setVoltage("");
    setCurrent("");
    setPower("");
    setResults({});
  };

  const getVanlifeExample = () => {
    const V = parseFloat(voltage) || parseFloat(results.voltage);
    const P = parseFloat(power) || parseFloat(results.power);
    
    if (V && P) {
      if (V === 12 && P >= 100 && P <= 200) {
        return "Perfect for a 12V refrigerator or inverter";
      } else if (V === 12 && P >= 20 && P <= 60) {
        return "Typical for LED lighting or fans";
      } else if (V === 12 && P >= 300 && P <= 1000) {
        return "High-power devices like microwaves via inverter";
      } else if (V === 24 && P >= 200) {
        return "Common in larger 24V systems";
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>
            Watts Triangle Calculator
          </h1>
          <p className="text-xl text-cyan-300">
            Calculate watts, volts & amps for your vanlife electrical system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <Card className="cyber-card border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Calculator className="w-6 h-6 text-blue-400" />
                Enter Any Two Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="voltage" className="text-gray-200">Voltage (V)</Label>
                <Input
                  id="voltage"
                  type="number"
                  step="0.1"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="e.g., 12"
                  className="mt-2 bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl text-lg"
                />
              </div>

              <div>
                <Label htmlFor="current" className="text-gray-200">Current (A)</Label>
                <Input
                  id="current"
                  type="number"
                  step="0.1"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="e.g., 10"
                  className="mt-2 bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-xl text-lg"
                />
              </div>

              <div>
                <Label htmlFor="power" className="text-gray-200">Power (W)</Label>
                <Input
                  id="power"
                  type="number"
                  step="0.1"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="e.g., 120"
                  className="mt-2 bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl text-lg"
                />
              </div>

              <button 
                onClick={clearAll}
                className="w-full py-2 px-4 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl transition-colors text-gray-200 font-medium border border-gray-600"
              >
                Clear All
              </button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="cyber-card border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Zap className="w-6 h-6 text-green-400" />
                Calculated Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(results).length > 0 ? (
                <div className="space-y-4">
                  {results.voltage && (
                    <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                      <div className="text-sm text-blue-300 font-medium">Voltage</div>
                      <div className="text-2xl font-bold text-blue-200">{results.voltage} V</div>
                    </div>
                  )}
                  
                  {results.current && (
                    <div className="p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                      <div className="text-sm text-green-300 font-medium">Current</div>
                      <div className="text-2xl font-bold text-green-200">{results.current} A</div>
                    </div>
                  )}
                  
                  {results.power && (
                    <div className="p-4 bg-purple-500/20 rounded-xl border border-purple-400/30">
                      <div className="text-sm text-purple-300 font-medium">Power</div>
                      <div className="text-2xl font-bold text-purple-200">{results.power} W</div>
                    </div>
                  )}

                  {getVanlifeExample() && (
                    <Alert className="border-yellow-400/30 bg-yellow-500/10">
                      <Info className="h-4 w-4 text-yellow-400" />
                      <AlertDescription className="text-yellow-200">
                        <strong>Vanlife Context:</strong> {getVanlifeExample()}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg">Enter any two values to see calculations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Watts Triangle Formulas */}
        <Card className="cyber-card border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Watts Triangle Formulas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-400/30">
                <div className="text-2xl font-bold text-blue-300 mb-2">P = V × I</div>
                <div className="text-sm text-blue-200">Power = Voltage × Current</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-400/30">
                <div className="text-2xl font-bold text-green-300 mb-2">V = P / I</div>
                <div className="text-sm text-green-200">Voltage = Power / Current</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-400/30">
                <div className="text-2xl font-bold text-purple-300 mb-2">I = P / V</div>
                <div className="text-sm text-purple-200">Current = Power / Voltage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}