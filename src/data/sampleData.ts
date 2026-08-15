import { InventoryItem, Order } from '../types/inventory';

export const INITIAL_SAMPLE_ITEMS: Omit<InventoryItem, 'id'>[] = [
  {
    legacy_ids: 'LEG-1002, SKU-COP-75',
    common_name: '3/4" Type L Copper Pipe (20ft)',
    description: 'Rigid copper tubing suitable for plumbing, HVAC, and industrial gas applications.',
    storage_location: 'Rack A-12',
    stock_quantity: 145,
    category: 'Plumbing & Piping',
    unit: 'lengths',
    min_stock: 30,
  },
  {
    legacy_ids: 'LEG-1089, SKU-VAL-100',
    common_name: '1" Brass Ball Valve (NPT Full Port)',
    description: 'Heavy-duty 600 WOG brass ball valve with threaded ends and vinyl coated handle.',
    storage_location: 'Bin B-04',
    stock_quantity: 68,
    category: 'Valves & Fittings',
    unit: 'pcs',
    min_stock: 15,
  },
  {
    legacy_ids: 'LEG-2304, SKU-ELE-122',
    common_name: '12/2 THHN Solid Copper Wire (500ft Spool)',
    description: 'Building wire rated for 600V, heat and moisture resistant PVC insulation.',
    storage_location: 'Bay E-01',
    stock_quantity: 24,
    category: 'Electrical Supplies',
    unit: 'spools',
    min_stock: 5,
  },
  {
    legacy_ids: 'LEG-4401, SKU-FAST-382',
    common_name: '3/8" x 2-1/2" Stainless Steel Anchor Bolts (Box 50)',
    description: 'Grade 304 stainless steel wedge expansion anchors for heavy masonry fixing.',
    storage_location: 'Shelf C-08',
    stock_quantity: 92,
    category: 'Fasteners & Hardware',
    unit: 'boxes',
    min_stock: 20,
  },
  {
    legacy_ids: 'LEG-5110, SKU-SAF-880',
    common_name: 'ANSI Class 2 High-Vis Reflective Safety Vests (XL)',
    description: 'Breathable neon yellow mesh vest with 2-inch silver reflective tape.',
    storage_location: 'Locker F-02',
    stock_quantity: 18,
    category: 'Safety & PPE',
    unit: 'pcs',
    min_stock: 25,
  },
  {
    legacy_ids: 'LEG-6019, SKU-HVAC-30',
    common_name: '24" x 24" x 2" MERV 11 HVAC Air Filters (Pack 12)',
    description: 'Pleated synthetic media air filter for commercial HVAC ventilation systems.',
    storage_location: 'Mezzanine M-03',
    stock_quantity: 40,
    category: 'HVAC Parts',
    unit: 'packs',
    min_stock: 10,
  },
  {
    legacy_ids: 'LEG-7822, SKU-TOOL-M18',
    common_name: 'M18 Fuel 1/2" Cordless Hammer Drill Kit',
    description: 'Includes brushless hammer drill, two 5.0Ah lithium-ion batteries, charger, and hard case.',
    storage_location: 'Tool Cage T-01',
    stock_quantity: 7,
    category: 'Tools & Equipment',
    unit: 'kits',
    min_stock: 3,
  },
  {
    legacy_ids: 'LEG-8930, SKU-SEAL-400',
    common_name: 'Clear Industrial Silicone Sealant (10.1 oz Cartridge)',
    description: '100% RTV waterproof silicone sealant for HVAC ductwork and exterior sealing.',
    storage_location: 'Bin D-12',
    stock_quantity: 110,
    category: 'Adhesives & Chemicals',
    unit: 'tubes',
    min_stock: 30,
  },
  {
    legacy_ids: 'LEG-9201, SKU-FLG-300',
    common_name: '3" Class 150 Carbon Steel Slip-On Flange',
    description: 'Forged carbon steel flange conforming to ASTM A105 / ASME B16.5.',
    storage_location: 'Rack A-05',
    stock_quantity: 32,
    category: 'Valves & Fittings',
    unit: 'pcs',
    min_stock: 8,
  },
  {
    legacy_ids: 'LEG-3312, SKU-CON-200',
    common_name: '2" Schedule 40 PVC Conduit (10ft)',
    description: 'Rigid non-metallic conduit designed for underground electrical feeders and wiring.',
    storage_location: 'Yard Y-02',
    stock_quantity: 210,
    category: 'Electrical Supplies',
    unit: 'lengths',
    min_stock: 50,
  }
];

export const INITIAL_SAMPLE_ORDERS: Omit<Order, 'id'>[] = [
  {
    jobNumber: 'JOB-2026-881',
    status: 'pending',
    priority: 'high',
    notes: 'Urgent stage 1 mechanical room rough-in. Deliver to North Tower.',
    createdByName: 'John Miller (Site Manager)',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    items: [
      {
        itemId: 'sample-1',
        legacy_ids: 'LEG-1002, SKU-COP-75',
        common_name: '3/4" Type L Copper Pipe (20ft)',
        storage_location: 'Rack A-12',
        quantityRequested: 10,
        unit: 'lengths'
      },
      {
        itemId: 'sample-2',
        legacy_ids: 'LEG-1089, SKU-VAL-100',
        common_name: '1" Brass Ball Valve (NPT Full Port)',
        storage_location: 'Bin B-04',
        quantityRequested: 4,
        unit: 'pcs'
      }
    ]
  },
  {
    jobNumber: 'JOB-2026-879',
    status: 'in-progress',
    priority: 'normal',
    notes: 'Electrical main distribution upgrade. Pulling wires today.',
    createdByName: 'Sarah Jenkins (Master Electrician)',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    items: [
      {
        itemId: 'sample-3',
        legacy_ids: 'LEG-2304, SKU-ELE-122',
        common_name: '12/2 THHN Solid Copper Wire (500ft Spool)',
        storage_location: 'Bay E-01',
        quantityRequested: 2,
        unit: 'spools'
      },
      {
        itemId: 'sample-10',
        legacy_ids: 'LEG-3312, SKU-CON-200',
        common_name: '2" Schedule 40 PVC Conduit (10ft)',
        storage_location: 'Yard Y-02',
        quantityRequested: 15,
        unit: 'lengths'
      }
    ]
  },
  {
    jobNumber: 'JOB-2026-870',
    status: 'completed',
    priority: 'urgent',
    notes: 'Emergency HVAC filter replacement completed.',
    createdByName: 'Robert Davis (Facilities Lead)',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      {
        itemId: 'sample-6',
        legacy_ids: 'LEG-6019, SKU-HVAC-30',
        common_name: '24" x 24" x 2" MERV 11 HVAC Air Filters (Pack 12)',
        storage_location: 'Mezzanine M-03',
        quantityRequested: 3,
        unit: 'packs'
      }
    ]
  }
];
