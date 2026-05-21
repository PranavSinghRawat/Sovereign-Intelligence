"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCanvas } from "@/context/CanvasContext";

// Deterministic pseudo-random generator
const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const CONTINENTS_POLYGONS: Array<Array<[number, number]>> = [
  // North America
  [
    [-168, 65], [-150, 60], [-140, 60], [-120, 68], [-100, 68], [-80, 65], [-60, 60],
    [-55, 50], [-65, 45], [-75, 40], [-80, 30], [-80, 25], [-90, 30], [-95, 20],
    [-90, 15], [-80, 8], [-105, 20], [-115, 30], [-125, 40], [-125, 48], [-140, 58],
    [-160, 55], [-168, 65]
  ],
  // South America
  [
    [-75, 10], [-60, 5], [-45, -5], [-35, -5], [-40, -20], [-45, -25], [-60, -38],
    [-65, -45], [-70, -52], [-70, -55], [-75, -45], [-70, -30], [-75, -20], [-80, -5],
    [-80, 5], [-75, 10]
  ],
  // Africa
  [
    [10, 37], [20, 32], [30, 31], [32, 30], [40, 15], [51, 10], [48, 5], [40, -15],
    [35, -25], [30, -34], [18, -34], [12, -22], [10, -10], [5, -5], [10, 5], [-10, 5],
    [-15, 15], [-17, 15], [-15, 20], [-10, 30], [-5, 35], [0, 36], [5, 36], [10, 37]
  ],
  // Eurasia (Europe + Asia)
  [
    [-9, 36], [-9, 43], [-2, 43], [2, 43], [5, 50], [10, 54], [5, 60], [10, 68],
    [20, 71], [28, 70], [30, 65], [22, 60], [40, 68], [60, 70], [80, 75], [100, 77],
    [120, 73], [140, 73], [160, 70], [170, 68], [180, 65], [160, 55], [162, 50],
    [156, 50], [140, 50], [130, 40], [125, 35], [120, 30], [115, 22], [110, 20],
    [108, 15], [100, 5], [103, 1], [90, 22], [80, 16], [78, 8], [73, 12], [72, 20],
    [68, 24], [60, 25], [60, 15], [50, 12], [45, 12], [40, 20], [35, 30], [30, 36],
    [35, 36], [40, 40], [25, 40], [20, 40], [15, 40], [10, 40], [5, 40], [0, 38], [-9, 36]
  ],
  // Australia
  [
    [115, -22], [123, -15], [130, -12], [136, -12], [138, -16], [142, -10], [145, -15],
    [151, -23], [153, -28], [150, -34], [146, -39], [140, -37], [130, -32], [120, -34],
    [115, -34], [113, -26], [115, -22]
  ],
  // Antarctica
  [
    [0, -70], [30, -72], [60, -72], [90, -70], [120, -71], [150, -72], [180, -75],
    [-150, -75], [-120, -73], [-90, -70], [-80, -65], [-70, -65], [-60, -75], [-30, -72],
    [0, -70]
  ],
  // Greenland
  [
    [-40, 83], [-20, 80], [-20, 70], [-40, 60], [-50, 65], [-60, 75], [-60, 82], [-40, 83]
  ],
  // Japan
  [
    [140, 36], [142, 38], [145, 43], [140, 40], [135, 35], [130, 32], [135, 34], [140, 36]
  ],
  // Madagascar
  [
    [50, -12], [47, -25], [43, -25], [47, -15], [50, -12]
  ],
  // Great Britain
  [
    [-5, 50], [-5, 56], [-3, 58], [-1, 55], [1, 51], [-5, 50]
  ],
  // Iceland
  [
    [-22, 64], [-18, 66], [-14, 65], [-15, 63], [-22, 64]
  ],
  // New Zealand
  [
    [175, -35], [178, -40], [172, -43], [168, -46], [170, -42], [174, -38], [175, -35]
  ]
];

const isPointInPolygon = (point: [number, number], polygon: Array<[number, number]>) => {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const isEarthLand = (lat: number, lon: number) => {
  const latDeg = (lat * 180) / Math.PI;
  const lonDeg = (lon * 180) / Math.PI;

  return CONTINENTS_POLYGONS.some((poly) => isPointInPolygon([lonDeg, latDeg], poly));
};

// 3D Value Noise Generator for organic continent details
const createNoise3D = () => {
  const perm = new Uint8Array(512);
  const rand = mulberry32(101);
  for (let i = 0; i < 256; i++) {
    perm[i] = Math.floor(rand() * 256);
    perm[i + 256] = perm[i];
  }
  
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const fz = z - Math.floor(z);
    
    const u = fade(fx);
    const v = fade(fy);
    const w = fade(fz);
    
    const A = perm[X] + Y;
    const AA = perm[A] + Z;
    const AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y;
    const BA = perm[B] + Z;
    const BB = perm[B + 1] + Z;
    
    const hash = (h: number) => (h & 255) / 256;
    
    const n000 = hash(perm[AA]);
    const n100 = hash(perm[BA]);
    const n010 = hash(perm[AB]);
    const n110 = hash(perm[BB]);
    const n001 = hash(perm[AA + 1]);
    const n101 = hash(perm[BA + 1]);
    const n011 = hash(perm[AB + 1]);
    const n111 = hash(perm[BB + 1]);
    
    return lerp(w,
      lerp(v, lerp(u, n000, n100), lerp(u, n010, n110)),
      lerp(v, lerp(u, n001, n101), lerp(u, n011, n111))
    );
  };
};

const sampleNoise3D = createNoise3D();

const fbm3D = (x: number, y: number, z: number, octaves = 3) => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * sampleNoise3D(x * frequency, y * frequency, z * frequency);
    frequency *= 2.1;
    amplitude *= 0.5;
  }
  return value;
};

