// app/admin/categories/TeslaCategoryAutoSetup.tsx
"use client";

import { useState } from "react";
import { Zap, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface SetupResults {
  success: boolean;
  totalCreated?: number;
  error?: string;
}

const TeslaCategoryAutoSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SetupResults | null>(null);

  // Complete Tesla Model 3 category hierarchy from your Excel file
const teslaHierarchy = {
  name: "Model 3",
  description: "Tesla Model 3 parts and components",
  children: [
    {
      name: "Model 3 - BODY",
      description: "Body components and panels for Tesla Model 3",
      children: [
        { name: "M3 1001 - Bumper and Fascia", description: "Front and rear bumpers, fascia components" },
        { name: "M3 1010 - Body Panels", description: "Door panels, quarter panels, body structural components" },
        { name: "M3 1020 - Windshield and Body Glass", description: "Glass components including windshield and windows" }
      ]
    },
    {
      name: "Model 3 - BRAKES",
      description: "Brake system components for Tesla Model 3",
      children: [
        { name: "M3 3301 - Brake Discs and Calipers", description: "Brake system components and assemblies" },
        { name: "M3 3303 - Brake Pipes and Hoses", description: "Brake system components and assemblies" },
        { name: "M3 3310 - ABS, Traction and Stability Control", description: "Electronic brake control systems" },
        { name: "M3 3320 - Electromechanical Brake Booster", description: "Brake assistance and boosting systems" },
        { name: "M3 3325 - Brake Pedal", description: "Brake pedal assemblies and components" }
      ]
    },
    {
      name: "Model 3 - CHASSIS",
      description: "Chassis and structural components for Tesla Model 3",
      children: [
        { name: "M3 3001 - Chassis and Subframes", description: "Main chassis structure and subframe components" }
      ]
    },
    {
      name: "Model 3 - CLOSURE COMPONENTS",
      description: "Door, trunk, and closure components for Tesla Model 3",
      children: [
        { name: "M3 1120 - Trunk", description: "Trunk lid, latch, and related components" },
        { name: "M3 1133 - Closure Assist Mechanisms and Hinges", description: "Door hinges, assist mechanisms, and hardware" },
        { name: "M3 1145 - Exterior Door Handles", description: "Exterior door handle assemblies and components" },
        { name: "M3 1150 - Door Glass Regulators", description: "Window regulators and glass mechanisms" },
        { name: "M3 1170 - Seals Body Closures", description: "Weather seals and closure sealing components" }
      ]
    },
    {
      name: "Model 3 - ELECTRICAL",
      description: "Electrical systems and components for Tesla Model 3",
      children: [
        { name: "M3 1701 - 12V Battery and Fuses", description: "12V electrical system components" },
        { name: "M3 1702 - LV Battery", description: "Low voltage battery systems" },
        { name: "M3 1710 - Harnesses", description: "Electrical wiring harnesses" },
        { name: "M3 1715 - Electronic Control Modules", description: "ECU and control modules" },
        { name: "M3 1720 - Radar Sensors", description: "Radar sensor systems for autopilot" },
        { name: "M3 1723 - Front Camera", description: "Front-facing camera systems" },
        { name: "M3 1724 - Interior Camera", description: "Interior monitoring camera systems" },
        { name: "M3 1727 - Parking Sensors", description: "Ultrasonic parking sensor systems" },
        { name: "M3 1740 - Exterior Lights", description: "Headlights, taillights, and exterior lighting" },
        { name: "M3 1745 - Keyless Entry and Security", description: "Key fob, security, and access systems" },
        { name: "M3 1750 - Wipers and Washers", description: "Windshield wiper and washer systems" },
        { name: "M3 1753 - Horn", description: "Horn assemblies and components" },
        { name: "M3 1755 - Accelerator Pedal", description: "Electronic accelerator pedal systems" },
        { name: "M3 1756 - Temperature and Humidity Sensors", description: "Climate monitoring sensors" }
      ]
    },
    {
      name: "Model 3 - EXTERIOR FITTINGS",
      description: "Exterior trim and fitting components for Tesla Model 3",
      children: [
        { name: "M3 1201 - Wheel Arch Liners", description: "Wheel well liners and protective components" },
        { name: "M3 1203 - Undertray and Diffuser", description: "Underbody panels and aerodynamic components" },
        { name: "M3 1205 - Badges and Films", description: "Exterior badges, emblems, and protective films" },
        { name: "M3 1207 - License Plate Mountings", description: "License plate brackets and mounting hardware" },
        { name: "M3 1209 - Exterior Mirrors", description: "Side mirrors and mirror components" },
        { name: "M3 1220 - Exterior Trim", description: "Exterior trim pieces and moldings" },
        { name: "M3 1225 - Underhood Trim", description: "Engine bay trim and protective components" }
      ]
    },
    {
      name: "Model 3 - EXTERNAL CHARGING CONNECTORS",
      description: "Charging port and connector components for Tesla Model 3",
      children: [
        { name: "M3 5001 - Mobile Connector", description: "Mobile charging connector and accessories" }
      ]
    },
    {
      name: "Model 3 - FRONT DRIVE UNIT",
      description: "Front motor and drive unit components for Tesla Model 3",
      children: [
        { name: "M3 3901 - Front Drive Unit Assembly", description: "Complete front drive unit assemblies" },
        { name: "M3 3930 - Front Gearbox and Halfshafts", description: "Front transmission and drive shafts" }
      ]
    },
    {
      name: "Model 3 - HIGH VOLTAGE SYSTEM",
      description: "High voltage electrical components for Tesla Model 3",
      children: [
        { name: "M3 4401 - Charge System Inlet", description: "High voltage charging inlet systems" },
        { name: "M3 4450 - HV Harnesses", description: "High voltage wiring harnesses" }
      ]
    },
    {
      name: "Model 3 - HV BATTERY SYSTEM",
      description: "High voltage battery system components for Tesla Model 3",
      children: [
        { name: "M3 1601 - HV Battery Assembly", description: "High voltage battery pack assemblies" },
        { name: "M3 1630 - HV Battery Electrical Components", description: "Battery management and electrical components" }
      ]
    },
    {
      name: "Model 3 - INFOTAINMENT",
      description: "Entertainment and information system components for Tesla Model 3",
      children: [
        { name: "M3 2107 - Touchscreen", description: "Center console touchscreen displays" },
        { name: "M3 2110 - Car Computer", description: "Main vehicle computer systems" },
        { name: "M3 2121 - Audio System - Speakers, Subwoofer and Amplifier", description: "Audio system components" },
        { name: "M3 2130 - Antenna - AM, FM and HD Radio", description: "Radio antenna systems" },
        { name: "M3 2132 - Antenna - GPS", description: "GPS antenna systems" },
        { name: "M3 2133 - Antenna - Wi-Fi", description: "Wi-Fi antenna systems" }
      ]
    },
    {
      name: "Model 3 - INSTRUMENT PANEL",
      description: "Dashboard and instrument panel components for Tesla Model 3",
      children: [
        { name: "M3 1405 - Instrument Panel", description: "Dashboard and instrument panel assemblies" }
      ]
    },
    {
      name: "Model 3 - INTERIOR TRIM",
      description: "Interior trim and finishing components for Tesla Model 3",
      children: [
        { name: "M3 1505 - Interior Mirror and Sun Visors", description: "Interior mirrors and sun visor assemblies" },
        { name: "M3 1511 - Trunk Trim", description: "Trunk interior trim and finishing" },
        { name: "M3 1513 - Door Trim", description: "Interior door trim panels and components" },
        { name: "M3 1518 - Pillar and Sill Trim", description: "A/B/C pillar and door sill trim" },
        { name: "M3 1519 - Center Console", description: "Center console assemblies and components" },
        { name: "M3 1520 - Headliner", description: "Roof headliner and overhead trim" },
        { name: "M3 1524 - Luggage Compartment Trim", description: "Cargo area trim and finishing" },
        { name: "M3 1530 - Carpeting and Mats", description: "Floor carpets and protective mats" }
      ]
    },
    {
      name: "Model 3 - REAR DRIVE UNIT",
      description: "Rear motor and drive unit components for Tesla Model 3",
      children: [
        { name: "M3 4001 - Rear Drive Unit Assembly", description: "Complete rear drive unit assemblies" },
        { name: "M3 4020 - Rear Drive Inverter", description: "Rear motor inverter systems" },
        { name: "M3 4030 - Rear Gearbox and Halfshafts", description: "Rear transmission and drive shafts" }
      ]
    },
    {
      name: "Model 3 - SAFETY AND RESTRAINT",
      description: "Safety systems and restraint components for Tesla Model 3",
      children: [
        { name: "M3 2001 - Air Bags", description: "Airbag systems and components" },
        { name: "M3 2005 - Seat Belts", description: "Seat belt assemblies and components" },
        { name: "M3 2010 - Pre-Tensioners", description: "Seat belt pre-tensioner systems" },
        { name: "M3 2020 - Sensors", description: "Safety monitoring sensors" }
      ]
    },
    {
      name: "Model 3 - SEATS",
      description: "Seat assemblies and components for Tesla Model 3",
      children: [
        { name: "M3 1301 - Front Seat Tracks and Motors", description: "Front seat adjustment mechanisms and motors" },
        { name: "M3 1302 - 2nd Row Seat Tracks and Motors", description: "Rear seat adjustment mechanisms and motors" },
        { name: "M3 1304 - Front Seat Assemblies and Hardware", description: "Front seat assemblies and mounting hardware" },
        { name: "M3 1305 - 2nd Row Seat Assemblies and Hardware", description: "Rear seat assemblies and mounting hardware" },
        { name: "M3 1307 - Front Seat Covers, Pads and Trims", description: "Front seat upholstery and trim components" },
        { name: "M3 1308 - 2nd Row Seat Covers, Pads and Trims", description: "Rear seat upholstery and trim components" }
      ]
    },
    {
      name: "Model 3 - STEERING",
      description: "Steering system components for Tesla Model 3",
      children: [
        { name: "M3 3201 - Steering Rack and Lower Column", description: "Steering rack and lower column assemblies" },
        { name: "M3 3205 - Upper Column and Steering Wheel", description: "Upper steering column and wheel assemblies" }
      ]
    },
    {
      name: "Model 3 - SUSPENSION",
      description: "Suspension system components for Tesla Model 3",
      children: [
        { name: "M3 3101 - Front Suspension (including Hubs)", description: "Front suspension system components" },
        { name: "M3 3103 - Rear Suspension (including Hubs)", description: "Rear suspension system components" },
        { name: "M3 3115 - Coil Spring Suspension System", description: "Coil spring suspension components" }
      ]
    },
    {
      name: "Model 3 - THERMAL MANAGEMENT",
      description: "Cooling and thermal management components for Tesla Model 3",
      children: [
        { name: "M3 1810 - Cabin HVAC", description: "Cabin heating, ventilation, and air conditioning" },
        { name: "M3 1820 - Refrigerant System", description: "AC refrigerant system components" },
        { name: "M3 1830 - Cooling System", description: "Coolant system components" },
        { name: "M3 1840 - Thermal System", description: "Thermal management system components" },
        { name: "M3 1850 - Air Distribution", description: "Air distribution and duct components" }
      ]
    },
    {
      name: "Model 3 - WHEELS AND TIRES",
      description: "Wheels, tires, and related components for Tesla Model 3",
      children: [
        { name: "M3 3401 - Wheels", description: "Wheel assemblies and components" },
        { name: "M3 3404 - Tire Pressure Monitoring System (TPMS)", description: "TPMS sensors and components" }
      ]
    }
  ]
};

  const handleAutoSetup = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/categories/tesla-auto-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hierarchy: teslaHierarchy })
      });

      const result = await response.json();
      setResults(result);

      if (result.success) {
        // Refresh the page to show new categories
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error setting up Tesla categories:', error);
      setResults({
        success: false,
        error: 'Failed to connect to server'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 mb-8">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-blue-900 mb-3">
            Tesla Model 3 Category Auto-Setup
          </h3>
          
          <p className="text-blue-700 mb-6 text-lg">
            Create the complete Tesla Model 3 category hierarchy with one click. This will set up all categories exactly as they appear in your Excel file.
          </p>

          <div className="bg-white rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">What will be created:</h4>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">1</div>
                <div className="text-gray-600">Root Category</div>
                <div className="text-xs text-gray-500 mt-1">Model 3</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">20</div>
                <div className="text-gray-600">Main Categories</div>
                <div className="text-xs text-gray-500 mt-1">Model 3 - BODY, etc.</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">82</div>
                <div className="text-gray-600">Subcategories</div>
                <div className="text-xs text-gray-500 mt-1">M3 1001 - Bumper, etc.</div>
              </div>
            </div>
          </div>

          {!results ? (
            <button
              onClick={handleAutoSetup}
              disabled={isLoading}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-3 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Creating Categories...</span>
                </>
              ) : (
                <>
                
                  <span>Create All Tesla Categories</span>
                </>
              )}
            </button>
          ) : (
            <div className={`rounded-lg p-6 ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center space-x-3 mb-4">
                {results.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
                <h4 className={`font-semibold ${results.success ? 'text-green-900' : 'text-red-900'}`}>
                  {results.success ? 'Categories Created Successfully!' : 'Setup Failed'}
                </h4>
              </div>
              
              {results.success ? (
                <div className="space-y-2">
                  <p className="text-green-700">
                    ✅ Created {results.totalCreated} categories in perfect hierarchy
                  </p>
                  <p className="text-green-700">
                    ✅ All Tesla Model 3 categories are now ready for product import
                  </p>
                  <p className="text-sm text-green-600 mt-4">
                    Page will refresh automatically to show your new categories...
                  </p>
                </div>
              ) : (
                <p className="text-red-700">
                  {results.error || 'An error occurred during setup'}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-blue-600 mt-4">
            💡 After setup, you can import your 1,089 Tesla Model 3 products and they will automatically organize into the correct categories!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeslaCategoryAutoSetup;