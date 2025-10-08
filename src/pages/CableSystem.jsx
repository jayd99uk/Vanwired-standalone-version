
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, TrendingDown, Zap, AlertTriangle, CheckCircle, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Cable data combining:
// - Manufacturer capacity ratings from 12V Planet
// - Voltage drop values from BS 7671 (UK Wiring Regulations) Table 4D1B
// - For single core copper conductors at 18°C ambient
// voltageDrop is in mV/A/m (millivolts per amp per meter) for DC - already accounts for both conductors
const wireData = {
  "18": { voltageDrop: 44, capacity: 11, mm2: 1 },
  "16": { voltageDrop: 29, capacity: 17, mm2: 1.5 },
  "14": { voltageDrop: 18, capacity: 24, mm2: 2.5 },
  "12": { voltageDrop: 11, capacity: 32, mm2: 4 },
  "10": { voltageDrop: 7.3, capacity: 41, mm2: 6 },
  "8": { voltageDrop: 4.4, capacity: 60, mm2: 10 },
  "6": { voltageDrop: 2.8, capacity: 80, mm2: 16 },
  "4": { voltageDrop: 1.75, capacity: 110, mm2: 25 },
  "2": { voltageDrop: 1.25, capacity: 140, mm2: 35 },
  "1": { voltageDrop: 0.93, capacity: 180, mm2: 50 },
  "1/0": { voltageDrop: 0.93, capacity: 180, mm2: 50 },
  "2/0": { voltageDrop: 0.63, capacity: 235, mm2: 70 },
  "4/0": { voltageDrop: 0.38, capacity: 295, mm2: 120 }
};

// Create array of wire entries sorted by mm² (smallest to largest cross-sectional area)
const wireOrderByMm2 = Object.entries(wireData)
  .sort((a, b) => a[1].mm2 - b[1].mm2)
  .map(([awg]) => awg);

const standardFuseSizes = [1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400];

