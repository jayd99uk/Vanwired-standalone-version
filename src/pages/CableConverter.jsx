
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cable, ArrowUpDown, Info, ExternalLink, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const awgToMmData = {
  "4/0": { mm: 120, victron_current: "275A", manufacturer_current: "295A", use: "Main battery cables, inverter connections" },
  "2/0": { mm: 70, victron_current: "190A", manufacturer_current: "235A", use: "High-current DC connections" },
  "1/0": { mm: 50, victron_current: "150A", manufacturer_current: "180A", use: "Heavy duty battery cables" },
  "1": { mm: 50, victron_current: "130A", manufacturer_current: "180A", use: "Main power distribution" },
  "2": { mm: 35, victron_current: "115A", manufacturer_current: "140A", use: "Inverter to battery bank" },
  "4": { mm: 25, victron_current: "85A", manufacturer_current: "110A", use: "Shore power, generator connections" },
  "6": { mm: 16, victron_current: "65A", manufacturer_current: "80A", use: "Solar charge controllers, DC-DC chargers" },
  "8": { mm: 10, victron_current: "50A", manufacturer_current: "60A", use: "Refrigerators, fans, pumps" },
  "10": { mm: 6, victron_current: "35A", manufacturer_current: "41A", use: "LED lighting circuits, 12V outlets" },
  "12": { mm: 4, victron_current: "25A", manufacturer_current: "32A", use: "Low power devices, control circuits" },
  "14": { mm: 2.5, victron_current: "20A", manufacturer_current: "24A", use: "Interior lighting, USB outlets" },
  "16": { mm: 1.5, victron_current: "13A", manufacturer_current: "17A", use: "Signal wires, low current applications" },
  "18": { mm: 1, victron_current: "10A", manufacturer_current: "11A", use: "Thermostats, sensors" }
};

// Create ordered array from largest AWG (smallest number) to smallest AWG (largest number) for the dropdown.
// Object.keys(awgToMmData) naturally maintains the order as defined (4/0, 2/0, 1/0, 1, 2, ... 18)
const orderedAwgSizes = Object.keys(awgToMmData);

// Create an ordered array of objects for the Quick Reference Table, sorted by mm² from smallest to largest.
const cableTableEntries = Object.entries(awgToMmData)
  .map(([awg, data]) => ({
    awg: awg,
    mm: data.mm,
    victron_current: data.victron_current,
    manufacturer_current: data.manufacturer_current,
  }))
  .sort((a, b) => a.mm - b.mm); // Sort by mm value ascending

