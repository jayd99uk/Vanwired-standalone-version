
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sun, Battery, Plus, Minus, Info, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const batteryChemistries = {
  lithium: { 
    name: "Lithium (LiFePO4)", 
    dod: 0.80, 
    description: "80% recommended DoD for longevity - can go to 100% but reduces cycle life",
    source: "Battle Born, Renogy, Victron recommendations"
  },
  agm: { 
    name: "AGM (Absorbed Glass Mat)", 
    dod: 0.50, 
    description: "50% maximum DoD - deeper discharge significantly shortens lifespan",
    source: "Victron Energy, Varta, REDARC guidelines"
  },
  leadacid: { 
    name: "Flooded Lead Acid", 
    dod: 0.50, 
    description: "50% maximum DoD - traditional technology, requires regular maintenance",
    source: "Trojan Battery, Crown Battery specifications"
  },
  gel: { 
    name: "Gel Cell", 
    dod: 0.50, 
    description: "50% maximum DoD - better deep discharge tolerance than AGM but still limited",
    source: "Victron Energy, Sonnenschein guidelines"
  }
};

export default function SolarBattery() {
  // Load saved data from localStorage on initial mount
  const [appliances, setAppliances] = useState(() => {
    const saved = localStorage.getItem('vanwired_appliances');
    return saved ? JSON.parse(saved) : [{ name: "", watts: "", hours: "" }];
  });
  
  const [systemVoltage, setSystemVoltage] = useState(() => {
    return localStorage.getItem('vanwired_voltage') || "12";
  });
  
  const [batteryChemistry, setBatteryChemistry] = useState(() => {
    return localStorage.getItem('vanwired_chemistry') || "lithium";
  });
  
  const [safetyMargin, setSafetyMargin] = useState(() => {
    return localStorage.getItem('vanwired_safety') || "25";
  });
  
  const [sunHours, setSunHours] = useState(() => {
    return localStorage.getItem('vanwired_sunhours') || "5";
  });

  const [customBatteryAh, setCustomBatteryAh] = useState(null);
  const [customSolarWatts, setCustomSolarWatts] = useState(null);

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem('vanwired_appliances', JSON.stringify(appliances));
  }, [appliances]);

  useEffect(() => {
    localStorage.setItem('vanwired_voltage', systemVoltage);
  }, [systemVoltage]);

  useEffect(() => {
    localStorage.setItem('vanwired_chemistry', batteryChemistry);
  }, [batteryChemistry]);

  useEffect(() => {
    localStorage.setItem('vanwired_safety', safetyMargin);
  }, [safetyMargin]);

  useEffect(() => {
    localStorage.setItem('vanwired_sunhours', sunHours);
  }, [sunHours]);

  const addAppliance = () => {
    setAppliances([...appliances, { name: "", watts: "", hours: "" }]);
  };

  const removeAppliance = (index) => {
    if (appliances.length > 1) {
      setAppliances(appliances.filter((_, i) => i !== index));
    }
  };

  const updateAppliance = (index, field, value) => {
    const newAppliances = [...appliances];
    newAppliances[index][field] = value;
    setAppliances(newAppliances);
  };

  const calculateResults = () => {
    const totalWattHours = appliances.reduce((total, app) => {
      const watts = parseFloat(app.watts) || 0;
      const hours = parseFloat(app.hours) || 0;
      return total + (watts * hours);
    }, 0);

    if (totalWattHours === 0) return null;

    const voltage = parseFloat(systemVoltage);
    const margin = parseFloat(safetyMargin) / 100;
    const sunHoursDaily = parseFloat(sunHours);
    const dod = batteryChemistries[batteryChemistry].dod;

    const dailyWattHoursWithMargin = totalWattHours * (1 + margin);
    const dailyAmpHours = dailyWattHoursWithMargin / voltage;
    
    // Battery sizing: 48 hours (2 days) autonomy without any solar input
    const batteryDays = 2;
    const usableAhNeeded = dailyAmpHours * batteryDays;
    const batteryAh = usableAhNeeded / dod;
    
    // Minimum battery: 6 hours standalone autonomy (0.25 days)
    const minimumBatteryAh = (dailyAmpHours * 0.25) / dod;
    
    // Solar sizing for exactly 7 days total autonomy
    const targetDays = 7;
    let solarWatts = 0;
    if (sunHoursDaily > 0) {
      // The battery provides 'batteryDays' worth of energy. Solar needs to cover the rest to reach 'targetDays'.
      // Total energy for 'targetDays' = dailyWattHoursWithMargin * targetDays
      // Energy provided by battery's usable capacity over 'targetDays' if replenished = dailyWattHoursWithMargin * batteryDays
      // Daily energy needed from solar = (dailyWattHoursWithMargin * (targetDays - batteryDays)) / targetDays
      const dailySolarGenerationNeededWh = (dailyWattHoursWithMargin * (targetDays - batteryDays)) / targetDays;
      solarWatts = dailySolarGenerationNeededWh / sunHoursDaily;
      if (solarWatts < 0) solarWatts = 0; // Ensure solar Watts are not negative
    } else {
      // If no sun, no solar generation is possible. We will display 0W for solar.
      solarWatts = 0;
    }

    return {
      dailyWattHours: totalWattHours,
      dailyWattHoursWithMargin,
      dailyAmpHours,
      usableAhNeeded,
      batteryAh,
      solarWatts,
      dod: dod * 100,
      batteryDays,
      minimumBatteryAh
    };
  };

  const results = calculateResults();

  // Calculate adjusted values when user tweaks battery or solar
  const getAdjustedSystem = () => {
    if (!results) return null;

    const targetContinuousAutonomyDays = 7;
    const voltage = parseFloat(systemVoltage);
    const sunHoursDaily = parseFloat(sunHours);
    const dod = batteryChemistries[batteryChemistry].dod;
    const dailyWattHoursWithMargin = results.dailyWattHoursWithMargin;

    // Start with values based on custom inputs or original calculations, rounded
    let effectiveBatteryAh = customBatteryAh !== null ? customBatteryAh : Math.ceil(results.batteryAh / 50) * 50;
    let effectiveSolarWatts = customSolarWatts !== null ? customSolarWatts : (results.solarWatts === Infinity || isNaN(results.solarWatts) ? 0 : Math.ceil(results.solarWatts / 50) * 50);

    // If sunHoursDaily is 0, solar cannot generate power, set effectiveSolarWatts to 0
    if (sunHoursDaily === 0) {
        effectiveSolarWatts = 0;
    }

    // Recalculate the other component if one is custom set
    if (customBatteryAh !== null) {
        // User adjusted battery, calculate required solar to meet 7-day goal
        const usableBatteryWh = effectiveBatteryAh * dod * voltage;
        let dailySolarGenerationNeededWh;

        // If battery alone can cover the 7-day target (or more)
        if (usableBatteryWh >= dailyWattHoursWithMargin * targetContinuousAutonomyDays) {
            dailySolarGenerationNeededWh = 0; // No solar needed for autonomy goal
        } else {
            // Solar needs to cover the remainder for 7 days
            // dailySolarGenerationWh = dailyLoadWh - (usableBatteryWh / targetDays)
            dailySolarGenerationNeededWh = dailyWattHoursWithMargin - (usableBatteryWh / targetContinuousAutonomyDays);
        }

        if (sunHoursDaily > 0) {
            effectiveSolarWatts = Math.ceil((dailySolarGenerationNeededWh / sunHoursDaily) / 50) * 50;
            if (effectiveSolarWatts < 0) effectiveSolarWatts = 0; // Ensure no negative solar
        } else {
            effectiveSolarWatts = 0; // No sun hours, no solar generation possible
        }

    } else if (customSolarWatts !== null) {
        // User adjusted solar, calculate required battery to meet 7-day goal
        const dailySolarGenerationWh = effectiveSolarWatts * sunHoursDaily;
        const netDailyLoadWh = dailyWattHoursWithMargin - dailySolarGenerationWh;

        let neededBatteryAh;
        if (netDailyLoadWh <= 0) {
            // Solar covers all daily usage or more. Battery still needs to provide the original 48hr backup
            // (results.batteryAh already includes minimumBatteryAh check)
            neededBatteryAh = results.batteryAh;
        } else {
            // Battery needs to cover the net daily load for targetContinuousAutonomyDays.
            const totalWhToCover = netDailyLoadWh * targetContinuousAutonomyDays;
            const totalAhToCover = totalWhToCover / voltage;
            neededBatteryAh = totalAhToCover / dod;
        }
        effectiveBatteryAh = Math.ceil(neededBatteryAh / 50) * 50;
    }

    // Ensure battery is at least minimum, even if calculated less (e.g., due to user input or rounding)
    effectiveBatteryAh = Math.max(effectiveBatteryAh, Math.ceil(results.minimumBatteryAh / 50) * 50); // Ensure minimum is also rounded
    effectiveBatteryAh = Math.ceil(effectiveBatteryAh / 50) * 50; // Re-round after min check

    // Ensure non-negative values for display
    if (effectiveBatteryAh < 0) effectiveBatteryAh = 0;
    if (effectiveSolarWatts < 0) effectiveSolarWatts = 0;


    // --- Calculate Autonomy with current effective values ---
    const usableBatteryWh = effectiveBatteryAh * dod * voltage;
    const dailyBatteryOnlyAutonomyHours = (usableBatteryWh / dailyWattHoursWithMargin) * 24;
    
    let totalAutonomyDays;
    let dailySolarGenerationWhForAutonomy = effectiveSolarWatts * sunHoursDaily;

    const effectiveDailyLoadOnBatteryWh = dailyWattHoursWithMargin - dailySolarGenerationWhForAutonomy;

    if (effectiveDailyLoadOnBatteryWh <= 0) { // If solar covers all or more than daily usage
      totalAutonomyDays = 30; // Indefinite, cap for display
      if (usableBatteryWh === 0 && dailyWattHoursWithMargin > 0) totalAutonomyDays = 0; // No battery, load exists
    } else if (usableBatteryWh === 0) {
        totalAutonomyDays = 0; // No usable battery and there's a net load
    } else {
      totalAutonomyDays = usableBatteryWh / effectiveDailyLoadOnBatteryWh;
    }
    
    const batteryOnlyDaysDisplay = dailyBatteryOnlyAutonomyHours / 24;
    const isAtMinimum = effectiveBatteryAh <= Math.ceil(results.minimumBatteryAh / 50) * 50;


    return {
      batteryAh: effectiveBatteryAh,
      solarWatts: effectiveSolarWatts,
      batteryOnlyDays: batteryOnlyDaysDisplay.toFixed(1),
      totalDays: Math.min(totalAutonomyDays, 30).toFixed(1),
      isAtMinimum
    };
  };

  const adjustedSystem = getAdjustedSystem();

  const handleBatteryChange = (value) => {
    const numValue = parseFloat(value);
    if (results && !isNaN(numValue) && numValue >= 0) {
      // Round to nearest 50
      const roundedValue = Math.round(numValue / 50) * 50;
      
      // Don't allow below minimum (6 hours), rounding up the minimum to the nearest 50Ah increment
      const minAhRounded = Math.ceil(results.minimumBatteryAh / 50) * 50;
      if (roundedValue < minAhRounded) {
        setCustomBatteryAh(minAhRounded);
      } else {
        setCustomBatteryAh(roundedValue);
      }
      setCustomSolarWatts(null); // Reset solar to let it recalculate
    } else if (value === "") {
      setCustomBatteryAh(null);
      setCustomSolarWatts(null);
    }
  };

  const handleSolarChange = (value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      // Round to nearest 50
      const roundedValue = Math.round(numValue / 50) * 50;
      setCustomSolarWatts(roundedValue);
      setCustomBatteryAh(null); // Reset battery to let it recalculate
    } else if (value === "") {
      setCustomSolarWatts(null);
      setCustomBatteryAh(null);
    }
  };

  const resetToRecommended = () => {
    setCustomBatteryAh(null);
    setCustomSolarWatts(null);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Sun className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>
            Solar & Battery Calculator
          </h1>
          <p className="text-xl text-cyan-300 mb-4">
            Size your power system for reliable off-grid living
          </p>
          
          {/* Goal Explanation */}
          <Alert className="max-w-2xl mx-auto border-blue-500/30 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200 text-sm">
              <strong>System Goal:</strong> Battery provides <strong>48 hours</strong> of backup power without any solar input. 
              Combined with solar panels receiving {sunHours || 'your specified'} hours of daily sun, the system aims for 
              <strong> exactly 7 days</strong> of continuous off-grid operation.
            </AlertDescription>
          </Alert>
        </div>

        {/* System Configuration */}
        <Card className="cyber-card border-cyan-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">System Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="voltage" className="text-gray-200">System Voltage</Label>
                <Select value={systemVoltage} onValueChange={setSystemVoltage}>
                  <SelectTrigger id="voltage" className="w-full mt-2 rounded-xl bg-gray-900/80 border-cyan-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-cyan-500/30">
                    <SelectItem value="12" className="text-white">12V</SelectItem>
                    <SelectItem value="24" className="text-white">24V</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="chemistry" className="text-gray-200">Battery Chemistry</Label>
                <Select value={batteryChemistry} onValueChange={setBatteryChemistry}>
                  <SelectTrigger id="chemistry" className="w-full mt-2 rounded-xl bg-gray-900/80 border-cyan-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-cyan-500/30">
                    {Object.entries(batteryChemistries).map(([key, data]) => (
                      <SelectItem key={key} value={key} className="text-white">{data.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="safety" className="text-gray-200">Safety Margin</Label>
                <Select value={safetyMargin} onValueChange={setSafetyMargin}>
                  <SelectTrigger id="safety" className="w-full mt-2 rounded-xl bg-gray-900/80 border-cyan-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-cyan-500/30">
                    <SelectItem value="20" className="text-white">20%</SelectItem>
                    <SelectItem value="25" className="text-white">25%</SelectItem>
                    <SelectItem value="30" className="text-white">30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sun-hours" className="text-gray-200">Avg. Daily Sun Hours</Label>
                <Input
                  id="sun-hours"
                  type="number"
                  step="0.5"
                  value={sunHours}
                  onChange={(e) => setSunHours(e.target.value)}
                  className="mt-2 rounded-xl bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* Safety Margin Explanation */}
            <Alert className="border-orange-500/30 bg-orange-500/10">
              <Info className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-200 text-sm">
                <strong>Safety Margin:</strong> Adds extra capacity to account for inefficiencies, cloudy days, and unexpected usage. 
                25% is standard for most vanlife setups. Increase to 30% for extreme climates or critical systems.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Your Appliances */}
        <Card className="cyber-card border-cyan-500/30 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-white">Your Daily Appliance Usage</CardTitle>
            <Button
              onClick={addAppliance}
              className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-2 items-center px-1">
              <div className="col-span-5">
                <Label className="text-xs font-medium text-gray-300">Appliance Name</Label>
              </div>
              <div className="col-span-3">
                <Label className="text-xs font-medium text-gray-300">Watts</Label>
              </div>
              <div className="col-span-3">
                <Label className="text-xs font-medium text-gray-300">Hours/Day</Label>
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Appliance Inputs */}
            <div className="space-y-3">
              {appliances.map((appliance, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      value={appliance.name}
                      onChange={(e) => updateAppliance(index, 'name', e.target.value)}
                      placeholder="e.g., Fridge"
                      className="rounded-lg text-sm bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={appliance.watts}
                      onChange={(e) => updateAppliance(index, 'watts', e.target.value)}
                      placeholder="40"
                      className="rounded-lg text-sm bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.5"
                      value={appliance.hours}
                      onChange={(e) => updateAppliance(index, 'hours', e.target.value)}
                      placeholder="8"
                      className="rounded-lg text-sm bg-gray-900/80 border-cyan-500/30 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAppliance(index)}
                      className="text-red-400 hover:text-red-300 h-8 w-8"
                      disabled={appliances.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Recommendation */}
        {results ? (
          <div className="space-y-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cyber-card border-green-500/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Sun className="w-5 h-5 text-green-400" />
                    Recommended Solar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold mb-2 text-green-300">
                      {(adjustedSystem?.solarWatts || 0) + "W"}
                    </div>
                    <p className="text-green-200 text-sm mb-4">
                      Solar capacity to partially offset your daily {results.dailyWattHoursWithMargin.toFixed(0)}Wh usage, 
                      extending your {adjustedSystem?.batteryOnlyDays || "2.0"}-day battery backup to exactly 7 days off-grid with {sunHours} hours of daily sun.
                      {parseFloat(sunHours) === 0 && <span className="block text-orange-300 text-xs mt-1">(No sun hours entered, solar cannot replenish)</span>}
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="solar-adjust" className="text-gray-200 text-sm mb-2 block">Adjust Solar Capacity</Label>
                    <div className="flex gap-2">
                      <Input
                        id="solar-adjust"
                        type="number"
                        step="50"
                        value={customSolarWatts !== null ? customSolarWatts : (adjustedSystem?.solarWatts || 0)}
                        onChange={(e) => handleSolarChange(e.target.value)}
                        className="bg-gray-900/80 border-green-500/30 text-white"
                      />
                      <span className="text-gray-300 flex items-center">W</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card border-blue-500/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Battery className="w-5 h-5 text-blue-400" />
                    Recommended Battery Bank
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold mb-2 text-blue-300">
                      {(adjustedSystem?.batteryAh || 0) + "Ah"}
                    </div>
                    <p className="text-blue-200 text-sm mb-2">
                      {batteryChemistries[batteryChemistry].name} at {systemVoltage}V provides {adjustedSystem?.batteryOnlyDays || "2.0"} days of power without any solar input.
                    </p>
                    <p className="text-blue-300 text-xs mb-4">
                      Usable capacity: {Math.ceil((adjustedSystem?.batteryAh || 0) * batteryChemistries[batteryChemistry].dod)}Ah ({results.dod}% DoD)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="battery-adjust" className="text-gray-200 text-sm mb-2 block">Adjust Battery Capacity</Label>
                    <div className="flex gap-2">
                      <Input
                        id="battery-adjust"
                        type="number"
                        step="50"
                        min={Math.ceil(results.minimumBatteryAh / 50) * 50} // Ensure displayed min is rounded
                        value={customBatteryAh !== null ? customBatteryAh : (adjustedSystem?.batteryAh || 0)}
                        onChange={(e) => handleBatteryChange(e.target.value)}
                        className="bg-gray-900/80 border-blue-500/30 text-white"
                      />
                      <span className="text-gray-300 flex items-center">Ah</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Minimum: {Math.ceil(results.minimumBatteryAh / 50) * 50}Ah (6 hours autonomy)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Performance Summary */}
            {adjustedSystem && (
              <Card className="cyber-card border-purple-500/40">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Adjusted System Performance</h3>
                    {(customBatteryAh !== null || customSolarWatts !== null) && (
                      <Button
                        onClick={resetToRecommended}
                        variant="outline"
                        size="sm"
                        className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                      >
                        Reset to Recommended
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                      <div className="text-2xl font-bold text-blue-300 mb-1">{adjustedSystem.batteryOnlyDays}</div>
                      <div className="text-sm text-blue-200">Days on Battery Alone</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                      <div className="text-2xl font-bold text-green-300 mb-1">{sunHours}h</div>
                      <div className="text-sm text-green-200">Daily Sun Hours</div>
                    </div>
                    <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-300 mb-1">{adjustedSystem.totalDays}{parseFloat(adjustedSystem.totalDays) >= 30 ? "+" : ""}</div>
                      <div className="text-sm text-purple-200">Days Total Autonomy</div>
                    </div>
                  </div>
                  
                  {adjustedSystem.isAtMinimum && (
                    <Alert className="mt-4 border-orange-500/30 bg-orange-500/10">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <AlertDescription className="text-orange-200 text-sm">
                        <strong>Warning:</strong> Battery capacity is at minimum ({Math.ceil(results.minimumBatteryAh / 50) * 50}Ah, 6 hours autonomy). Consider increasing for better reliability.
                      </AlertDescription>
                    </Alert>
                  )}
                  {parseFloat(adjustedSystem.totalDays) < 7 && (
                    <Alert className="mt-4 border-yellow-500/30 bg-yellow-500/10">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <AlertDescription className="text-yellow-200 text-sm">
                        <strong>Note:</strong> With current settings, total autonomy is less than the target 7 days. Consider increasing battery or solar capacity.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="cyber-card border-cyan-500/30 mb-8">
            <CardContent className="text-center py-12 text-gray-400">
              <Sun className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p>Add appliances and their daily usage to see your recommendations.</p>
            </CardContent>
          </Card>
        )}

        {/* Energy Breakdown */}
        {results && (
          <Card className="cyber-card border-cyan-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-white">Energy Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg border border-cyan-500/20">
                <span className="text-gray-200">Daily Usage (Base)</span>
                <span className="font-semibold text-white">{results.dailyWattHours.toFixed(0)} Wh</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg border border-cyan-500/20">
                <span className="text-gray-200">Usage with {safetyMargin}% Safety Margin</span>
                <span className="font-semibold text-white">{results.dailyWattHoursWithMargin.toFixed(0)} Wh</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg border border-cyan-500/20">
                <span className="text-gray-200">Daily Amp Hours Required</span>
                <span className="font-semibold text-white">{results.dailyAmpHours.toFixed(1)} Ah</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg border border-cyan-500/20">
                <span className="text-gray-200">Battery Autonomy (No Solar)</span>
                <span className="font-semibold text-white">{adjustedSystem ? adjustedSystem.batteryOnlyDays : results.batteryDays.toFixed(1)} Days</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg border border-cyan-500/20">
                <span className="text-gray-200">Usable Capacity Needed</span>
                <span className="font-semibold text-white">{results.usableAhNeeded.toFixed(1)} Ah</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg border border-cyan-500/20">
                <span className="text-gray-200">Average Daily Sun Hours</span>
                <span className="font-semibold text-white">{sunHours}h</span>
              </div>
              <div className="flex justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/40">
                <span className="text-green-200 font-semibold">Combined System Duration</span>
                <span className="font-bold text-green-300">{adjustedSystem ? `${adjustedSystem.totalDays}${parseFloat(adjustedSystem.totalDays) >= 30 ? "+" : ""}` : "7.0"} Days</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Battery Chemistry Information */}
        <Card className="cyber-card border-cyan-500/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <Info className="w-5 h-5 text-cyan-400" />
              Battery Chemistry Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-500/30 bg-blue-500/10">
              <Battery className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                <strong>Depth of Discharge (DoD)</strong> is the percentage of battery capacity you can safely use. 
                Exceeding recommended DoD significantly reduces battery lifespan and cycle count.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(batteryChemistries).map(([key, data]) => (
                <div key={key} className="p-4 bg-gray-900/50 rounded-xl border border-cyan-500/20">
                  <h4 className="font-bold text-white mb-1">{data.name}</h4>
                  <div className="text-cyan-300 font-semibold mb-2">{(data.dod * 100).toFixed(0)}% Recommended DoD</div>
                  <p className="text-sm text-gray-300 mb-2">{data.description}</p>
                  <p className="text-xs text-gray-400 italic">Source: {data.source}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-cyan-500/30">
              <p className="text-sm text-gray-300 leading-relaxed mb-2">
                <strong className="text-white">Example:</strong> If you need 200Ah of usable capacity (for 48 hours in this calculator):
              </p>
              <ul className="space-y-1 text-sm text-gray-300 ml-4">
                <li>• <strong className="text-cyan-300">Lithium (80% DoD):</strong> 250Ah battery bank required (200Ah ÷ 0.80)</li>
                <li>• <strong className="text-cyan-300">AGM/Lead Acid/Gel (50% DoD):</strong> 400Ah battery bank required (200Ah ÷ 0.50)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* References & Disclaimer */}
        <Card className="cyber-card border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <ExternalLink className="w-5 h-5 text-cyan-400" />
              References & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong className="text-white">Battery DoD Sources:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Lithium: Battle Born Batteries technical specs, Renogy installation guides, Victron Energy recommendations</li>
                <li>• AGM: Victron Energy battery guidelines, Varta automotive specifications, REDARC installation manuals</li>
                <li>• Flooded Lead Acid: Trojan Battery user guides, Crown Battery technical documentation</li>
                <li>• Gel: Victron Energy gel battery specs, Sonnenschein/Exide technical manuals</li>
              </ul>
            </div>
            
            <div className="pt-4 border-t border-cyan-500/30">
              <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-200 leading-relaxed">
                  <strong className="block mb-1">Important:</strong>
                  This calculator provides estimates based on manufacturer recommendations current at time of publication. 
                  Actual performance varies with temperature, age, charge/discharge rates, and usage patterns. 
                  Always verify specifications with your specific battery and solar equipment manufacturers. 
                  Consult a qualified solar installer for professional system design.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
