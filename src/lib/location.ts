export function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

export function normalizePostalCode(postalCode: string): string {
  return postalCode.trim().toLowerCase().replace(/\s+/g, "");
}
