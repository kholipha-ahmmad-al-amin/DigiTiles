export const serviceDistricts = ["Dhaka", "Gazipur", "Narayanganj", "Chattogram", "Sylhet"] as const;
export const crewSpecialties = ["LARGE_FORMAT", "MOSAIC", "WATERPROOFING", "CIVIL"] as const;
export const vehicleTypes = ["PICKUP_1_TON", "COVERED_VAN_3_TON", "OPEN_TRUCK_7_TON"] as const;

export type ServiceDistrict = typeof serviceDistricts[number];
export type CrewSpecialty = typeof crewSpecialties[number];
export type DirectoryVehicleType = typeof vehicleTypes[number];

interface Provider {
  id: string;
  nameEn: string;
  nameBn: string;
  districts: ServiceDistrict[];
  verifiedAt: string;
  demo?: boolean;
}

export interface ConstructionCrew extends Provider {
  specialties: CrewSpecialty[];
  rateBdt: number;
  rateUnit: "DAY" | "SQFT";
  completedProjects: number;
}

export interface TransportProvider extends Provider {
  vehicleType: DirectoryVehicleType;
  rates: Partial<Record<ServiceDistrict, { baseBdt: number; perKmBdt: number }>>;
}

export interface ServiceDirectory {
  crews: ConstructionCrew[];
  transport: TransportProvider[];
}

export interface PreferredCrew {
  id: string;
  nameEn: string;
  nameBn: string;
  verifiedAt: string;
  attachedAt: string;
  demo?: boolean;
}

export function transportEstimate(rate: { baseBdt: number; perKmBdt: number }, km: number) {
  return Math.round(rate.baseBdt + rate.perKmBdt * km);
}

export function canAttachCrew(state: string) {
  return ["PENDING_CONFIRMATION", "CONFIRMED", "PROCESSING", "READY_FOR_DISPATCH", "DISPATCHED", "DELIVERED"].includes(state);
}
