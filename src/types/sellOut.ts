export interface ProductCatalogItem {
  id: string;
  category: string; // e.g., "Coffee", "Tea & RTD", "Nutrition"
  productGroup: string; // e.g., "3-in-1 Instant Coffee", "Canned Coffee", "Cereal"
  productCode: string; // e.g., "FE-CF001"
  productName: string; // e.g., "MacCoffee Cafe Pho 24g x 10"
  existingTotalQty: number; // Cumulative recorded quantity prior to current entry
}

export interface SellOutLineItem {
  id: string;
  category: string;
  productGroup: string;
  productCode: string;
  productName: string;
  totalQuantity: number;
  quantity: number; // Sold units recorded in this submission
  note?: string;
  osa: boolean; // On-Shelf Availability indicator
}

export interface SellOutReportRecord {
  id: string;
  zoneCode: string; // e.g., "HCM03", "HCM01", "HN01", "HP01"
  channel: string; // e.g., "MT", "GT"
  chain: string; // e.g., "Co.opmart", "WinMart", "Emart"
  province: string;
  storeCode: string; // e.g., "MCP_Q3"
  storeName: string; // e.g., "Co.opmart Nguyen Dinh Chieu"
  storeAddress: string;
  supervisorId: string;
  supervisorName: string;
  userId: string;
  employeeCode: string;
  employeeName: string;
  phoneNumber: string;
  position: string; // e.g., "PG-D", "PG-Inline", "PA"
  recordedAt: string; // Format: "YYYY-MM-DD HH:mm"
  shiftCode: string; // e.g., "CA_AM", "CA_PM"
  totalQuantity: number; // Sum of `quantity` across all `items`
  items: SellOutLineItem[];
}
