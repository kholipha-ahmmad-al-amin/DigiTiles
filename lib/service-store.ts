import { canAttachCrew, ServiceDirectory } from "./service-directory";
import { loadDatabase, saveDatabase } from "./store";
import { RuntimeDatabase } from "./types";

const demoVerification = { verifiedAt: "2026-11-01T00:00:00.000Z", demo: true };
const demoDirectory: ServiceDirectory = {
  crews: [
    { id: "crew_slab", nameEn: "Dhaka Slab Crew", nameBn: "ঢাকা স্ল্যাব কারিগর দল", districts: ["Dhaka", "Gazipur"], specialties: ["LARGE_FORMAT", "WATERPROOFING"], rateBdt: 48, rateUnit: "SQFT", completedProjects: 32, ...demoVerification },
    { id: "crew_mosaic", nameEn: "Old Dhaka Mosaic Crew", nameBn: "পুরান ঢাকার মোজাইক কারিগর দল", districts: ["Dhaka", "Narayanganj"], specialties: ["MOSAIC"], rateBdt: 2400, rateUnit: "DAY", completedProjects: 18, ...demoVerification },
    { id: "crew_civil", nameEn: "Eastern Civil Works Crew", nameBn: "ইস্টার্ন নির্মাণকাজের দল", districts: ["Chattogram", "Sylhet"], specialties: ["CIVIL", "WATERPROOFING"], rateBdt: 3000, rateUnit: "DAY", completedProjects: 24, ...demoVerification },
  ],
  transport: [
    { id: "fleet_pickup", nameEn: "Dhaka Pickup Service", nameBn: "ঢাকা পিকআপ সেবা", districts: ["Dhaka", "Gazipur", "Narayanganj"], vehicleType: "PICKUP_1_TON", rates: { Dhaka: { baseBdt: 950, perKmBdt: 28 }, Gazipur: { baseBdt: 1050, perKmBdt: 30 }, Narayanganj: { baseBdt: 1000, perKmBdt: 29 } }, ...demoVerification },
    { id: "fleet_van", nameEn: "Central Covered Transport", nameBn: "সেন্ট্রাল কাভার্ড পরিবহন", districts: ["Dhaka", "Gazipur", "Chattogram"], vehicleType: "COVERED_VAN_3_TON", rates: { Dhaka: { baseBdt: 2250, perKmBdt: 50 }, Gazipur: { baseBdt: 2400, perKmBdt: 52 }, Chattogram: { baseBdt: 2500, perKmBdt: 55 } }, ...demoVerification },
    { id: "fleet_truck", nameEn: "Eastern Heavy Transport", nameBn: "ইস্টার্ন ভারী পরিবহন", districts: ["Dhaka", "Chattogram", "Sylhet"], vehicleType: "OPEN_TRUCK_7_TON", rates: { Dhaka: { baseBdt: 4300, perKmBdt: 72 }, Chattogram: { baseBdt: 4500, perKmBdt: 76 }, Sylhet: { baseBdt: 4600, perKmBdt: 78 } }, ...demoVerification },
  ],
};

export function getVerifiedServices(db: RuntimeDatabase = loadDatabase()): ServiceDirectory {
  const directory = db.serviceDirectory ?? demoDirectory;
  const verified = (provider: { verifiedAt: string }) => Date.parse(provider.verifiedAt) <= Date.now();
  return { crews: directory.crews.filter(verified), transport: directory.transport.filter(verified) };
}

export function attachPreferredCrew(userId: string, orderId: string, crewId: string | null) {
  const db = loadDatabase();
  const order = db.orders.find((entry) => entry.id === orderId && entry.customerUserId === userId);
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (!canAttachCrew(order.state)) throw new Error("ORDER_INACTIVE");

  const now = new Date().toISOString();
  if (crewId === null) {
    delete order.preferredCrew;
  } else {
    const crew = getVerifiedServices(db).crews.find((entry) => entry.id === crewId && entry.districts.some(
      (district) => district === order.buyerSnapshot.deliveryDistrict
    ));
    if (!crew) throw new Error("CREW_UNAVAILABLE");
    if (order.preferredCrew?.id === crew.id) return order.preferredCrew;
    order.preferredCrew = {
      id: crew.id, nameEn: crew.nameEn, nameBn: crew.nameBn,
      verifiedAt: crew.verifiedAt, attachedAt: now, demo: crew.demo,
    };
  }
  order.updatedAt = now;
  saveDatabase(db);
  return order.preferredCrew ?? null;
}
