export enum PropertyType {
  RESIDENTIAL_HOUSE = 'RESIDENTIAL_HOUSE', // single or double — see ResidentialSubtype
  APARTMENT         = 'APARTMENT',
  AIRBNB            = 'AIRBNB',
  OFFICE_SPACE      = 'OFFICE_SPACE',
  BUSINESS_SPACE    = 'BUSINESS_SPACE',
  HOSTEL            = 'HOSTEL',            // sub-units managed via HostelRooms module
  HOTEL_LODGE       = 'HOTEL_LODGE',       // charged daily or monthly
}