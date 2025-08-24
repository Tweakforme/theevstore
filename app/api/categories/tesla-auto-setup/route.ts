// app/api/categories/tesla-auto-setup/route.ts - EXACT CATEGORIES FROM YOUR SPECIFICATION
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    let totalCreated = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    // Get existing categories
    const existingCategories = await prisma.category.findMany({
      select: { name: true }
    });
    const existingNames = new Set(existingCategories.map(cat => cat.name));

    // Get starting sort order
    const lastCategory = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' }
    });
    let sortOrder = (lastCategory?.sortOrder || 0) + 1;

    // Simple function to create category with better duplicate handling
    async function createCategory(name: string, description: string, parentId: string | null = null, level: number = 1) {
      // Check if category already exists by name OR slug
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const existing = await prisma.category.findFirst({
        where: {
          OR: [
            { name: name },
            { slug: slug }
          ]
        }
      });

      if (existing) {
        console.log(`⏭️  Skipping existing: ${name}`);
        totalSkipped++;
        return existing.id;
      }
      
      const category = await prisma.category.create({
        data: { name, slug, description, parentId, level, isActive: true, sortOrder: sortOrder++ }
      });

      totalCreated++;
      console.log(`✅ Created: ${name}`);
      return category.id;
    }

    console.log('🚀 Setting up EXACT Tesla Model 3 & Y categories...');

    // ============================================
    // TESLA MODEL 3 - EXACT STRUCTURE
    // ============================================
    const model3Id = await createCategory('TESLA MODEL 3', 'Tesla Model 3 Parts and Components', null, 1);

    if (model3Id) {
      // 10 - BODY
      const body10Id = await createCategory('10 - BODY', 'Body components and panels', model3Id, 2);
      if (body10Id) {
        await createCategory('1001 - Bumper and Fascia', 'Bumper and fascia components', body10Id, 3);
        await createCategory('1010 - Body Panels', 'Body panels and structural components', body10Id, 3);
        await createCategory('1020 - Windshield and Body Glass', 'Glass components', body10Id, 3);
      }

      // 11 - CLOSURE COMPONENTS
      const closure11Id = await createCategory('11 - CLOSURE COMPONENTS', 'Closure systems and components', model3Id, 2);
      if (closure11Id) {
        await createCategory('1120 - Trunk', 'Trunk components and hardware', closure11Id, 3);
        await createCategory('1133 - Closure Assist Mechanisms and Hinges', 'Door hinges and assist mechanisms', closure11Id, 3);
        await createCategory('1145 - Exterior Door Handles', 'Door handle assemblies', closure11Id, 3);
        await createCategory('1150 - Door Glass Regulators', 'Window regulators and motors', closure11Id, 3);
        await createCategory('1170 - Seals Body Closures', 'Weather stripping and seals', closure11Id, 3);
      }

      // 12 - EXTERIOR FITTINGS
      const exterior12Id = await createCategory('12 - EXTERIOR FITTINGS', 'Exterior fittings and components', model3Id, 2);
      if (exterior12Id) {
        await createCategory('1201 - Wheel Arch Liners', 'Wheel arch liners', exterior12Id, 3);
        await createCategory('1203 - Undertray and Diffuser', 'Undertray and diffuser components', exterior12Id, 3);
        await createCategory('1205 - Badges and Films', 'Badges and decorative films', exterior12Id, 3);
        await createCategory('1207 - License Plate Mountings', 'License plate mounting hardware', exterior12Id, 3);
        await createCategory('1209 - Exterior Mirrors', 'Exterior mirror assemblies', exterior12Id, 3);
        await createCategory('1220 - Exterior Trim', 'Exterior trim components', exterior12Id, 3);
        await createCategory('1225 - Underhood Trim', 'Underhood trim and covers', exterior12Id, 3);
        await createCategory('1230 - Trailer Hitch', 'Trailer hitch components', exterior12Id, 3);
      }

      // 13 - SEATS
      const seats13Id = await createCategory('13 - SEATS', 'Seat systems and components', model3Id, 2);
      if (seats13Id) {
        await createCategory('1301 - Front Seat Tracks and Motors', 'Front seat tracks and motors', seats13Id, 3);
        await createCategory('1302 - 2nd Row Seat Tracks and Motors', '2nd row seat tracks and motors', seats13Id, 3);
        await createCategory('1304 - Front Seat Assemblies and Hardware', 'Front seat assemblies and hardware', seats13Id, 3);
        await createCategory('1305 - 2nd Row Seat Assemblies and Hardware', '2nd row seat assemblies and hardware', seats13Id, 3);
        await createCategory('1307 - Front Seat Covers, Pads and Trims', 'Front seat covers, pads and trims', seats13Id, 3);
        await createCategory('1308 - 2nd Row Seat Covers, Pads and Trims', '2nd row seat covers, pads and trims', seats13Id, 3);
      }

      // 14 - INSTRUMENT PANEL
      const instrument14Id = await createCategory('14 - INSTRUMENT PANEL', 'Instrument panel components', model3Id, 2);
      if (instrument14Id) {
        await createCategory('1405 - Instrument Panel', 'Instrument panel assembly', instrument14Id, 3);
      }

      // 15 - INTERIOR TRIM
      const interior15Id = await createCategory('15 - INTERIOR TRIM', 'Interior trim components', model3Id, 2);
      if (interior15Id) {
        await createCategory('1505 - Interior Mirror and Sun Visors', 'Interior mirror and sun visors', interior15Id, 3);
        await createCategory('1511 - Trunk Trim', 'Trunk trim components', interior15Id, 3);
        await createCategory('1513 - Door Trim', 'Door trim panels', interior15Id, 3);
        await createCategory('1518 - Pillar and Sill Trim', 'Pillar and sill trim', interior15Id, 3);
        await createCategory('1519 - Center Console', 'Center console components', interior15Id, 3);
        await createCategory('1520 - Headliner', 'Headliner components', interior15Id, 3);
        await createCategory('1524 - Luggage Compartment Trim', 'Luggage compartment trim', interior15Id, 3);
        await createCategory('1530 - Carpeting and Mats', 'Carpeting and floor mats', interior15Id, 3);
      }

      // 16 - HV BATTERY SYSTEM
      const battery16Id = await createCategory('16 - HV BATTERY SYSTEM', 'High voltage battery system', model3Id, 2);
      if (battery16Id) {
        await createCategory('1601 - HV Battery Assembly', 'HV battery assembly', battery16Id, 3);
        await createCategory('1630 - HV Battery Electrical Components', 'HV battery electrical components', battery16Id, 3);
      }

      // 17 - ELECTRICAL
      const electrical17Id = await createCategory('17 - ELECTRICAL', 'Electrical systems and components', model3Id, 2);
      if (electrical17Id) {
        await createCategory('1701 - 12V Battery and Fuses', '12V battery and fuses', electrical17Id, 3);
        await createCategory('1702 - LV Battery', 'LV battery components', electrical17Id, 3);
        await createCategory('1710 - Harnesses', 'Wiring harnesses', electrical17Id, 3);
        await createCategory('1715 - Electronic Control Modules', 'Electronic control modules', electrical17Id, 3);
        await createCategory('1720 - Radar Sensors', 'Radar sensors', electrical17Id, 3);
        await createCategory('1723 - Front Camera', 'Front camera systems', electrical17Id, 3);
        await createCategory('1724 - Interior Camera', 'Interior camera systems', electrical17Id, 3);
        await createCategory('1727 - Parking Sensors', 'Parking sensors', electrical17Id, 3);
        await createCategory('1740 - Exterior Lights', 'Exterior lighting systems', electrical17Id, 3);
        await createCategory('1745 - Keyless Entry and Security', 'Keyless entry and security', electrical17Id, 3);
        await createCategory('1750 - Wipers and Washers', 'Wipers and washers', electrical17Id, 3);
        await createCategory('1753 - Horn', 'Horn components', electrical17Id, 3);
        await createCategory('1755 - Accelerator Pedal', 'Accelerator pedal', electrical17Id, 3);
        await createCategory('1756 - Temperature and Humidity Sensors', 'Temperature and humidity sensors', electrical17Id, 3);
      }

      // 18 - THERMAL MANAGEMENT
      const thermal18Id = await createCategory('18 - THERMAL MANAGEMENT', 'Thermal management system', model3Id, 2);
      if (thermal18Id) {
        await createCategory('1810 - Cabin HVAC', 'Cabin HVAC system', thermal18Id, 3);
        await createCategory('1820 - Refrigerant System', 'Refrigerant system', thermal18Id, 3);
        await createCategory('1830 - Cooling System', 'Cooling system', thermal18Id, 3);
        await createCategory('1840 - Thermal System', 'Thermal system', thermal18Id, 3);
        await createCategory('1850 - Air Distribution', 'Air distribution system', thermal18Id, 3);
      }

      // 19 - LABELS
      const labels19Id = await createCategory('19 - LABELS', 'Labels and markings', model3Id, 2);
      if (labels19Id) {
        await createCategory('1901 - Labels', 'Various labels and markings', labels19Id, 3);
      }

      // 20 - SAFETY AND RESTRAINT
      const safety20Id = await createCategory('20 - SAFETY AND RESTRAINT', 'Safety and restraint systems', model3Id, 2);
      if (safety20Id) {
        await createCategory('2001 - Air Bags', 'Air bag systems', safety20Id, 3);
        await createCategory('2005 - Seat Belts', 'Seat belt assemblies', safety20Id, 3);
        await createCategory('2010 - Pre-Tensioners', 'Pre-tensioner systems', safety20Id, 3);
        await createCategory('2020 - Sensors', 'Safety sensors', safety20Id, 3);
      }

      // 21 - INFOTAINMENT
      const infotainment21Id = await createCategory('21 - INFOTAINMENT', 'Infotainment systems', model3Id, 2);
      if (infotainment21Id) {
        await createCategory('2107 - Touchscreen', 'Touchscreen display', infotainment21Id, 3);
        await createCategory('2110 - Car Computer', 'Car computer system', infotainment21Id, 3);
        await createCategory('2121 - Audio System - Speakers, Subwoofer and Amplifier', 'Audio speakers and amplifier', infotainment21Id, 3);
        await createCategory('2122 - Audio System - AM, FM and HD Radio', 'Radio systems', infotainment21Id, 3);
        await createCategory('2130 - Antenna - AM, FM and HD Radio', 'Radio antennas', infotainment21Id, 3);
        await createCategory('2132 - Antenna - GPS', 'GPS antenna', infotainment21Id, 3);
        await createCategory('2133 - Antenna - Wi-Fi', 'Wi-Fi antenna', infotainment21Id, 3);
      }

      // 30 - CHASSIS
      const chassis30Id = await createCategory('30 - CHASSIS', 'Chassis components', model3Id, 2);
      if (chassis30Id) {
        await createCategory('3001 - Chassis and Subframes', 'Chassis and subframes', chassis30Id, 3);
      }

      // 31 - SUSPENSION
      const suspension31Id = await createCategory('31 - SUSPENSION', 'Suspension system', model3Id, 2);
      if (suspension31Id) {
        await createCategory('3101 - Front Suspension (including Hubs)', 'Front suspension and hubs', suspension31Id, 3);
        await createCategory('3103 - Rear Suspension (including Hubs)', 'Rear suspension and hubs', suspension31Id, 3);
        await createCategory('3115 - Coil Spring Suspension System', 'Coil spring suspension', suspension31Id, 3);
      }

      // 32 - STEERING
      const steering32Id = await createCategory('32 - STEERING', 'Steering system', model3Id, 2);
      if (steering32Id) {
        await createCategory('3201 - Steering Rack and Lower Column', 'Steering rack and lower column', steering32Id, 3);
        await createCategory('3205 - Upper Column and Steering Wheel', 'Upper column and steering wheel', steering32Id, 3);
      }

      // 33 - BRAKES
      const brakes33Id = await createCategory('33 - BRAKES', 'Brake system', model3Id, 2);
      if (brakes33Id) {
        await createCategory('3301 - Brake Discs and Calipers', 'Brake discs and calipers', brakes33Id, 3);
        await createCategory('3303 - Brake Pipes and Hoses', 'Brake pipes and hoses', brakes33Id, 3);
        await createCategory('3310 - ABS, Traction and Stability Control', 'ABS and stability control', brakes33Id, 3);
        await createCategory('3320 - Electromechanical Brake Booster', 'Electromechanical brake booster', brakes33Id, 3);
        await createCategory('3325 - Brake Pedal', 'Brake pedal assembly', brakes33Id, 3);
      }

      // 34 - WHEELS AND TIRES
      const wheels34Id = await createCategory('34 - WHEELS AND TIRES', 'Wheels and tires', model3Id, 2);
      if (wheels34Id) {
        await createCategory('3401 - Wheels', 'Wheel assemblies', wheels34Id, 3);
        await createCategory('3402 - Tires', 'Tire assemblies', wheels34Id, 3);
        await createCategory('3404 - Tire Pressure Monitoring System (TPMS)', 'TPMS sensors', wheels34Id, 3);
      }

      // 39 - FRONT DRIVE UNIT
      const frontDrive39Id = await createCategory('39 - FRONT DRIVE UNIT', 'Front drive unit', model3Id, 2);
      if (frontDrive39Id) {
        await createCategory('3901 - Front Drive Unit Assembly', 'Front drive unit assembly', frontDrive39Id, 3);
        await createCategory('3920 - Front Drive Inverter', 'Front drive inverter', frontDrive39Id, 3);
        await createCategory('3930 - Front Gearbox and Halfshafts', 'Front gearbox and halfshafts', frontDrive39Id, 3);
      }

      // 40 - REAR DRIVE UNIT
      const rearDrive40Id = await createCategory('40 - REAR DRIVE UNIT', 'Rear drive unit', model3Id, 2);
      if (rearDrive40Id) {
        await createCategory('4001 - Rear Drive Unit Assembly', 'Rear drive unit assembly', rearDrive40Id, 3);
        await createCategory('4020 - Rear Drive Inverter', 'Rear drive inverter', rearDrive40Id, 3);
        await createCategory('4030 - Rear Gearbox and Halfshafts', 'Rear gearbox and halfshafts', rearDrive40Id, 3);
      }

      // 44 - HIGH VOLTAGE SYSTEM
      const hvSystem44Id = await createCategory('44 - HIGH VOLTAGE SYSTEM', 'High voltage system', model3Id, 2);
      if (hvSystem44Id) {
        await createCategory('4401 - Charge System Inlet', 'Charge system inlet', hvSystem44Id, 3);
        await createCategory('4450 - HV Harnesses', 'HV harnesses', hvSystem44Id, 3);
      }

      // 50 - EXTERNAL CHARGING CONNECTORS
      const charging50Id = await createCategory('50 - EXTERNAL CHARGING CONNECTORS', 'External charging connectors', model3Id, 2);
      if (charging50Id) {
        await createCategory('5001 - Mobile Connector', 'Mobile connector', charging50Id, 3);
        await createCategory('5002 - Wall Connector', 'Wall connector', charging50Id, 3);
      }

      // 60 - OWNER INFORMATION
      const owner60Id = await createCategory('60 - OWNER INFORMATION', 'Owner information', model3Id, 2);
      if (owner60Id) {
        await createCategory('6001 - Owner Information', 'Owner information materials', owner60Id, 3);
      }
    }

    // ============================================
    // TESLA MODEL Y - COMPLETE EXACT STRUCTURE
    // ============================================
    const modelYId = await createCategory('TESLA MODEL Y', 'Tesla Model Y Parts and Components', null, 1);

    if (modelYId) {
      // 10 - BODY
      const myBody10Id = await createCategory('Model Y - 10 - BODY', 'Body components and panels', modelYId, 2);
      if (myBody10Id) {
        await createCategory('Model Y - 1001 - Bumper and Fascia', 'Bumper and fascia components', myBody10Id, 3);
        await createCategory('Model Y - 1010 - Body Panels', 'Body panels and structural components', myBody10Id, 3);
        await createCategory('Model Y - 1020 - Windshield and Body Glass', 'Glass components', myBody10Id, 3);
      }

      // 11 - CLOSURE COMPONENTS
      const myClosure11Id = await createCategory('Model Y - 11 - CLOSURE COMPONENTS', 'Closure systems and components', modelYId, 2);
      if (myClosure11Id) {
        await createCategory('Model Y - 1120 - Liftgate', 'Liftgate components and hardware', myClosure11Id, 3);
        await createCategory('Model Y - 1133 - Closure Assist Mechanisms and Hinges', 'Door hinges and assist mechanisms', myClosure11Id, 3);
        await createCategory('Model Y - 1145 - Exterior Door Handles', 'Door handle assemblies', myClosure11Id, 3);
        await createCategory('Model Y - 1150 - Door Glass Regulators', 'Window regulators and motors', myClosure11Id, 3);
        await createCategory('Model Y - 1170 - Seals Body Closures', 'Weather stripping and seals', myClosure11Id, 3);
      }

      // 12 - EXTERIOR FITTINGS
      const myExterior12Id = await createCategory('Model Y - 12 - EXTERIOR FITTINGS', 'Exterior fittings and components', modelYId, 2);
      if (myExterior12Id) {
        await createCategory('Model Y - 1201 - Wheel Arch Liners', 'Wheel arch liners', myExterior12Id, 3);
        await createCategory('Model Y - 1203 - Undertray and Diffuser', 'Undertray and diffuser components', myExterior12Id, 3);
        await createCategory('Model Y - 1205 - Badges and Films', 'Badges and decorative films', myExterior12Id, 3);
        await createCategory('Model Y - 1207 - License Plate Mountings', 'License plate mounting hardware', myExterior12Id, 3);
        await createCategory('Model Y - 1209 - Exterior Mirrors', 'Exterior mirror assemblies', myExterior12Id, 3);
        await createCategory('Model Y - 1220 - Exterior Trim', 'Exterior trim components', myExterior12Id, 3);
        await createCategory('Model Y - 1224 - Luggage Compartment Trim', 'Luggage compartment trim', myExterior12Id, 3);
        await createCategory('Model Y - 1225 - Underhood Trim', 'Underhood trim and covers', myExterior12Id, 3);
        await createCategory('Model Y - 1230 - Trailer Hitch', 'Trailer hitch components', myExterior12Id, 3);
      }

      // 13 - SEATS (Model Y has 3rd row)
      const mySeats13Id = await createCategory('Model Y - 13 - SEATS', 'Seat systems and components', modelYId, 2);
      if (mySeats13Id) {
        await createCategory('Model Y - 1301 - Front Seat Tracks and Motors', 'Front seat tracks and motors', mySeats13Id, 3);
        await createCategory('Model Y - 1302 - 2nd Row Seat Tracks and Motors', '2nd row seat tracks and motors', mySeats13Id, 3);
        await createCategory('Model Y - 1303 - 3rd Row Seat Tracks and Motors', '3rd row seat tracks and motors', mySeats13Id, 3);
        await createCategory('Model Y - 1304 - Front Seat Assemblies and Hardware', 'Front seat assemblies and hardware', mySeats13Id, 3);
        await createCategory('Model Y - 1305 - 2nd Row Seat Assemblies and Hardware', '2nd row seat assemblies and hardware', mySeats13Id, 3);
        await createCategory('Model Y - 1306 - 3rd Row Seat Assemblies and Hardware', '3rd row seat assemblies and hardware', mySeats13Id, 3);
        await createCategory('Model Y - 1307 - Front Seat Covers, Pads and Trims', 'Front seat covers, pads and trims', mySeats13Id, 3);
        await createCategory('Model Y - 1308 - 2nd Row Seat Covers, Pads and Trims', '2nd row seat covers, pads and trims', mySeats13Id, 3);
        await createCategory('Model Y - 1309 - 3rd Row Seat Covers, Pads and Trims', '3rd row seat covers, pads and trims', mySeats13Id, 3);
      }

      // 14 - INSTRUMENT PANEL
      const myInstrument14Id = await createCategory('Model Y - 14 - INSTRUMENT PANEL', 'Instrument panel components', modelYId, 2);
      if (myInstrument14Id) {
        await createCategory('Model Y - 1405 - Instrument Panel', 'Instrument panel assembly', myInstrument14Id, 3);
      }

      // 15 - INTERIOR TRIM
      const myInterior15Id = await createCategory('Model Y - 15 - INTERIOR TRIM', 'Interior trim components', modelYId, 2);
      if (myInterior15Id) {
        await createCategory('Model Y - 1505 - Interior Mirror and Sun Visors', 'Interior mirror and sun visors', myInterior15Id, 3);
        await createCategory('Model Y - 1511 - Trunk Trim', 'Trunk trim components', myInterior15Id, 3);
        await createCategory('Model Y - 1513 - Door Trim', 'Door trim panels', myInterior15Id, 3);
        await createCategory('Model Y - 1518 - Pillar and Sill Trim', 'Pillar and sill trim', myInterior15Id, 3);
        await createCategory('Model Y - 1519 - Center Console', 'Center console components', myInterior15Id, 3);
        await createCategory('Model Y - 1520 - Headliner', 'Headliner components', myInterior15Id, 3);
        await createCategory('Model Y - 1530 - Carpeting and Mats', 'Carpeting and floor mats', myInterior15Id, 3);
      }

      // 16 - HV BATTERY SYSTEM
      const myBattery16Id = await createCategory('Model Y - 16 - HV BATTERY SYSTEM', 'High voltage battery system', modelYId, 2);
      if (myBattery16Id) {
        await createCategory('Model Y - 1601 - HV Battery Assembly', 'HV battery assembly', myBattery16Id, 3);
        await createCategory('Model Y - 1630 - HV Battery Electrical Components', 'HV battery electrical components', myBattery16Id, 3);
      }

      // 17 - ELECTRICAL
      const myElectrical17Id = await createCategory('Model Y - 17 - ELECTRICAL', 'Electrical systems and components', modelYId, 2);
      if (myElectrical17Id) {
        await createCategory('Model Y - 1701 - 12V Battery and Fuses', '12V battery and fuses', myElectrical17Id, 3);
        await createCategory('Model Y - 1702 - LV Battery', 'LV battery components', myElectrical17Id, 3);
        await createCategory('Model Y - 1710 - Harnesses', 'Wiring harnesses', myElectrical17Id, 3);
        await createCategory('Model Y - 1715 - Electronic Control Modules', 'Electronic control modules', myElectrical17Id, 3);
        await createCategory('Model Y - 1720 - Radar Sensors', 'Radar sensors', myElectrical17Id, 3);
        await createCategory('Model Y - 1723 - Front Camera', 'Front camera systems', myElectrical17Id, 3);
        await createCategory('Model Y - 1724 - Interior Camera', 'Interior camera systems', myElectrical17Id, 3);
        await createCategory('Model Y - 1727 - Parking Sensors', 'Parking sensors', myElectrical17Id, 3);
        await createCategory('Model Y - 1740 - Exterior Lights', 'Exterior lighting systems', myElectrical17Id, 3);
        await createCategory('Model Y - 1745 - Keyless Entry and Security', 'Keyless entry and security', myElectrical17Id, 3);
        await createCategory('Model Y - 1750 - Wipers and Washers', 'Wipers and washers', myElectrical17Id, 3);
        await createCategory('Model Y - 1753 - Horn', 'Horn components', myElectrical17Id, 3);
        await createCategory('Model Y - 1755 - Accelerator Pedal', 'Accelerator pedal', myElectrical17Id, 3);
        await createCategory('Model Y - 1756 - Temperature and Humidity Sensors', 'Temperature and humidity sensors', myElectrical17Id, 3);
      }

      // 18 - THERMAL MANAGEMENT
      const myThermal18Id = await createCategory('Model Y - 18 - THERMAL MANAGEMENT', 'Thermal management system', modelYId, 2);
      if (myThermal18Id) {
        await createCategory('Model Y - 1810 - Cabin HVAC', 'Cabin HVAC system', myThermal18Id, 3);
        await createCategory('Model Y - 1820 - Refrigerant System', 'Refrigerant system', myThermal18Id, 3);
        await createCategory('Model Y - 1830 - Cooling System', 'Cooling system', myThermal18Id, 3);
        await createCategory('Model Y - 1840 - Thermal System', 'Thermal system', myThermal18Id, 3);
      }

      // 19 - LABELS
      const myLabels19Id = await createCategory('Model Y - 19 - LABELS', 'Labels and markings', modelYId, 2);
      if (myLabels19Id) {
        await createCategory('Model Y - 1901 - Labels', 'Various labels and markings', myLabels19Id, 3);
      }

      // 20 - SAFETY AND RESTRAINT
      const mySafety20Id = await createCategory('Model Y - 20 - SAFETY AND RESTRAINT', 'Safety and restraint systems', modelYId, 2);
      if (mySafety20Id) {
        await createCategory('Model Y - 2001 - Air Bags', 'Air bag systems', mySafety20Id, 3);
        await createCategory('Model Y - 2005 - Seat Belts', 'Seat belt assemblies', mySafety20Id, 3);
        await createCategory('Model Y - 2010 - Pre-Tensioners', 'Pre-tensioner systems', mySafety20Id, 3);
        await createCategory('Model Y - 2020 - Sensors', 'Safety sensors', mySafety20Id, 3);
      }

      // 21 - INFOTAINMENT (Model Y has slightly different audio numbering)
      const myInfotainment21Id = await createCategory('Model Y - 21 - INFOTAINMENT', 'Infotainment systems', modelYId, 2);
      if (myInfotainment21Id) {
        await createCategory('Model Y - 2107 - Touchscreen', 'Touchscreen display', myInfotainment21Id, 3);
        await createCategory('Model Y - 2110 - Car Computer', 'Car computer system', myInfotainment21Id, 3);
        await createCategory('Model Y - 2121 - Audio System - Speakers, Subwoofer and Amplifier', 'Audio speakers and amplifier', myInfotainment21Id, 3);
        await createCategory('Model Y - 2123 - Audio System - AM, FM and HD Radio', 'Radio systems', myInfotainment21Id, 3);
        await createCategory('Model Y - 2130 - Antenna - AM, FM and HD Radio', 'Radio antennas', myInfotainment21Id, 3);
        await createCategory('Model Y - 2132 - Antenna - GPS', 'GPS antenna', myInfotainment21Id, 3);
        await createCategory('Model Y - 2133 - Antenna - Wi-Fi', 'Wi-Fi antenna', myInfotainment21Id, 3);
      }

      // 30 - CHASSIS
      const myChassis30Id = await createCategory('Model Y - 30 - CHASSIS', 'Chassis components', modelYId, 2);
      if (myChassis30Id) {
        await createCategory('Model Y - 3001 - Chassis and Subframes', 'Chassis and subframes', myChassis30Id, 3);
      }

      // 31 - SUSPENSION
      const mySuspension31Id = await createCategory('Model Y - 31 - SUSPENSION', 'Suspension system', modelYId, 2);
      if (mySuspension31Id) {
        await createCategory('Model Y - 3101 - Front Suspension (including Hubs)', 'Front suspension and hubs', mySuspension31Id, 3);
        await createCategory('Model Y - 3103 - Rear Suspension (including Hubs)', 'Rear suspension and hubs', mySuspension31Id, 3);
        await createCategory('Model Y - 3115 - Coil Spring Suspension System', 'Coil spring suspension', mySuspension31Id, 3);
      }

      // 32 - STEERING
      const mySteering32Id = await createCategory('Model Y - 32 - STEERING', 'Steering system', modelYId, 2);
      if (mySteering32Id) {
        await createCategory('Model Y - 3201 - Steering Rack and Lower Column', 'Steering rack and lower column', mySteering32Id, 3);
        await createCategory('Model Y - 3205 - Upper Column and Steering Wheel', 'Upper column and steering wheel', mySteering32Id, 3);
      }

      // 33 - BRAKES
      const myBrakes33Id = await createCategory('Model Y - 33 - BRAKES', 'Brake system', modelYId, 2);
      if (myBrakes33Id) {
        await createCategory('Model Y - 3301 - Brake Discs and Calipers', 'Brake discs and calipers', myBrakes33Id, 3);
        await createCategory('Model Y - 3303 - Brake Pipes and Hoses', 'Brake pipes and hoses', myBrakes33Id, 3);
        await createCategory('Model Y - 3310 - ABS, Traction and Stability Control', 'ABS and stability control', myBrakes33Id, 3);
        await createCategory('Model Y - 3320 - Electromechanical Brake Booster', 'Electromechanical brake booster', myBrakes33Id, 3);
        await createCategory('Model Y - 3325 - Brake Pedal', 'Brake pedal assembly', myBrakes33Id, 3);
      }

      // 34 - WHEELS AND TIRES
      const myWheels34Id = await createCategory('Model Y - 34 - WHEELS AND TIRES', 'Wheels and tires', modelYId, 2);
      if (myWheels34Id) {
        await createCategory('Model Y - 3401 - Wheels', 'Wheel assemblies', myWheels34Id, 3);
        await createCategory('Model Y - 3402 - Tires', 'Tire assemblies', myWheels34Id, 3);
        await createCategory('Model Y - 3404 - Tire Pressure Monitoring System (TPMS)', 'TPMS sensors', myWheels34Id, 3);
      }

      // 39 - FRONT DRIVE UNIT
      const myFrontDrive39Id = await createCategory('Model Y - 39 - FRONT DRIVE UNIT', 'Front drive unit', modelYId, 2);
      if (myFrontDrive39Id) {
        await createCategory('Model Y - 3901 - Front Drive Unit Assembly', 'Front drive unit assembly', myFrontDrive39Id, 3);
        await createCategory('Model Y - 3920 - Front Drive Inverter', 'Front drive inverter', myFrontDrive39Id, 3);
        await createCategory('Model Y - 3930 - Front Gearbox and Halfshafts', 'Front gearbox and halfshafts', myFrontDrive39Id, 3);
      }

      // 40 - REAR DRIVE UNIT
      const myRearDrive40Id = await createCategory('Model Y - 40 - REAR DRIVE UNIT', 'Rear drive unit', modelYId, 2);
      if (myRearDrive40Id) {
        await createCategory('Model Y - 4001 - Rear Drive Unit Assembly', 'Rear drive unit assembly', myRearDrive40Id, 3);
        await createCategory('Model Y - 4020 - Rear Drive Inverter', 'Rear drive inverter', myRearDrive40Id, 3);
        await createCategory('Model Y - 4030 - Rear Gearbox and Halfshafts', 'Rear gearbox and halfshafts', myRearDrive40Id, 3);
      }

      // 44 - HIGH VOLTAGE SYSTEM
      const myHvSystem44Id = await createCategory('Model Y - 44 - HIGH VOLTAGE SYSTEM', 'High voltage system', modelYId, 2);
      if (myHvSystem44Id) {
        await createCategory('Model Y - 4401 - Charge System Inlet', 'Charge system inlet', myHvSystem44Id, 3);
        await createCategory('Model Y - 4450 - HV Harnesses', 'HV harnesses', myHvSystem44Id, 3);
      }

      // 50 - EXTERNAL CHARGING CONNECTORS
      const myCharging50Id = await createCategory('Model Y - 50 - EXTERNAL CHARGING CONNECTORS', 'External charging connectors', modelYId, 2);
      if (myCharging50Id) {
        await createCategory('Model Y - 5001 - Mobile Connector', 'Mobile connector', myCharging50Id, 3);
        await createCategory('Model Y - 5002 - Wall Connector', 'Wall connector', myCharging50Id, 3);
      }

// 60 - OWNER INFORMATION
      const myOwner60Id = await createCategory('Model Y - 60 - OWNER INFORMATION', 'Owner information', modelYId, 2);
      if (myOwner60Id) {
        await createCategory('Model Y - 6001 - Owner Information', 'Owner information materials', myOwner60Id, 3);
      }
    }

    const response = {
      success: true,
      totalCreated,
      totalSkipped,
      errors,
      message: `🎉 COMPLETE Tesla category structure created!
      
📊 Summary:
✅ Created: ${totalCreated} categories
⏭️  Skipped: ${totalSkipped} existing categories

🏗️  Complete Structure Created:

📁 TESLA MODEL 3
├── Model 3 - 10 - BODY (3 subcategories)
├── Model 3 - 11 - CLOSURE COMPONENTS (5 subcategories)
├── Model 3 - 12 - EXTERIOR FITTINGS (8 subcategories)
├── Model 3 - 13 - SEATS (6 subcategories)
├── Model 3 - 14 - INSTRUMENT PANEL (1 subcategory)
├── Model 3 - 15 - INTERIOR TRIM (8 subcategories)
├── Model 3 - 16 - HV BATTERY SYSTEM (2 subcategories)
├── Model 3 - 17 - ELECTRICAL (14 subcategories)
├── Model 3 - 18 - THERMAL MANAGEMENT (5 subcategories)
├── Model 3 - 19 - LABELS (1 subcategory)
├── Model 3 - 20 - SAFETY AND RESTRAINT (4 subcategories)
├── Model 3 - 21 - INFOTAINMENT (7 subcategories)
├── Model 3 - 30 - CHASSIS (1 subcategory)
├── Model 3 - 31 - SUSPENSION (3 subcategories)
├── Model 3 - 32 - STEERING (2 subcategories)
├── Model 3 - 33 - BRAKES (5 subcategories)
├── Model 3 - 34 - WHEELS AND TIRES (3 subcategories)
├── Model 3 - 39 - FRONT DRIVE UNIT (3 subcategories)
├── Model 3 - 40 - REAR DRIVE UNIT (3 subcategories)
├── Model 3 - 44 - HIGH VOLTAGE SYSTEM (2 subcategories)
├── Model 3 - 50 - EXTERNAL CHARGING CONNECTORS (2 subcategories)
└── Model 3 - 60 - OWNER INFORMATION (1 subcategory)

📁 TESLA MODEL Y
├── Model Y - 10 - BODY (3 subcategories)
├── Model Y - 11 - CLOSURE COMPONENTS (5 subcategories)
├── Model Y - 12 - EXTERIOR FITTINGS (9 subcategories)
├── Model Y - 13 - SEATS (9 subcategories - includes 3rd row!)
├── Model Y - 14 - INSTRUMENT PANEL (1 subcategory)
├── Model Y - 15 - INTERIOR TRIM (7 subcategories)
├── Model Y - 16 - HV BATTERY SYSTEM (2 subcategories)
├── Model Y - 17 - ELECTRICAL (14 subcategories)
├── Model Y - 18 - THERMAL MANAGEMENT (4 subcategories)
├── Model Y - 19 - LABELS (1 subcategory)
├── Model Y - 20 - SAFETY AND RESTRAINT (4 subcategories)
├── Model Y - 21 - INFOTAINMENT (7 subcategories)
├── Model Y - 30 - CHASSIS (1 subcategory)
├── Model Y - 31 - SUSPENSION (3 subcategories)
├── Model Y - 32 - STEERING (2 subcategories)
├── Model Y - 33 - BRAKES (5 subcategories)
├── Model Y - 34 - WHEELS AND TIRES (3 subcategories)
├── Model Y - 39 - FRONT DRIVE UNIT (3 subcategories)
├── Model Y - 40 - REAR DRIVE UNIT (3 subcategories)
├── Model Y - 44 - HIGH VOLTAGE SYSTEM (2 subcategories)
├── Model Y - 50 - EXTERNAL CHARGING CONNECTORS (2 subcategories)
└── Model Y - 60 - OWNER INFORMATION (1 subcategory)

🎯 Key Differences for Model Y:
- 3rd row seats (1303, 1306, 1309)
- Liftgate instead of Trunk (1120)
- Additional luggage compartment trim (1224)
- Audio system numbering (2123 vs 2122)

Ready for bulk import of both Tesla models!`
    };

    console.log('🎯 Complete Tesla setup result:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}