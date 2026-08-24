import type { Parcel } from '../types/parcel';

export const DEMO_PARCELS: Parcel[] = [
  {
    id: 'P-001',
    name: 'Residential Parcel P-001',
    area_m2: 1240.0,
    area_sqft: 13347.25,
    area_acres: 0.3064,
    area_hectares: 0.124,
    perimeter_m: 142.50,
    confidence: 96.4,
    features: ['Building', 'Fence'],
    latitude: 28.6105,
    longitude: 77.2002,
    status: 'Validated',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.1998, 28.6100],
          [77.2006, 28.6100],
          [77.2006, 28.6108],
          [77.1998, 28.6108],
          [77.1998, 28.6100]
        ]
      ]
    }
  },
  {
    id: 'P-002',
    name: 'Commercial Lot P-002',
    area_m2: 1580.0,
    area_sqft: 17007.0,
    area_acres: 0.3904,
    area_hectares: 0.158,
    perimeter_m: 165.20,
    confidence: 94.1,
    features: ['Building', 'Driveway'],
    latitude: 28.6115,
    longitude: 77.2012,
    status: 'AI Detected',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.2008, 28.6110],
          [77.2016, 28.6110],
          [77.2016, 28.6120],
          [77.2008, 28.6120],
          [77.2008, 28.6110]
        ]
      ]
    }
  },
  {
    id: 'P-003',
    name: 'Garden Property P-003',
    area_m2: 1100.0,
    area_sqft: 11840.3,
    area_acres: 0.2718,
    area_hectares: 0.110,
    perimeter_m: 134.0,
    confidence: 97.2,
    features: ['Building', 'Garden'],
    latitude: 28.6095,
    longitude: 77.2022,
    status: 'Validated',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.2018, 28.6090],
          [77.2026, 28.6090],
          [77.2026, 28.6098],
          [77.2018, 28.6098],
          [77.2018, 28.6090]
        ]
      ]
    }
  },
  {
    id: 'P-004',
    name: 'Garage Estate P-004',
    area_m2: 1420.0,
    area_sqft: 15284.7,
    area_acres: 0.3509,
    area_hectares: 0.142,
    perimeter_m: 155.0,
    confidence: 93.8,
    features: ['Building', 'Garage'],
    latitude: 28.6085,
    longitude: 77.1992,
    status: 'AI Detected',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.1988, 28.6080],
          [77.1996, 28.6080],
          [77.1996, 28.6090],
          [77.1988, 28.6090],
          [77.1988, 28.6080]
        ]
      ]
    }
  },
  {
    id: 'P-005',
    name: 'Villa with Pool P-005',
    area_m2: 1200.0,
    area_sqft: 12916.7,
    area_acres: 0.2965,
    area_hectares: 0.120,
    perimeter_m: 139.8,
    confidence: 95.5,
    features: ['Building', 'Pool'],
    latitude: 28.6125,
    longitude: 77.2032,
    status: 'Validated',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.2028, 28.6120],
          [77.2036, 28.6120],
          [77.2036, 28.6130],
          [77.2028, 28.6130],
          [77.2028, 28.6120]
        ]
      ]
    }
  },
  {
    id: 'P-006',
    name: 'Fenced Plot P-006',
    area_m2: 1360.0,
    area_sqft: 14638.9,
    area_acres: 0.3361,
    area_hectares: 0.136,
    perimeter_m: 150.0,
    confidence: 92.7,
    features: ['Building', 'Fence'],
    latitude: 28.6075,
    longitude: 77.2012,
    status: 'AI Detected',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.2008, 28.6070],
          [77.2016, 28.6070],
          [77.2016, 28.6079],
          [77.2008, 28.6079],
          [77.2008, 28.6070]
        ]
      ]
    }
  },
  {
    id: 'P-007',
    name: 'Shed Property P-007',
    area_m2: 1180.0,
    area_sqft: 12701.4,
    area_acres: 0.2916,
    area_hectares: 0.118,
    perimeter_m: 138.0,
    confidence: 94.9,
    features: ['Building', 'Shed'],
    latitude: 28.6135,
    longitude: 77.1982,
    status: 'Validated',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.1978, 28.6130],
          [77.1986, 28.6130],
          [77.1986, 28.6139],
          [77.1978, 28.6139],
          [77.1978, 28.6130]
        ]
      ]
    }
  },
  {
    id: 'P-008',
    name: 'Urban Plot P-008',
    area_m2: 980.0,
    area_sqft: 10548.6,
    area_acres: 0.2422,
    area_hectares: 0.098,
    perimeter_m: 126.0,
    confidence: 91.3,
    features: ['Building'],
    latitude: 28.6065,
    longitude: 77.2032,
    status: 'AI Detected',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.2028, 28.6060],
          [77.2036, 28.6060],
          [77.2036, 28.6069],
          [77.2028, 28.6069],
          [77.2028, 28.6060]
        ]
      ]
    }
  },
  {
    id: 'P-009',
    name: 'Courtyard Residence P-009',
    area_m2: 1050.0,
    area_sqft: 11302.1,
    area_acres: 0.2595,
    area_hectares: 0.105,
    perimeter_m: 130.0,
    confidence: 93.6,
    features: ['Building', 'Garden'],
    latitude: 28.6145,
    longitude: 77.2002,
    status: 'Validated',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.1998, 28.6140],
          [77.2006, 28.6140],
          [77.2006, 28.6148],
          [77.1998, 28.6148],
          [77.1998, 28.6140]
        ]
      ]
    }
  },
  {
    id: 'P-010',
    name: 'Road Segment P-010',
    area_m2: 320.0,
    area_sqft: 3444.5,
    area_acres: 0.0791,
    area_hectares: 0.032,
    perimeter_m: 210.0,
    confidence: 88.4,
    features: ['Road'],
    latitude: 28.6105,
    longitude: 77.2008,
    status: 'AI Detected',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.2006, 28.6100],
          [77.2009, 28.6100],
          [77.2009, 28.6120],
          [77.2006, 28.6120],
          [77.2006, 28.6100]
        ]
      ]
    }
  },
  {
    id: 'P-011',
    name: 'Road Segment P-011',
    area_m2: 280.0,
    area_sqft: 3013.9,
    area_acres: 0.0692,
    area_hectares: 0.028,
    perimeter_m: 185.0,
    confidence: 89.1,
    features: ['Road'],
    latitude: 28.6115,
    longitude: 77.1998,
    status: 'AI Detected',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.1996, 28.6110],
          [77.1999, 28.6110],
          [77.1999, 28.6128],
          [77.1996, 28.6128],
          [77.1996, 28.6110]
        ]
      ]
    }
  },
  {
    id: 'P-012',
    name: 'Road Segment P-012',
    area_m2: 240.0,
    area_sqft: 2583.3,
    area_acres: 0.0593,
    area_hectares: 0.024,
    perimeter_m: 160.0,
    confidence: 87.5,
    features: ['Road'],
    latitude: 28.6085,
    longitude: 77.2018,
    status: 'AI Detected',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.2016, 28.6080],
          [77.2019, 28.6080],
          [77.2019, 28.6096],
          [77.2016, 28.6096],
          [77.2016, 28.6080]
        ]
      ]
    }
  }
];
