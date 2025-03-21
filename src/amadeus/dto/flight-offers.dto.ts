export interface FlightOffer {
    type: string;
    id: string;
    source: string;
    instantTicketingRequired: boolean;
    nonHomogeneous: boolean;
    oneWay: boolean;
    lastTicketingDate: string;
    numberOfBookableSeats: number;
    itineraries: Itinerary[];
    price: Price;
    pricingOptions: PricingOptions;
    validatingAirlineCodes: string[];
    travelerPricings: TravelerPricing[];
  }
  
  export interface Itinerary {
    duration: string;
    segments: Segment[];
  }
  
  export interface Segment {
    departure: Terminal;
    arrival: Terminal;
    carrierCode: string;
    number: string;
    aircraft: {
      code: string;
    };
    operating: {
      carrierCode: string;
    };
    duration: string;
    id: string;
    numberOfStops: number;
    blacklistedInEU: boolean;
  }
  
  export interface Terminal {
    iataCode: string;
    terminal?: string;
    at: string;
  }
  
  export interface Price {
    currency: string;
    total: string;
    base: string;
    fees: Fee[];
    grandTotal: string;
  }
  
  export interface Fee {
    amount: string;
    type: string;
  }
  
  export interface PricingOptions {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  }
  
  export interface TravelerPricing {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: FareDetails[];
  }
  
  export interface FareDetails {
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags: {
      quantity: number;
    };
  }
  
  export interface FlightOffersResponse {
    meta: {
      count: number;
      links: {
        self: string;
      };
    };
    data: FlightOffer[];
    dictionaries?: {
      locations?: Record<string, {
        cityCode: string;
        countryCode: string;
      }>;
      aircraft?: Record<string, string>;
      currencies?: Record<string, string>;
      carriers?: Record<string, string>;
    };
  }