const isLandProcedural = (lat: number, lon: number, x: number, y: number, z: number) => {
  // Add noise displacement to create organic coastline fractures and islands
  const nx = fbm3D(x * 2.2, y * 2.2, z * 2.2, 3) * 0.35 - 0.175;
  const ny = fbm3D(x * 2.2 + 10.0, y * 2.2 + 10.0, z * 2.2 + 10.0, 3) * 0.35 - 0.175;
  return isEarthLand(lat + nx, lon + ny);
};

const getEarthCoordinates = (count: number): Array<{ x: number; y: number; z: number; isLand: boolean }> => {
  const coords: Array<{ x: number; y: number; z: number; isLand: boolean }> = [];
  const rand = mulberry32(57);
  
  const landTarget = Math.floor(count * 0.70); // 105
  const oceanTarget = count - landTarget;      // 45
  
  let landCount = 0;
  let oceanCount = 0;
  
  while (coords.length < count) {
    const lat = Math.asin(rand() * 2 - 1);
    const lon = rand() * Math.PI * 2 - Math.PI;
    
    const px = Math.cos(lat) * Math.sin(lon);
    const py = Math.sin(lat);
    const pz = Math.cos(lat) * Math.cos(lon);
    
    const isLand = isLandProcedural(lat, lon, px, py, pz);
    
    if (isLand && landCount < landTarget) {
      coords.push({ x: px, y: py, z: pz, isLand: true });
      landCount++;
    } else if (!isLand && oceanCount < oceanTarget) {
      coords.push({ x: px, y: py, z: pz, isLand: false });
      oceanCount++;
    }
  }
  return coords;
};

const EARTH_BASE_POINTS = getEarthCoordinates(150);

interface LineSegment3D {
  p1: { x: number; y: number; z: number };
  p2: { x: number; y: number; z: number };
}

const getContinentsSegments = (): LineSegment3D[] => {
  const segments: LineSegment3D[] = [];
  CONTINENTS_POLYGONS.forEach((poly) => {
    const points3D = poly.map((pt) => {
      const lon = (pt[0] * Math.PI) / 180;
      const lat = (pt[1] * Math.PI) / 180;
      return {
        x: Math.cos(lat) * Math.sin(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.cos(lon)
      };
    });
    for (let i = 0; i < points3D.length - 1; i++) {
      segments.push({ p1: points3D[i], p2: points3D[i + 1] });
    }
    if (points3D.length > 1) {
      segments.push({ p1: points3D[points3D.length - 1], p2: points3D[0] });
    }
  });
  return segments;
};

const EARTH_CONTINENTS_SEGMENTS = getContinentsSegments();

interface MeshNode3D {
  name: string;
  tag: string;
  lat: number;
  lon: number;
  x: number;
  y: number;
  z: number;
}

const SHAPE_NODES = [
  { name: "Seattle", tag: "SEA", lat: 47.6062, lon: -122.3321 },
  { name: "Tokyo", tag: "TYO", lat: 35.6762, lon: 139.6503 },
  { name: "London", tag: "LDN", lat: 51.5074, lon: -0.1278 },
  { name: "Sydney", tag: "SYD", lat: -33.8688, lon: 151.2093 },
  { name: "Frankfurt", tag: "FRA", lat: 50.1109, lon: 8.6821 },
  { name: "São Paulo", tag: "SAO", lat: -23.5505, lon: -46.6333 },
  { name: "Cape Town", tag: "CPT", lat: -33.9249, lon: 18.4241 }
];

const getMeshNodes3D = (): MeshNode3D[] => {
  return SHAPE_NODES.map((node) => {
    const latRad = (node.lat * Math.PI) / 180;
    const lonRad = (node.lon * Math.PI) / 180;
    return {
      ...node,
      x: Math.cos(latRad) * Math.sin(lonRad),
      y: Math.sin(latRad),
      z: Math.cos(latRad) * Math.cos(lonRad)
    };
  });
};

const EARTH_MESH_NODES = getMeshNodes3D();

const getCloudBlobs = (count: number): Array<{ x: number; y: number; z: number; radius: number; speedMult: number; phase: number }> => {
  const clouds: Array<{ x: number; y: number; z: number; radius: number; speedMult: number; phase: number }> = [];
  const rand = mulberry32(99);
  for (let i = 0; i < count; i++) {
    const z = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z);
    clouds.push({
      x: r * Math.cos(phi),
      y: r * Math.sin(phi),
      z: z,
      radius: rand() * 35 + 20,
      speedMult: rand() * 0.4 + 0.8,
      phase: rand() * Math.PI * 2
    });
  }
  return clouds;
};

const EARTH_CLOUDS = getCloudBlobs(7);

const getSpaceStars = (count: number, width: number, height: number): Array<{ x: number; y: number; radius: number; baseAlpha: number; parallax: number }> => {
  const stars: Array<{ x: number; y: number; radius: number; baseAlpha: number; parallax: number }> = [];
  const rand = mulberry32(1001);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height,
      radius: rand() * 1.0 + 0.3,
      baseAlpha: rand() * 0.5 + 0.15,
      parallax: rand() * 0.02 + 0.005,
    });
  }
  return stars;
};

const SPACE_STARS = getSpaceStars(130, 900, 900);

const rotate3D = (pt: { x: number; y: number; z: number }, cosY: number, sinY: number, cosX: number, sinX: number) => {
  // Rotate Y
  const x1 = pt.x * cosY - pt.z * sinY;
  const z1 = pt.x * sinY + pt.z * cosY;
  const y1 = pt.y;

  // Rotate X
  const x2 = x1;
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;

  return { x: x2, y: y2, z: z2 };
};

