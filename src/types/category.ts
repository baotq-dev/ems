export type CategoryStatus = 'Active' | 'Inactive';

export interface ProductCategoryRecord {
  id: string;
  division: string;        // e.g., "Beverages", "Coffee", "Cereal"
  brand: string;           // e.g., "MacCoffee", "Cafe Pho"
  brandVn: string;         // Vietnamese display name for Brand
  category: string;        // e.g., "Cafe Pho 3-in-1 24g x 10"
  categoryVn: string;      // Vietnamese display name for Category
  subCategory?: string;    // Optional sub-category EN
  subCategoryVn?: string;  // Optional sub-category VN
  variant?: string;        // Optional SKU variant / packaging note
  sortOrder: number;       // Numeric display order (e.g., 1, 2, 3...)
  status: CategoryStatus;  // "Active" | "Inactive"
}
