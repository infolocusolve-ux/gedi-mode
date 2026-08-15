// Curated so a blank "Car" field never reads as fake/generated data — every
// value here is a real, common Indian-market model. No plates or
// registration numbers are ever generated.
export const CURATED_CARS = [
  "Mahindra Thar",
  "Mahindra Scorpio-N",
  "Maruti Suzuki Swift",
  "Hyundai Creta",
  "Tata Nexon",
  "Toyota Fortuner",
  "Kia Seltos",
  "Honda City",
  "Maruti Suzuki Baleno",
  "Tata Harrier",
] as const;

export function pickRandomCar(): string {
  return CURATED_CARS[Math.floor(Math.random() * CURATED_CARS.length)];
}

export const DRIVER_NAME_MAX = 32;
export const CAR_MAX = 40;

export interface DriverDetailsErrors {
  driverName: string | null;
  car: string | null;
}

export function validateDriverDetails(driverName: string, car: string): DriverDetailsErrors {
  const name = driverName.trim();
  const carTrimmed = car.trim();

  let driverNameError: string | null = null;
  if (!name) {
    driverNameError = "Driver name is required.";
  } else if (name.length < 2) {
    driverNameError = "Must be at least 2 characters.";
  } else if (name.length > DRIVER_NAME_MAX) {
    driverNameError = `Must be ${DRIVER_NAME_MAX} characters or fewer.`;
  }

  const carError = carTrimmed.length > CAR_MAX ? `Must be ${CAR_MAX} characters or fewer.` : null;

  return { driverName: driverNameError, car: carError };
}

const STORAGE_KEY = "gedi-driver-details";

export interface StoredDriverDetails {
  driverName: string;
  car: string;
}

// sessionStorage only — cleared when the tab closes. Personal details never
// persist across sessions unless the user explicitly opts in (no such
// option exists yet, so nothing here ever touches localStorage).
export function loadStoredDriverDetails(): StoredDriverDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDriverDetails>;
    if (typeof parsed.driverName === "string" && typeof parsed.car === "string") {
      return { driverName: parsed.driverName, car: parsed.car };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredDriverDetails(details: StoredDriverDetails): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch {
    // Unavailable (private mode, quota) — non-fatal, just skips prefill next time.
  }
}