const getGlobePoints = (time: number, count: number, cx: number, cy: number) => {
  const points: Array<{ x: number; y: number; z: number; isLand: boolean }> = [];
  const R = 150;
  const angleY = -time * 0.25;
  const angleX = 0.3 + Math.sin(time * 0.1) * 0.05;
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);

  for (let i = 0; i < count; i++) {
    const pt = EARTH_BASE_POINTS[i % EARTH_BASE_POINTS.length];
    const x0 = pt.x * R;
    const y0 = pt.y * R;
    const z0 = pt.z * R;

    const rPt = rotate3D({ x: x0, y: y0, z: z0 }, cosY, sinY, cosX, sinX);
    points.push({
      x: cx + rPt.x,
      y: cy + rPt.y,
      z: rPt.z,
      isLand: pt.isLand
    });
  }
  return points;
};

const getCpuPoints = (count: number, cx: number, cy: number) => {
  const points: Array<{ x: number; y: number }> = [];
  const S = 120;
  
  // Distribute points: 45% outer box, 25% inner core, 30% pins
  const outerCount = Math.floor(count * 0.45);
  const innerCount = Math.floor(count * 0.25);
  const pinCount = count - outerCount - innerCount;

  for (let i = 0; i < count; i++) {
    if (i < outerCount) {
      const t = i / outerCount;
      let x = 0, y = 0;
      if (t < 0.25) {
        x = -S + S * 8 * t; y = -S;
      } else if (t < 0.5) {
        x = S; y = -S + S * 8 * (t - 0.25);
      } else if (t < 0.75) {
        x = S - S * 8 * (t - 0.5); y = S;
      } else {
        x = -S; y = S - S * 8 * (t - 0.75);
      }
      points.push({ x: cx + x, y: cy + y });
    } else if (i < outerCount + innerCount) {
      const Si = S * 0.45;
      const t = (i - outerCount) / innerCount;
      let x = 0, y = 0;
      if (t < 0.25) {
        x = -Si + Si * 8 * t; y = -Si;
      } else if (t < 0.5) {
        x = Si; y = -Si + Si * 8 * (t - 0.25);
      } else if (t < 0.75) {
        x = Si - Si * 8 * (t - 0.5); y = Si;
      } else {
        x = -Si; y = Si - Si * 8 * (t - 0.75);
      }
      points.push({ x: cx + x, y: cy + y });
    } else {
      const pinIdx = i - outerCount - innerCount;
      const side = pinIdx % 4;
      const pos = Math.floor(pinIdx / 4);
      const sidePins = Math.ceil(pinCount / 4);
      const u = -S * 0.6 + (pos / Math.max(1, sidePins - 1)) * (S * 1.2);
      
      const ext = 18;
      let x = 0, y = 0;
      if (side === 0) {
        x = u; y = -S - ext;
      } else if (side === 1) {
        x = S + ext; y = u;
      } else if (side === 2) {
        x = u; y = S + ext;
      } else {
        x = -S - ext; y = u;
      }
      points.push({ x: cx + x, y: cy + y });
    }
  }
  return points;
};

const getShieldPoints = (count: number, cx: number, cy: number) => {
  const shieldScale = 140;
  const segments = [
    ...Array.from({ length: 8 }, (_, i) => {
      const t = Math.PI * 0.5 + (Math.PI * 0.5) * (i / 7);
      return { x: -shieldScale * 0.6 + Math.cos(t) * shieldScale * 0.4, y: -shieldScale * 0.8 + Math.sin(t) * shieldScale * 0.3 };
    }),
    { x: -shieldScale * 0.2, y: -shieldScale * 1.1 },
    { x: shieldScale * 0.2, y: -shieldScale * 1.1 },
    ...Array.from({ length: 8 }, (_, i) => {
      const t = Math.PI * 1.0 - (Math.PI * 0.5) * (i / 7);
      return { x: shieldScale * 0.6 + Math.cos(t) * shieldScale * 0.4, y: -shieldScale * 0.8 + Math.sin(t) * shieldScale * 0.3 };
    }),
    { x: shieldScale, y: -shieldScale * 0.5 },
    { x: shieldScale * 0.9, y: 0 },
    { x: shieldScale * 0.7, y: shieldScale * 0.4 },
    { x: shieldScale * 0.35, y: shieldScale * 0.85 },
    { x: 0, y: shieldScale * 1.2 },
    { x: -shieldScale * 0.35, y: shieldScale * 0.85 },
    { x: -shieldScale * 0.7, y: shieldScale * 0.4 },
    { x: -shieldScale * 0.9, y: 0 },
    { x: -shieldScale, y: -shieldScale * 0.5 },
  ];

  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * segments.length;
    const idx = Math.floor(t) % segments.length;
    const next = (idx + 1) % segments.length;
    const frac = t - Math.floor(t);
    points.push({
      x: cx + segments[idx].x + (segments[next].x - segments[idx].x) * frac,
      y: cy + segments[idx].y + (segments[next].y - segments[idx].y) * frac,
    });
  }
  return points;
};