export default function CableSystem() {
  const [deviceWatts, setDeviceWatts] = useState("");
  const [systemVoltage, setSystemVoltage] = useState("12");
  const [cableLength, setCableLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState("meters");
  const [safetyFactor, setSafetyFactor] = useState("125");
  const [results, setResults] = useState(null);

  useEffect(() => {
    const calculateSystem = () => {
      const watts = parseFloat(deviceWatts);
      const voltage = parseFloat(systemVoltage);
      const length = parseFloat(cableLength);
      const safety = parseFloat(safetyFactor) / 100;

      if (isNaN(watts) || isNaN(voltage) || isNaN(length) || watts <= 0 || length <= 0) {
        setResults(null);
        return;
      }

      // Convert length to meters if user entered feet
      const lengthInMeters = lengthUnit === "feet" ? length / 3.28084 : length;

      const current = watts / voltage;
      const maxVoltageDrop = voltage * 0.03; // 3% max
      const minFuseRating = current * safety; // Fuse must handle 125% of load

      // Calculate for all wire sizes, ordered by mm² (smallest to largest)
      const wireAnalysis = wireOrderByMm2.map(awg => {
        const data = wireData[awg];
        // Voltage drop calculation using BS 7671 method:
        // Voltage Drop (V) = (mV/A/m × Current × Length) / 1000
        const voltageDrop = (data.voltageDrop * current * lengthInMeters) / 1000;
        const voltageDropPercent = (voltageDrop / voltage) * 100;
        const voltageAtLoad = voltage - voltageDrop;
        
        const canHandleCurrent = data.capacity >= current;
        const acceptableVoltageDrop = voltageDrop <= maxVoltageDrop;
        
        // Maximum fuse for this cable (80% rule)
        const maxFuseForWire = data.capacity * 0.8;
        
        // Find suitable fuse: must be >= minFuseRating AND <= maxFuseForWire
        let recommendedFuse = null;
        for (const fuseSize of standardFuseSizes) {
          if (fuseSize >= minFuseRating && fuseSize <= maxFuseForWire) {
            recommendedFuse = fuseSize;
            break;
          }
        }
        
        // Wire is suitable if it can handle current, has acceptable voltage drop, and has a valid fuse
        const isSuitable = canHandleCurrent && acceptableVoltageDrop && recommendedFuse !== null;
        
        return {
          awg,
          ...data,
          voltageDrop: voltageDrop.toFixed(2),
          voltageDropPercent: voltageDropPercent.toFixed(1),
          voltageAtLoad: voltageAtLoad.toFixed(2),
          canHandleCurrent,
          acceptableVoltageDrop,
          isSuitable,
          recommendedFuse: recommendedFuse || "N/A",
          minFuseNeeded: minFuseRating.toFixed(1),
          maxFuseAllowed: maxFuseForWire.toFixed(1),
          status: getWireStatus(voltageDropPercent, canHandleCurrent, acceptableVoltageDrop)
        };
      });

      // Find the recommended wire - smallest mm² (thinnest wire) that meets all requirements
      const recommendedWire = wireAnalysis.find(wire => wire.isSuitable);

      setResults({
        current: current.toFixed(1),
        minFuseRating: minFuseRating.toFixed(1),
        wireAnalysis,
        recommendedWire,
        maxVoltageDrop: maxVoltageDrop.toFixed(2),
        lengthInMeters: lengthInMeters.toFixed(1),
        lengthDisplay: length,
        lengthUnit: lengthUnit
      });
    };

    calculateSystem();
  }, [deviceWatts, systemVoltage, cableLength, lengthUnit, safetyFactor]);

  const getWireStatus = (voltageDropPercent, canHandleCurrent, acceptableVoltageDrop) => {
    if (!canHandleCurrent) return { level: "danger", message: "Insufficient current capacity" };
    if (!acceptableVoltageDrop) return { level: "warning", message: "Excessive voltage drop" };
    if (voltageDropPercent <= 3) return { level: "good", message: "Excellent" };
    return { level: "caution", message: "Marginal" };
  };

  const getCapacityColor = (wireCapacity, current) => {
    // Ensure current is not zero to avoid division by zero
    if (current === 0) return "text-gray-400";

    const ratio = wireCapacity / current;

    // Simplified color scheme: Green (sufficient), Yellow (marginal), Red (insufficient)
    if (ratio >= 1.15) {
      return "text-green-400 font-semibold";
    } else if (ratio >= 1.05) {
      return "text-yellow-400 font-semibold";
    } else {
      return "text-red-400 font-bold";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>
            Cable & Protection System
          </h1>
          <p className="text-xl text-cyan-300">
            Size cables and fuses with voltage drop analysis for safe, efficient vanlife electrical systems
          </p>
        </div>

        <div className="space-y-6">
          {/* Input and Recommendation Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="cyber-card border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-white">1. System Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div>
                  <Label htmlFor="watts" className="text-gray-200">Device Power (Watts)</Label>
                  <Input
                    id="watts"
                    type="number"
                    value={deviceWatts}
                    onChange={(e) => setDeviceWatts(e.target.value)}
                    placeholder="e.g., 120"
                    className="mt-2 text-lg rounded-xl bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="voltage" className="text-gray-200">System Voltage</Label>
                  <select
                    id="voltage"
                    value={systemVoltage}
                    onChange={(e) => setSystemVoltage(e.target.value)}
                    className="w-full mt-2 p-3 border rounded-xl text-lg bg-gray-900/80 border-cyan-500/30 text-white"
                  >
                    <option value="12">12V DC</option>
                    <option value="24">24V DC</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="length" className="text-gray-200">Cable Length (One-Way Only)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="length"
                      type="number"
                      value={cableLength}
                      onChange={(e) => setCableLength(e.target.value)}
                      placeholder="e.g., 5"
                      className="flex-1 text-lg rounded-xl bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500"
                    />
                    <select
                      value={lengthUnit}
                      onChange={(e) => setLengthUnit(e.target.value)}
                      className="w-24 p-3 border rounded-xl text-lg bg-gray-900/80 border-cyan-500/30 text-white"
                    >
                      <option value="meters">m</option>
                      <option value="feet">ft</option>
                    </select>
                  </div>
                  <Alert className="mt-2 border-orange-500/30 bg-orange-500/10">
                    <Info className="h-4 w-4 text-orange-400" />
                    <AlertDescription className="text-orange-200 text-xs">
                      <strong>Important:</strong> Enter the one-way distance only, not the total cable run. The calculator automatically accounts for both positive and negative cables.
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <Label htmlFor="safety" className="text-gray-200">Safety Factor</Label>
                  <select
                    id="safety"
                    value={safetyFactor}
                    onChange={(e) => setSafetyFactor(e.target.value)}
                    className="w-full mt-2 p-3 border rounded-xl bg-gray-900/80 border-cyan-500/30 text-white"
                  >
                    <option value="125">125% (Standard NEC)</option>
                    <option value="150">150% (Motors)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* System Calculations */}
            <Card className="cyber-card border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-white">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  2. Calculated Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results && results.recommendedWire ? (
                  <div className="space-y-4">
                    <Alert className="border-green-500/40 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <AlertDescription className="text-green-200 text-xs md:text-sm">
                        Your device draws <strong>{results.current}A</strong>.
                        Calculated wire option keeps voltage drop ≤ 3% and allows proper fuse protection.
                        <span className="block mt-2 text-xs">
                          Note: Smaller cables may be rated to sufficiently carry the current, but do not meet the voltage drop requirement of less than 3%.
                          See the table below showing cable sizes, rated capacity, and voltage drop to make an informed choice.
                        </span>
                      </AlertDescription>
                    </Alert>

                    <div className="bg-green-500/10 border-2 border-green-500/40 rounded-xl p-4">
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-green-300 mb-2">
                          {results.recommendedWire.awg} AWG
                        </div>
                        <div className="text-sm text-green-200 mb-3">
                          ({results.recommendedWire.mm2} mm²)
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                        <div className="text-center p-2 bg-gray-900/50 rounded-lg border border-green-500/30">
                          <div className="font-semibold text-white">{results.recommendedWire.recommendedFuse}A</div>
                          <div className="text-gray-300 text-xs">Fuse Size</div>
                        </div>
                        <div className="text-center p-2 bg-gray-900/50 rounded-lg border border-green-500/30">
                          <div className="font-semibold text-white">{results.recommendedWire.voltageDropPercent}%</div>
                          <div className="text-gray-300 text-xs">Voltage Drop</div>
                        </div>
                        <div className="text-center p-2 bg-gray-900/50 rounded-lg border border-green-500/30">
                          <div className="font-semibold text-white">{results.recommendedWire.voltageAtLoad}V</div>
                          <div className="text-gray-300 text-xs">At Device</div>
                        </div>
                        <div className="text-center p-2 bg-gray-900/50 rounded-lg border border-green-500/30">
                          <div className="font-semibold text-white">{results.recommendedWire.capacity}A</div>
                          <div className="text-gray-300 text-xs">Wire Capacity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : results ? (
                  <Alert className="border-red-500/40 bg-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200 text-xs md:text-sm">
                      No suitable wire found for these parameters. 
                      Consider shorter cable run or higher system voltage.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-sm md:text-base">Enter parameters to see calculated results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cable Size Comparison Table */}
          <Card className="cyber-card border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-white">3. Cable Size Comparison</CardTitle>
              {results && (
                <p className="text-xs md:text-sm text-gray-300">
                  Showing voltage drop for {results.current}A over {results.lengthDisplay}{results.lengthUnit === "meters" ? "m" : "ft"} 
                  {results.lengthUnit === "feet" && ` (${results.lengthInMeters}m)`} at {systemVoltage}V (sorted by mm² size)
                </p>
              )}
            </CardHeader>
            <CardContent>
              {results ? (
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-cyan-500/30">
                          <th className="text-left py-3 px-2 font-bold text-cyan-300">AWG</th>
                          <th className="text-left py-3 px-2 font-bold text-cyan-300">mm²</th>
                          <th className="text-left py-3 px-2 font-bold text-cyan-300">Capacity</th>
                          <th className="text-left py-3 px-2 font-bold text-cyan-300">V-Drop</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.wireAnalysis.map((wire) => {
                          const isRecommended = results.recommendedWire && wire.awg === results.recommendedWire.awg;
                          const isExcessiveDrop = parseFloat(wire.voltageDropPercent) > 3;
                          const capacityColorClass = getCapacityColor(wire.capacity, parseFloat(results.current));
                          const rowBg = isRecommended ? "bg-cyan-500/10" : "bg-transparent";
                          
                          return (
                            <tr key={wire.awg} className={`${rowBg} border-b border-gray-700/30 hover:bg-gray-800/30`}>
                              <td className="py-3 px-2 font-medium text-white">
                                {isRecommended && <span className="text-cyan-400 font-bold mr-1">★</span>}
                                {wire.awg}
                              </td>
                              <td className="py-3 px-2 text-gray-200">{wire.mm2}</td>
                              <td className="py-3 px-2">
                                <span className={capacityColorClass}>
                                  {wire.capacity}A
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`${isExcessiveDrop ? 'font-bold text-red-400 text-base' : 'text-white'}`}>
                                  {wire.voltageDropPercent}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Color Legend */}
                  <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-cyan-500/20">
                    <h4 className="text-sm font-bold text-white mb-3">Table Guide:</h4>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-300 mb-2">Cable Capacity Colors:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-400 rounded border border-green-500"></div>
                            <span className="text-gray-200">Green = Sufficient capacity</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-400 rounded border border-yellow-500"></div>
                            <span className="text-gray-200">Yellow = Marginal capacity</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-400 rounded border border-red-500"></div>
                            <span className="text-gray-200">Red = Insufficient capacity</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-cyan-500/20">
                        <p className="text-xs font-semibold text-gray-300 mb-2">Voltage Drop Colors:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-white rounded border border-gray-300"></div>
                            <span className="text-gray-200">White = ≤3% (Acceptable)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-400 rounded border border-red-500"></div>
                            <span className="text-gray-200">Red = &gt;3% (Too high)</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-cyan-500/20">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-cyan-400 font-bold text-lg">★</span>
                          <span className="text-gray-200">Calculated Option: Smallest cable that meets capacity and voltage drop requirements</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {results.recommendedWire && (
                    <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                      <h4 className="text-sm font-bold text-blue-300 mb-2">★ Calculation Breakdown</h4>
                      <div className="space-y-2 text-xs md:text-sm text-blue-200">
                        <p>
                          <strong>Load:</strong> Device draws {results.current}A continuously
                        </p>
                        <p>
                          <strong>Fuse Requirements:</strong>
                        </p>
                        <ul className="ml-6 space-y-1 list-disc text-xs">
                          <li>Must be rated for at least 125% of load = {results.minFuseRating}A minimum</li>
                          <li>Must be less than 80% of cable's rated current to protect the cable</li>
                        </ul>
                        <p>
                          <strong>Cable Option:</strong> {results.recommendedWire.awg} AWG ({results.recommendedWire.mm2} mm²)
                        </p>
                        <ul className="ml-6 space-y-1 list-disc text-xs">
                          <li>Rated capacity: {results.recommendedWire.capacity}A (meets 125% requirement)</li>
                          <li>Maximum fuse allowed: {results.recommendedWire.maxFuseAllowed}A (80% of capacity)</li>
                        </ul>
                        <p>
                          <strong>Fuse Selected:</strong> {results.recommendedWire.recommendedFuse}A
                        </p>
                        <ul className="ml-6 space-y-1 list-disc text-xs">
                          <li>Next standard automotive fuse size that meets both requirements</li>
                        </ul>
                        <p>
                          <strong>Voltage Drop:</strong> {results.recommendedWire.voltageDropPercent}% at {results.lengthDisplay}{results.lengthUnit === "meters" ? "m" : "ft"}
                        </p>
                        <ul className="ml-6 space-y-1 list-disc text-xs">
                          <li>Within the 3% commonly recommended in the automotive industry</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <TrendingDown className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-sm md:text-base">Enter system parameters to compare cable sizes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fuse Sizing Logic Explanation */}
          <Card className="cyber-card border-cyan-500/30 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Info className="w-5 h-5 text-cyan-400" />
                Cable & Fuse Sizing Logic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <h3 className="text-lg font-bold text-blue-300 mb-3">1. Cable Sizing</h3>
                  <div className="space-y-2 text-sm text-blue-200">
                    <p>
                      <strong>Current Capacity:</strong> Cables must be rated to handle at least 125% of the continuous current draw (150% for motor loads). This provides a safety margin for sustained operation and prevents cable overheating.
                    </p>
                    <p>
                      <strong>Voltage Drop:</strong> It is commonly recommended in the automotive industry to keep voltage drop on circuits less than 3% of system voltage. On low voltage circuits (12V/24V), this often requires cables to be much larger than expected based on current capacity alone.
                    </p>
                    <p className="text-xs text-blue-300 italic mt-2">
                      • For 12V systems: Maximum 0.36V drop (0.36V = 3% of 12V)<br/>
                      • For 24V systems: Maximum 0.72V drop (0.72V = 3% of 24V)
                    </p>
                    <p className="text-xs text-orange-200 mt-3 p-2 bg-orange-500/10 rounded border border-orange-500/30">
                      <strong>Note:</strong> In some instances, meeting the 3% voltage drop requirement would require cables so large they are not compatible with some popular devices on the market. Use this calculator as a guide - it calculates results that meet both capacity and voltage drop requirements, but cable sizing compatibility is at the user's discretion.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                  <h3 className="text-lg font-bold text-green-300 mb-3">2. Fuse Sizing</h3>
                  <div className="space-y-2 text-sm text-green-200">
                    <p>
                      <strong>Dual Requirements:</strong> Fuses must protect both the cable and allow the device to operate properly:
                    </p>
                    <ul className="ml-6 space-y-1 list-disc">
                      <li>Must be rated for at least 125% of the load current (prevents nuisance tripping)</li>
                      <li>Must be no more than 80% of the cable's rated capacity (protects cable from overcurrent damage)</li>
                    </ul>
                    <p>
                      <strong>Selection:</strong> Choose the next standard automotive fuse size that satisfies both requirements above.
                    </p>
                    <p className="text-xs text-green-300 italic mt-2">
                      Example: For a 40A load on a 60A cable - Fuse must be ≥50A (125% of load) and ≤48A (80% of cable). No standard fuse fits, so a larger cable is required.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <h3 className="text-lg font-bold text-purple-300 mb-3">3. Practical Example</h3>
                  <div className="space-y-2 text-sm text-purple-200">
                    <p>For a 12V device drawing 80A continuous over 5 meters:</p>
                    <ul className="ml-6 space-y-1">
                      <li><strong>Load with margin:</strong> 80A × 1.25 = 100A minimum fuse requirement</li>
                      <li><strong>Cable requirement:</strong> To use a 100A fuse, cable capacity must be ≥ 100A ÷ 0.80 = 125A</li>
                      <li><strong>Cable selected:</strong> 1 AWG (130A capacity, meets 125A requirement)</li>
                      <li><strong>Maximum fuse for 1 AWG:</strong> 130A × 0.80 = 104A</li>
                      <li><strong>Fuse selected:</strong> 100A (meets load requirement of ≥100A, within cable protection limit of ≤104A)</li>
                      <li><strong>Voltage drop check:</strong> 2.48% at 5 meters - within 3% limit ✓</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Alert className="border-orange-500/30 bg-orange-500/10">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <AlertDescription className="text-orange-200 text-sm">
                  <strong>Important:</strong> These calculations use manufacturer current ratings from 12V Planet. Voltage drop values are derived from BS 7671.
                  Higher ambient temperatures, bundled cables, or enclosed installations require derating (using thicker cables). 
                  Always consult manufacturer specifications and applicable electrical codes like BS 7671.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* References */}
          <Card className="cyber-card border-cyan-500/30 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <ExternalLink className="w-5 h-5 text-cyan-400" />
                References & Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-bold text-white mb-2">UK Wiring Regulations:</h4>
                  <ul className="ml-4 space-y-1">
                    <li>• <strong>BS 7671:2018+A2:2022:</strong> Requirements for Electrical Installations (IET Wiring Regulations 18th Edition)</li>
                    <li>• <strong>Table 4D1B:</strong> Voltage drop values for single-core 70°C thermoplastic insulated copper conductors</li>
                    <li>• <strong>Appendix 4:</strong> Current-carrying capacity and voltage drop for cables and flexible cords</li>
                    <li>• <strong>Section 525:</strong> Voltage drop in consumers' installations - maximum 3% for DC circuits</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2">International Standards:</h4>
                  <ul className="ml-4 space-y-1">
                    <li>• <strong>IEC 60228:</strong> Conductors of insulated cables - standard metric mm² sizes</li>
                    <li>• <strong>ABYC E-11:</strong> American Boat and Yacht Council - AC and DC Electrical Systems on Boats</li>
                    <li>• <strong>NEC Article 310:</strong> National Electrical Code - Conductors for General Wiring</li>
                    <li>• <strong>ISO 13297:</strong> Small craft - Electrical systems - Alternating and direct current installations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2">Fuse Sizing Standards:</h4>
                  <ul className="ml-4 space-y-1">
                    <li>• <strong>BS 7671 Section 433:</strong> Protection against overload current - fuses must be rated at or below conductor capacity</li>
                    <li>• <strong>NEC 240.4(D):</strong> Overcurrent protection for small conductors</li>
                    <li>• <strong>Blue Sea Systems:</strong> Circuit protection sizing guidelines for marine and RV applications</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-cyan-500/30">
                  <h4 className="font-bold text-white mb-2">Calculator Assumptions:</h4>
                  <p className="text-gray-300">
                    <strong>Cable Type:</strong> Single-core multistrand pure copper cable, loose within conduit (Reference Method B - BS 7671)
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong>Ambient Temperature:</strong> 18°C (standard UK reference temperature per BS 7671)
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong>Voltage Drop Values:</strong> Based on BS 7671:2018+A2:2022 Table 4D1B for DC circuits. Values given in mV/A/m (millivolts per amp per meter) and already account for both live and return conductors.
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong>Current Capacity Ratings:</strong> Based on manufacturer specifications from 12V Planet (12voltplanet.co.uk). 
                    These are manufacturer-claimed ratings for flexible tinned copper cable and may differ from BS 7671 current-carrying capacities. 
                    For installations requiring BS 7671 compliance, verify against Table 4D1A or 4D5 as appropriate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="cyber-card border-cyan-500/30 mt-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div className="text-yellow-200 text-sm leading-relaxed space-y-3">
                    <p>
                      This calculator provides guidance only and calculates results that meet both capacity and voltage drop requirements. It is the user's responsibility to ensure that cable sizing is appropriate and compatible with their specific devices and installation.
                    </p>
                    <p>
                      This calculator uses voltage drop values from BS 7671:2018+A2:2022 (UK Wiring Regulations) and current ratings compiled from UK cable suppliers and manufacturers. Regulations and reference materials change regularly, so information within this tool may no longer be accurate.
                    </p>
                    <p>
                      Multiple variables impact proper cable sizing including: installation method, ambient temperature, cable bundling, grouping, insulation type, thermal insulation, derating factors, device compatibility, cable route, and ventilation. Users must verify all variables for their specific installation and make their own informed decisions. Always refer to current regulations in your country to verify compliance and consult with a qualified electrician or electrical engineer for safety-critical installations.
                    </p>
                    <p className="font-semibold">
                      The author assumes no liability for damages or injuries resulting from use of this tool.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