export default function CableConverter() {
  const [awgInput, setAwgInput] = useState("");
  const [mmInput, setMmInput] = useState("");
  const [awgResult, setAwgResult] = useState(null);
  const [mmResult, setMmResult] = useState(null);

  const convertAwgToMm = (awg) => {
    const data = awgToMmData[awg];
    if (data) {
      setMmResult({ mm: data.mm, victron_current: data.victron_current, manufacturer_current: data.manufacturer_current, use: data.use });
    } else {
      setMmResult(null);
    }
  };

  const convertMmToAwg = (mm) => {
    const mmValue = parseFloat(mm);
    if (isNaN(mmValue)) {
      setAwgResult(null);
      return;
    }

    let closestAwg = null;
    let closestDiff = Infinity;

    // Iterate through the data to find the closest mm² match
    Object.entries(awgToMmData).forEach(([awg, data]) => {
      const diff = Math.abs(data.mm - mmValue);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestAwg = { awg, ...data };
      }
    });

    setAwgResult(closestAwg);
  };

  const handleAwgChange = (value) => {
    setAwgInput(value);
    if (value) {
      convertAwgToMm(value);
      setMmInput("");
    } else {
      setMmResult(null);
    }
  };

  const handleMmChange = (value) => {
    setMmInput(value);
    if (value) {
      convertMmToAwg(value);
      setAwgInput("");
    } else {
      setAwgResult(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase" style={{fontFamily: 'Orbitron, sans-serif'}}>
            Cable Converter
          </h1>
          <p className="text-cyan-300 text-lg">
            AWG ↔ mm² Conversion Tool
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-6 cyber-card border-orange-500/30">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-200">
            <strong>Note:</strong> AWG measures diameter, mm² measures cross-sectional area. The mm² values shown here are standard metric cable sizes (nearest equivalent to AWG).
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* AWG to mm² */}
          <Card className="cyber-card border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-300 text-xl">
                <span className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  AWG
                </span>
                AWG to mm²
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="awg-input" className="text-gray-200">Select AWG Size</Label>
                <select
                  id="awg-input"
                  value={awgInput}
                  onChange={(e) => handleAwgChange(e.target.value)}
                  className="w-full mt-2 p-3 bg-gray-900/80 border border-cyan-500/30 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="" className="bg-gray-900">Select AWG size</option>
                  {orderedAwgSizes.map(awg => (
                    <option key={awg} value={awg} className="bg-gray-900">{awg} AWG</option>
                  ))}
                </select>
              </div>

              {mmResult && (
                <div className="border-2 border-cyan-500/50 rounded-xl p-4 bg-cyan-500/10">
                  <div className="text-3xl font-bold text-cyan-300 mb-3">{mmResult.mm} mm²</div>
                  <div className="text-sm space-y-1 text-gray-200">
                    <div><strong className="text-cyan-300">Victron:</strong> {mmResult.victron_current}</div>
                    <div><strong className="text-cyan-300">Manufacturer Claims:</strong> {mmResult.manufacturer_current}</div>
                    <div className="pt-2 border-t border-cyan-500/30"><strong className="text-cyan-300">Use:</strong> {mmResult.use}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* mm² to AWG */}
          <Card className="cyber-card border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-300 text-xl">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  mm²
                </span>
                mm² to AWG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mm-input" className="text-gray-200">Enter mm² Size</Label>
                <Input
                  id="mm-input"
                  type="number"
                  step="0.1"
                  value={mmInput}
                  onChange={(e) => handleMmChange(e.target.value)}
                  placeholder="e.g., 16"
                  className="mt-2 bg-gray-900/80 border-purple-500/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-xl"
                />
              </div>

              {awgResult && (
                <div className="border-2 border-purple-500/50 rounded-xl p-4 bg-purple-500/10">
                  <div className="text-3xl font-bold text-purple-300 mb-1">{awgResult.awg} AWG</div>
                  <div className="text-sm text-gray-300 mb-3">(Closest Match: {awgResult.mm} mm²)</div>
                  <div className="text-sm space-y-1 text-gray-200">
                    <div><strong className="text-purple-300">Victron:</strong> {awgResult.victron_current}</div>
                    <div><strong className="text-purple-300">Manufacturer Claims:</strong> {awgResult.manufacturer_current}</div>
                    <div className="pt-2 border-t border-purple-500/30"><strong className="text-purple-300">Use:</strong> {awgResult.use}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Reference Table */}
        <Card className="cyber-card border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-xl">
              <ArrowUpDown className="w-5 h-5 text-cyan-400" />
              Quick Reference (Smallest to Largest)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-cyan-500/30">
                    <th className="text-left py-3 px-2 font-bold text-cyan-300">mm²</th>
                    <th className="text-left py-3 px-2 font-bold text-cyan-300">AWG</th>
                    <th className="text-left py-3 px-2 font-bold text-cyan-300">Victron</th>
                    <th className="text-left py-3 px-2 font-bold text-cyan-300">Mfr.</th>
                  </tr>
                </thead>
                <tbody>
                  {cableTableEntries.map((entry) => {
                    return (
                      <tr key={entry.awg} className="border-b border-gray-700/50 hover:bg-cyan-500/5">
                        <td className="py-3 px-2 font-medium text-white">{entry.mm}</td>
                        <td className="py-3 px-2 text-gray-200">{entry.awg}</td>
                        <td className="py-3 px-2 font-medium text-blue-300">{entry.victron_current}</td>
                        <td className="py-3 px-2 font-medium text-green-300">{entry.manufacturer_current}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">
              Mfr. = Manufacturer current claims from cable suppliers
            </p>
          </CardContent>
        </Card>

        {/* References */}
        <Card className="cyber-card border-cyan-500/30 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-cyan-400" />
              References & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300 space-y-2">
              <p>• AWG sizes mapped to nearest standard metric mm² equivalents (IEC 60228)</p>
              <p>• Victron ratings: Victron Energy cable sizing guidelines</p>
              <p>• Manufacturer claims: 12voltplanet.co.uk cable specifications</p>
              <p>• All ratings assume 30°C ambient temperature</p>
            </div>
            
            <div className="pt-4 border-t border-cyan-500/30">
              <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-200 leading-relaxed">
                  <strong className="block mb-1">Important:</strong>
                  AWG and mm² are different measurement systems. AWG measures wire diameter while mm² measures cross-sectional area.
                  The mm² values shown are standard metric cable sizes (nearest equivalent). This data was accurate at the time of publication, 
                  but specifications and standards may have changed since. This tool is provided as a general guide only. Always verify cable 
                  specifications directly with the supplier of the cable you have purchased and consult the manufacturer's datasheets for your specific application.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