const getP2PPoints = (count: number, cx: number, cy: number) => {
  const points: Array<{ x: number; y: number }> = [];
  const C0 = { x: 0, y: 0 };
  const C1 = { x: 0, y: -100 };
  const C2 = { x: -95, y: 65 };
  const C3 = { x: 95, y: 65 };

  const R0 = 24; const R1 = 14; const R2 = 14; const R3 = 14;

  const n0 = Math.floor(count * 0.16);
  const n1 = Math.floor(count * 0.10);
  const n2 = Math.floor(count * 0.10);
  const n3 = Math.floor(count * 0.10);
  const nl01 = Math.floor(count * 0.08);
  const nl02 = Math.floor(count * 0.08);
  const nl03 = Math.floor(count * 0.08);
  const nl12 = Math.floor(count * 0.08);
  const nl23 = Math.floor(count * 0.08);
  const nl31 = count - (n0 + n1 + n2 + n3 + nl01 + nl02 + nl03 + nl12 + nl23);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0;
    if (i < n0) {
      const theta = (i / n0) * Math.PI * 2;
      x = C0.x + R0 * Math.cos(theta); y = C0.y + R0 * Math.sin(theta);
    } else if (i < n0 + n1) {
      const theta = ((i - n0) / n1) * Math.PI * 2;
      x = C1.x + R1 * Math.cos(theta); y = C1.y + R1 * Math.sin(theta);
    } else if (i < n0 + n1 + n2) {
      const theta = ((i - n0 - n1) / n2) * Math.PI * 2;
      x = C2.x + R2 * Math.cos(theta); y = C2.y + R2 * Math.sin(theta);
    } else if (i < n0 + n1 + n2 + n3) {
      const theta = ((i - n0 - n1 - n2) / n3) * Math.PI * 2;
      x = C3.x + R3 * Math.cos(theta); y = C3.y + R3 * Math.sin(theta);
    } else if (i < n0 + n1 + n2 + n3 + nl01) {
      const t = (i - n0 - n1 - n2 - n3) / nl01;
      x = C0.x + t * (C1.x - C0.x); y = C0.y + t * (C1.y - C0.y);
    } else if (i < n0 + n1 + n2 + n3 + nl01 + nl02) {
      const t = (i - n0 - n1 - n2 - n3 - nl01) / nl02;
      x = C0.x + t * (C2.x - C0.x); y = C0.y + t * (C2.y - C0.y);
    } else if (i < n0 + n1 + n2 + n3 + nl01 + nl02 + nl03) {
      const t = (i - n0 - n1 - n2 - n3 - nl01 - nl02) / nl03;
      x = C0.x + t * (C3.x - C0.x); y = C0.y + t * (C3.y - C0.y);
    } else if (i < n0 + n1 + n2 + n3 + nl01 + nl02 + nl03 + nl12) {
      const t = (i - n0 - n1 - n2 - n3 - nl01 - nl02 - nl03) / nl12;
      x = C1.x + t * (C2.x - C1.x); y = C1.y + t * (C2.y - C1.y);
    } else if (i < n0 + n1 + n2 + n3 + nl01 + nl02 + nl03 + nl12 + nl23) {
      const t = (i - n0 - n1 - n2 - n3 - nl01 - nl02 - nl03 - nl12) / nl23;
      x = C2.x + t * (C3.x - C2.x); y = C2.y + t * (C3.y - C2.y);
    } else {
      const t = (i - n0 - n1 - n2 - n3 - nl01 - nl02 - nl03 - nl12 - nl23) / nl31;
      x = C3.x + t * (C1.x - C3.x); y = C3.y + t * (C1.y - C3.y);
    }
    points.push({ x: cx + x, y: cy + y });
  }
  return points;
};

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const pathname = usePathname();
  const { activeShape } = useCanvas();

  const activeShapeRef = useRef(activeShape);

  // Sync activeShape into ref to avoid restarting the useEffect draw loop
  useEffect(() => {
    activeShapeRef.current = activeShape;
  }, [activeShape]);

  // Set visualizer opacity based on the pathname
  const isChat = pathname === "/chat";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const W = 900;
    const H = 900;
    
    const scaleCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr * (rect.width / W), dpr * (rect.height / H));
    };
    scaleCanvas();
    window.addEventListener("resize", scaleCanvas);

    const cx = W / 2;
    const cy = H / 2;

    // Track mouse globally across viewport
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 900,
        y: ((e.clientY - rect.top) / rect.height) * 900,
        active: true,
      };
    };

    const handleGlobalMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, active: false };
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseleave", handleGlobalMouseLeave);

    // Particle types
    interface Particle {
      x: number; y: number; baseX: number; baseY: number;
      vx: number; vy: number; radius: number; alpha: number;
      isShield: boolean; type: "shield" | "ambient" | "stream";
      life: number; maxLife: number; speed: number;
    }

    const particles: Particle[] = [];
    
    // Central morphing particles (150 points)
    const initialGlobePoints = getGlobePoints(0, 150, cx, cy);
    initialGlobePoints.forEach((pt) => {
      particles.push({
        x: pt.x + (Math.random() - 0.5) * 120,
        y: pt.y + (Math.random() - 0.5) * 120,
        baseX: pt.x, baseY: pt.y,
        vx: 0, vy: 0,
        radius: Math.random() * 1.5 + 1.2,
        alpha: Math.random() * 0.4 + 0.6,
        isShield: true, type: "shield", life: 1, maxLife: 1, speed: 0,
      });
    });

    // Ambient floating particles (80 points)
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H, baseX: 0, baseY: 0,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.2 + 0.4, alpha: Math.random() * 0.35 + 0.15,
        isShield: false, type: "ambient", life: 1, maxLife: 1, speed: 0,
      });
    }

    // Mouse trail particles (ephemeral)
    interface TrailDot { x: number; y: number; life: number; radius: number; }
    const trail: TrailDot[] = [];
    let lastTrailTime = 0;

    // Camera parallax states
    let px = 0;
    let py = 0;

    // Weights for smooth transition between shapes
    let globeWeight = 1.0;
    let cpuWeight = 0.0;
    let shieldWeight = 0.0;
    let p2pWeight = 0.0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const time = Date.now() * 0.001;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mActive = mouseRef.current.active;

      // Shared 3D Rotation Angles for Earth Outline and Telemetry Nodes
      const angleY = -time * 0.25;
      const angleX = 0.3 + Math.sin(time * 0.1) * 0.05;
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Camera parallax interpolation
      const targetPx = mActive ? (mx - cx) * 0.05 : 0;
      const targetPy = mActive ? (my - cy) * 0.05 : 0;
      px += (targetPx - px) * 0.05;
      py += (targetPy - py) * 0.05;

      // Parallax-shifted central rendering coordinate center
      const ccx = cx + px * 0.3;
      const ccy = cy + py * 0.3;

      // Dynamic weights update
      const targetShape = activeShapeRef.current;
      globeWeight += ((targetShape === "globe" ? 1.0 : 0.0) - globeWeight) * 0.06;
      cpuWeight += ((targetShape === "cpu" ? 1.0 : 0.0) - cpuWeight) * 0.06;
      shieldWeight += ((targetShape === "shield" ? 1.0 : 0.0) - shieldWeight) * 0.06;
      p2pWeight += ((targetShape === "p2p" ? 1.0 : 0.0) - p2pWeight) * 0.06;

      // Render List (3D Painter's Algorithm sorting container)
      interface RenderItem {
        z: number;
        draw: () => void;
      }
      const renderList: RenderItem[] = [];

      // 1. Radial background aura (dynamic colors matching shape weights)
      renderList.push({
        z: -2000,
        draw: () => {
          ctx.save();
          // Dynamic combination of active weight colors:
          const r = Math.floor(244 * globeWeight + 251 * cpuWeight + 6 * shieldWeight + 139 * p2pWeight);
          const g = Math.floor(244 * globeWeight + 191 * cpuWeight + 182 * shieldWeight + 92 * p2pWeight);
          const b = Math.floor(245 * globeWeight + 36 * cpuWeight + 212 * shieldWeight + 246 * p2pWeight);
          const maxAlpha = 0.04 * globeWeight + 0.05 * cpuWeight + 0.05 * shieldWeight + 0.05 * p2pWeight;

          const grad = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, W * 0.5);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${maxAlpha})`);
          grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${maxAlpha * 0.4})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }
      });

      // 1.1 CPU Tech Grid Overlay
      if (cpuWeight > 0.01) {
        renderList.push({
          z: -1500,
          draw: () => {
            ctx.save();
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.03 * cpuWeight})`;
            ctx.lineWidth = 1;
            const size = 320;
            const spacing = 40;
            ctx.beginPath();
            for (let x = -size / 2; x <= size / 2; x += spacing) {
              ctx.moveTo(ccx + x, ccy - size / 2);
              ctx.lineTo(ccx + x, ccy + size / 2);
            }
            for (let y = -size / 2; y <= size / 2; y += spacing) {
              ctx.moveTo(ccx - size / 2, ccy + y);
              ctx.lineTo(ccx + size / 2, ccy + y);
            }
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // 1.2 Shield Radar Concentric Sweeps Overlay
      if (shieldWeight > 0.01) {
        renderList.push({
          z: -1500,
          draw: () => {
            ctx.save();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.05 * shieldWeight})`;
            ctx.lineWidth = 0.8;
            
            // Concentric rings
            ctx.beginPath();
            ctx.arc(ccx, ccy, 180, 0, Math.PI * 2);
            ctx.arc(ccx, ccy, 240, 0, Math.PI * 2);
            ctx.stroke();

            // Dashed outer concentric ring
            ctx.beginPath();
            ctx.setLineDash([4, 8]);
            ctx.arc(ccx, ccy, 300, 0, Math.PI * 2);
            ctx.stroke();

            // Radar scanning sweep line
            const sweepAngle = time * 0.8;
            ctx.beginPath();
            ctx.moveTo(ccx, ccy);
            ctx.lineTo(ccx + 300 * Math.cos(sweepAngle), ccy + 300 * Math.sin(sweepAngle));
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * shieldWeight})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            
            // Soft radar sweep arc gradient
            const sweepGrad = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, 300);
            sweepGrad.addColorStop(0, `rgba(6, 182, 212, ${0.03 * shieldWeight})`);
            sweepGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = sweepGrad;
            ctx.beginPath();
            ctx.moveTo(ccx, ccy);
            ctx.arc(ccx, ccy, 300, sweepAngle - 0.4, sweepAngle);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
          }
        });
      }

      // 1.3 P2P Ripple Waves Overlay
      if (p2pWeight > 0.01) {
        renderList.push({
          z: -1500,
          draw: () => {
            ctx.save();
            ctx.lineWidth = 1.2;
            for (let i = 0; i < 3; i++) {
              const progress = ((time * 0.4) + i * 0.33) % 1.0;
              const radius = progress * 280;
              const opacity = (1 - progress) * 0.08 * p2pWeight;
              
              ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
              ctx.beginPath();
              ctx.arc(ccx, ccy, radius, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.restore();
          }
        });
      }

      // 2. Parallax Space Stars (deep background layer)
      SPACE_STARS.forEach((star) => {
        const sx = star.x + px * star.parallax * 15;
        const sy = star.y + py * star.parallax * 15;
        const twinkle = 0.65 + 0.35 * Math.sin(time * 2.5 + star.x * 0.01 + star.y * 0.01);
        renderList.push({
          z: -1000 + star.parallax * 100,
          draw: () => {
            ctx.beginPath();
            ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244, 244, 245, ${star.baseAlpha * twinkle})`;
            ctx.fill();
          }
        });
      });

      // 6. Globe Circle Outline
      if (globeWeight > 0.01) {
        renderList.push({
          z: 0,
          draw: () => {
            ctx.save();
            ctx.strokeStyle = `rgba(161, 161, 170, ${0.06 * globeWeight})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(ccx, ccy, 150, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // 6.1 Continent Outlines
      if (globeWeight > 0.01) {
        const R = 150;
        EARTH_CONTINENTS_SEGMENTS.forEach((seg) => {
          const p1Scaled = { x: seg.p1.x * R, y: seg.p1.y * R, z: seg.p1.z * R };
          const p2Scaled = { x: seg.p2.x * R, y: seg.p2.y * R, z: seg.p2.z * R };

          const rot1 = rotate3D(p1Scaled, cosY, sinY, cosX, sinX);
          const rot2 = rotate3D(p2Scaled, cosY, sinY, cosX, sinX);

          const avgZ = (rot1.z + rot2.z) / 2;

          renderList.push({
            z: avgZ,
            draw: () => {
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(ccx + rot1.x, ccy + rot1.y);
              ctx.lineTo(ccx + rot2.x, ccy + rot2.y);

              // Fade backside lines for 3D realism
              const zFade = avgZ < 0 ? Math.max(0, (R + avgZ) / R) * 0.22 : 1.0;
              const opacity = 0.45 * globeWeight * zFade;

              ctx.strokeStyle = `rgba(244, 244, 245, ${opacity})`;
              ctx.lineWidth = 1.0;
              if (avgZ < 0) {
                // Dashed styling for backsides
                ctx.setLineDash([1, 4]);
              }
              ctx.stroke();
              ctx.restore();
            }
          });
        });
      }

      // 6.2 Telemetry Hub Nodes
      if (globeWeight > 0.01) {
        const R = 150;
        EARTH_MESH_NODES.forEach((node) => {
          const nodeScaled = { x: node.x * R, y: node.y * R, z: node.z * R };
          const rot = rotate3D(nodeScaled, cosY, sinY, cosX, sinX);

          // Render only facing hemisphere nodes
          if (rot.z >= -10) {
            renderList.push({
              z: rot.z + 10,
              draw: () => {
                ctx.save();
                const px = ccx + rot.x;
                const py = ccy + rot.y;

                // Pulsing telemetry effect
                const pulsePhase = (time * 1.8 + node.lat + node.lon) % Math.PI;
                const pulseRadius = 4 + Math.sin(pulsePhase) * 14;
                const pulseOpacity = (1 - Math.sin(pulsePhase)) * 0.35 * globeWeight;

                // Radar circle
                ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Core dot static ring
                ctx.strokeStyle = `rgba(244, 244, 245, ${0.25 * globeWeight})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.stroke();

                // Core node dot
                ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * globeWeight})`;
                ctx.shadowColor = "rgba(255, 255, 255, 0.75)";
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(px, py, 1.8, 0, Math.PI * 2);
                ctx.fill();

                // Monospace text label
                ctx.shadowBlur = 0;
                ctx.font = "bold 9px var(--font-mono), JetBrains Mono, monospace";
                ctx.fillStyle = `rgba(244, 244, 245, ${0.8 * globeWeight})`;
                ctx.fillText(node.tag, px + 7, py - 3);

                ctx.restore();
              }
            });
          }
        });
      }

      // 7. Volumetric Cloud Blobs
      if (globeWeight > 0.01) {
        const cloudRotationAngle = time * 0.30; // Orbit slightly faster
        const angleX = 0.3 + Math.sin(time * 0.1) * 0.05;
        const cosCY = Math.cos(cloudRotationAngle);
        const sinCY = Math.sin(cloudRotationAngle);
        const cosCX = Math.cos(angleX);
        const sinCX = Math.sin(angleX);
        const R_cloud = 168;

        EARTH_CLOUDS.forEach((c) => {
          const x0 = c.x * R_cloud;
          const y0 = c.y * R_cloud;
          const z0 = c.z * R_cloud;
          
          const rot = rotate3D({ x: x0, y: y0, z: z0 }, cosCY, sinCY, cosCX, sinCX);
          const px = ccx + rot.x;
          const py = ccy + rot.y;
          
          if (rot.z >= -30) {
            renderList.push({
              z: rot.z + 1.5,
              draw: () => {
                ctx.save();
                const grad = ctx.createRadialGradient(px, py, 0, px, py, c.radius);
                const dotLight = (rot.x * 0.6 - rot.y * 0.6 + rot.z * 0.5) / R_cloud;
                const lightFactor = Math.max(0.15, dotLight);
                
                const alpha = 0.04 * lightFactor * globeWeight * (rot.z >= 0 ? 1 : (1 + rot.z / 30));
                
                grad.addColorStop(0, `rgba(244, 244, 245, ${alpha})`);
                grad.addColorStop(0.5, `rgba(244, 244, 245, ${alpha * 0.4})`);
                grad.addColorStop(1, "rgba(244, 244, 245, 0)");
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, c.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            });
          }
        });
      }

      // 9. Central Morphing Particles
      const globePoints = getGlobePoints(time, 150, ccx, ccy);
      const cpuPoints = getCpuPoints(150, ccx, ccy);
      const shieldPoints = getShieldPoints(150, ccx, ccy);
      const p2pPoints = getP2PPoints(150, ccx, ccy);

      particles.forEach((p, idx) => {
        if (p.isShield) {
          const ptG = globePoints[idx] || { x: ccx, y: ccy, z: 0, isLand: false };
          const ptC = cpuPoints[idx] || { x: ccx, y: ccy };
          const ptS = shieldPoints[idx] || { x: ccx, y: ccy };
          const ptP = p2pPoints[idx] || { x: ccx, y: ccy };

          // Interpolated shape coordinates
          const targetX = ptG.x * globeWeight + ptC.x * cpuWeight + ptS.x * shieldWeight + ptP.x * p2pWeight;
          const targetY = ptG.y * globeWeight + ptC.y * cpuWeight + ptS.y * shieldWeight + ptP.y * p2pWeight;

          const noiseX = Math.sin(time * 2.5 + idx * 0.5) * 1.0;
          const noiseY = Math.cos(time * 2.1 + idx * 0.3) * 1.0;

          // Transition quantum turbulence (distort coordinates during morph)
          let turbX = 0, turbY = 0;
          const transitionState = globeWeight * (1 - globeWeight) + cpuWeight * (1 - cpuWeight) + shieldWeight * (1 - shieldWeight) + p2pWeight * (1 - p2pWeight);
          if (transitionState > 0.05) {
            turbX = Math.sin(time * 15 + idx * 1.6) * 10.0 * transitionState;
            turbY = Math.cos(time * 12 + idx * 1.3) * 10.0 * transitionState;
          }

          const finalTargetX = targetX + noiseX + turbX;
          const finalTargetY = targetY + noiseY + turbY;

          // Magnetic mouse push
          if (mActive) {
            const dx = mx - p.x, dy = my - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 140) {
              const f = (1 - dist / 140) * 8;
              p.x += (dx / dist) * f;
              p.y += (my > p.y ? -1 : 1) * f * 0.25;
            }
          }

          p.x += (finalTargetX - p.x) * 0.06;
          p.y += (finalTargetY - p.y) * 0.06;

          // Rotated Z depth mapping
          const pz = ptG.z * globeWeight + 50 * (1 - globeWeight);

          renderList.push({
            z: pz,
            draw: () => {
              ctx.save();
              
              // Smooth transition of particle styles
              const isLand = ptG.isLand;
              const isFront = ptG.z >= 0;
              
              let a_g = 0;
              let s_g = p.radius;
              let r_g = 255, g_g = 255, b_g = 255;
              let shadowColorG = "rgba(0, 0, 0, 0)";
              let shadowBlurG = 0;
              
              if (isLand) {
                const twinkle = 0.5 + 0.5 * Math.sin(time * (3.5 + (idx % 6)) + idx);
                
                if (!isFront) {
                  const backFactor = (150 + ptG.z) / 150;
                  a_g = (0.25 + 0.35 * twinkle) * backFactor;
                  r_g = 244; g_g = 244; b_g = 245;
                  s_g = 1.6;
                } else {
                  const dx = ptG.x - ccx;
                  const dy = ptG.y - ccy;
                  const illumination = dx * 0.6 - dy * 0.6 + ptG.z * 0.5;
                  const nightFactor = Math.max(0.12, 1.0 - Math.max(0, illumination / 150));
                  
                  a_g = (0.45 + 0.55 * nightFactor) * (0.7 + 0.3 * twinkle);
                  r_g = 255; g_g = 255; b_g = 255;
                  s_g = 2.4;
                  
                  if (twinkle > 0.8 && nightFactor > 0.55) {
                    shadowColorG = "rgba(255, 255, 255, 0.6)";
                    shadowBlurG = 4;
                  }
                }
              } else {
                const shimmer = 0.35 + 0.65 * Math.sin(time * 1.8 + idx);
                if (isFront) {
                  a_g = 0.32 * shimmer;
                  r_g = 228; g_g = 228; b_g = 231;
                  s_g = 1.6;
                } else {
                  a_g = 0.12 * shimmer;
                  r_g = 161; g_g = 161; b_g = 170;
                  s_g = 1.2;
                }
              }

              // Interpolate size, color (rgb), alpha and shadow
              const size = s_g * globeWeight + p.radius * (1 - globeWeight);
              const r = Math.floor(r_g * globeWeight + 255 * (1 - globeWeight));
              const g = Math.floor(g_g * globeWeight + 255 * (1 - globeWeight));
              const b = Math.floor(b_g * globeWeight + 255 * (1 - globeWeight));
              const alpha = a_g * globeWeight + p.alpha * (1 - globeWeight);
              
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

              const sBlur = shadowBlurG * globeWeight + 3 * (1 - globeWeight);
              if (sBlur > 0.1) {
                ctx.shadowBlur = sBlur;
                if (globeWeight > 0.5) {
                  ctx.shadowColor = shadowColorG;
                } else {
                  ctx.shadowColor = `rgba(244, 244, 245, ${0.75 * (1 - globeWeight)})`;
                }
              } else {
                ctx.shadowBlur = 0;
                ctx.shadowColor = "transparent";
              }
              
              ctx.beginPath();
              ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });

          // Draw connection lines for all states (including Globe)
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (!p2.isShield) continue;

            const ptG2 = globePoints[j] || { x: ccx, y: ccy, z: 0, isLand: false };
            const pz2 = ptG2.z * globeWeight + 50 * (1 - globeWeight);
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y, pz - pz2);
            const maxDist = 85;
            if (dist < maxDist) {
              const avgZ = (pz + pz2) / 2;
              let depthFade = 1.0;
              if (globeWeight > 0.01) {
                const zFade = avgZ < 0 ? Math.max(0, (150 + avgZ) / 150) : 1.0;
                depthFade = zFade * globeWeight + 1.0 * (1 - globeWeight);
              }
              const baseOpacity = 0.22 * globeWeight + 0.28 * (1 - globeWeight);
              const la = (1 - dist / maxDist) * baseOpacity * depthFade;

              renderList.push({
                z: avgZ,
                draw: () => {
                  ctx.save();
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p2.x, p2.y);

                  ctx.strokeStyle = `rgba(244, 244, 245, ${la})`;
                  ctx.lineWidth = 0.8;
                  ctx.stroke();
                  ctx.restore();
                }
              });
            }
          }
        } else {
          // Ambient particles (floating in the background)
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          if (mActive) {
            const dx = p.x - mx, dy = p.y - my;
            const dist = Math.hypot(dx, dy);
            if (dist < 120) {
              const f = (1 - dist / 120) * 3.5;
              p.x += (dx / dist) * f;
              p.y += (dy / dist) * f;
            }
          }

          renderList.push({
            z: -10,
            draw: () => {
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(244, 244, 245, ${p.alpha})`;
              ctx.fill();
            }
          });
        }
      });

      // 10. Draw CPU Outline
      if (cpuWeight > 0.01) {
        renderList.push({
          z: 49,
          draw: () => {
            ctx.save();
            ctx.strokeStyle = `rgba(161, 161, 170, ${0.05 * cpuWeight})`;
            ctx.lineWidth = 1;
            
            const S = 120;
            ctx.strokeRect(ccx - S, ccy - S, S * 2, S * 2);
            const Si = S * 0.45;
            ctx.strokeRect(ccx - Si, ccy - Si, Si * 2, Si * 2);
            
            ctx.beginPath();
            for (let pinIdx = 0; pinIdx < 16; pinIdx++) {
              const side = Math.floor(pinIdx / 4);
              const offsetIdx = pinIdx % 4;
              const u = -S * 0.6 + offsetIdx * (S * 1.2 / 3);
              if (side === 0) {
                ctx.moveTo(ccx + u, ccy - S); ctx.lineTo(ccx + u, ccy - S - 18);
              } else if (side === 1) {
                ctx.moveTo(ccx + S, ccy + u); ctx.lineTo(ccx + S + 18, ccy + u);
              } else if (side === 2) {
                ctx.moveTo(ccx + u, ccy + S); ctx.lineTo(ccx + u, ccy + S + 18);
              } else {
                ctx.moveTo(ccx - S, ccy + u); ctx.lineTo(ccx - S - 18, ccy + u);
              }
            }
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // 11. Draw Shield Outline
      if (shieldWeight > 0.01) {
        const breathe = 0.08 + Math.sin(time * 1.5) * 0.06;
        renderList.push({
          z: 49,
          draw: () => {
            ctx.save();
            ctx.strokeStyle = `rgba(161, 161, 170, ${breathe * shieldWeight})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = `rgba(244, 244, 245, ${breathe * 0.5 * shieldWeight})`;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            const outlinePoints = getShieldPoints(60, ccx, ccy);
            outlinePoints.forEach((pt, i) => { if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); });
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            // Inner dashed shield
            ctx.save();
            ctx.strokeStyle = `rgba(113, 113, 122, ${breathe * 0.4 * shieldWeight})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            const innerPts = getShieldPoints(60, ccx, ccy).map(pt => ({
              x: ccx + (pt.x - ccx) * 0.85, y: ccy + (pt.y - ccy) * 0.85
            }));
            innerPts.forEach((pt, i) => { if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); });
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            // Checkmark Symbol
            ctx.save();
            const checkAlpha = (0.18 + Math.sin(time * 1.5) * 0.06) * shieldWeight;
            ctx.strokeStyle = `rgba(244, 244, 245, ${checkAlpha})`;
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            const shieldScale = 140;
            ctx.moveTo(ccx - shieldScale * 0.25, ccy - shieldScale * 0.05);
            ctx.lineTo(ccx - shieldScale * 0.04, ccy + shieldScale * 0.22);
            ctx.lineTo(ccx + shieldScale * 0.32, ccy - shieldScale * 0.3);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // 12. Draw P2P Mesh Outline
      if (p2pWeight > 0.01) {
        renderList.push({
          z: 49,
          draw: () => {
            ctx.save();
            ctx.strokeStyle = `rgba(161, 161, 170, ${0.06 * p2pWeight})`;
            ctx.lineWidth = 1.2;
            
            const C0 = { x: ccx + 0, y: ccy + 0 };
            const C1 = { x: ccx + 0, y: ccy - 100 };
            const C2 = { x: ccx - 95, y: ccy + 65 };
            const C3 = { x: ccx + 95, y: ccy + 65 };

            const R0 = 24; const R1 = 14; const R2 = 14; const R3 = 14;

            ctx.beginPath();
            ctx.arc(C0.x, C0.y, R0, 0, Math.PI * 2);
            ctx.arc(C1.x, C1.y, R1, 0, Math.PI * 2);
            ctx.arc(C2.x, C2.y, R2, 0, Math.PI * 2);
            ctx.arc(C3.x, C3.y, R3, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(C0.x, C0.y); ctx.lineTo(C1.x, C1.y);
            ctx.moveTo(C0.x, C0.y); ctx.lineTo(C2.x, C2.y);
            ctx.moveTo(C0.x, C0.y); ctx.lineTo(C3.x, C3.y);
            ctx.moveTo(C1.x, C1.y); ctx.lineTo(C2.x, C2.y);
            ctx.moveTo(C2.x, C2.y); ctx.lineTo(C3.x, C3.y);
            ctx.moveTo(C3.x, C3.y); ctx.lineTo(C1.x, C1.y);
            ctx.stroke();
            
            ctx.restore();
          }
        });
      }

      // 13. Mouse trail rendering (independent overlay)
      if (mActive && time - lastTrailTime > 0.04) {
        trail.push({ x: mx, y: my, life: 1, radius: Math.random() * 2 + 1 });
        lastTrailTime = time;
        if (trail.length > 30) trail.shift();
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        t.life -= 0.025;
        if (t.life <= 0) { trail.splice(i, 1); continue; }
        
        renderList.push({
          z: 500,
          draw: () => {
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius * t.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244, 244, 245, ${t.life * 0.15})`;
            ctx.fill();
          }
        });
      }

      // --- Sort and Draw All Items ---
      renderList.sort((a, b) => a.z - b.z);
      renderList.forEach(item => item.draw());

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", scaleCanvas);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseleave", handleGlobalMouseLeave);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ease-in-out transform-gpu will-change-transform"
      style={{ 
        opacity: isChat ? 0 : 0.9,
        zIndex: 0,
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
    </div>
  );
}
