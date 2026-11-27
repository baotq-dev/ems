export type ProductStatus = 'Active' | 'Inactive';

export interface ProductInactivePeriod {
  id: string;
  fromDate: string; // ISO format: YYYY-MM-DD
  toDate?: string;  // ISO format: YYYY-MM-DD (optional if open-ended)
}

export interface ProductRecord {
  id: string;
  categoryId: number | string;   // Links to category reference (e.g., 305, 596)
  division: string;              // e.g., "Sabeco", "Carlsberg", "Heineken"
  brand: string;                 // e.g., "Sai Gon Lager", "1664 Blanc"
  productGroup?: string;         // Sub-category / group label
  productCode: string;           // e.g., "P00001", "P00001-FES"
  productName: string;           // e.g., "SAIGON LAGER x 24 lon"
  barcode?: string;              // Retail unit barcode
  barrelBarcode?: string;        // Case/carton barcode
  barrelSize: number;            // Units per case/carton (e.g., 24, 12, 0)
  unit: string;                  // Packaging unit (e.g., "Case", "Can", "Bottle")
  packageSize?: string;          // Volume/weight per unit (e.g., "330ml", "250ml")
  sortOrder: number;             // Display order index (defaults to 0)
  price: number;                 // Unit/case price (defaults to 0)
  status: ProductStatus;         // "Active" | "Inactive"
  inactiveFrom?: string;         // Active/latest inactive start date (YYYY-MM-DD)
  inactiveTo?: string;           // Active/latest inactive end date (YYYY-MM-DD)
  inactivePeriods: ProductInactivePeriod[]; // History of scheduled inactive date ranges
  expiryDate?: string;           // Optional expiry date
  createdAt: string;             // ISO format: YYYY-MM-DD
}
