export type Lead = {
  placeId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  businessStatus?: string;
  location: {
    lat: number;
    lng: number;
  };
  primaryType?: string;
  types: string[];
};

export type LeadsResponse = {
  leads: Lead[];
  center: {
    lat: number;
    lng: number;
  };
};
