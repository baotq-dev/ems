export type StoreStatus = 'Active' | 'Inactive';

export interface StoreChannelOption {
  code: string; // e.g., "Hyper", "Super", "CVS", "Minimart"
  name: string;
}

export interface StoreAccountOption {
  code: string; // e.g., "CUS001", "CUS002", "CUS003", "BHX"
  name: string; // e.g., "COOP", "BIG C", "MEGA", "Bach Hoa Xanh"
  chain?: string;
}

export interface StoreSupplierOption {
  code: string;
  name: string;
}

export interface StoreTypeOption {
  code: string;
  name: string;
}

export interface ProvinceHierarchyItem {
  id: number;
  area: string;     // Region/Area, e.g., "Mien Dong", "Song Tien", "Song Hau", "Bac Trung Bo"
  province: string; // e.g., "Ho Chi Minh City", "Tien Giang", "Ben Tre", "Kien Giang"
  districts: {
    name: string;   // e.g., "Vung Tau City", "My Tho City", "Ben Tre City"
    towns: string[]; // Ward/Commune list, e.g., ["Phuoc Thang Ward", "Ward 5", "Son Dong Commune"]
  }[];
}

export interface StoreRecord {
  id: string;
  storeImageUrl?: string;
  channelCode?: string;
  channelName?: string;
  accountCode: string;       // Chain/Account code, e.g., "CUS003", "BHX"
  accountName: string;       // Chain/Account name, e.g., "MEGA", "Bach Hoa Xanh"
  supplierCode?: string;
  supplierName?: string;
  storeType?: string;
  storeCode: string;         // Required, e.g., "A103", "A112", "BI26", "S071"
  storeName: string;         // Required, e.g., "Mega Vung Tau"
  address: string;           // Required full street address
  area: string;              // Region/Area, e.g., "Mien Dong", "Song Tien", "Song Hau"
  provinceId?: number;
  province: string;          // Legacy/current Province/City
  district?: string;
  town?: string;             // Ward/Commune
  newProvince?: string;      // Merged/New Province/City
  newTown?: string;          // Merged/New Ward/Commune
  districtTownNote?: string;
  activeDate?: string;       // YYYY-MM-DD
  closedDate?: string;       // YYYY-MM-DD
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  coordinateSource?: string;
  oldStoreCode?: string;
  codeChangeNote?: string;
  mobile?: string;
  email?: string;
  frequency: number;         // Visit/shift frequency (defaults to 1)
  locationCode?: string;
  unitCode?: string;
  overview?: string;
  status: StoreStatus;       // "Active" | "Inactive"
  createdAt: string;
  updatedAt: string;
}
