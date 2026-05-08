/**
 * Only applicable when PropertyType = RESIDENTIAL_HOUSE.
 * Replaces the old SINGLE_ROOM / DOUBLE_ROOM / HOUSE split.
 */
export enum ResidentialSubtype {
  SINGLE = 'SINGLE', // one bedroom / bedsitter
  DOUBLE = 'DOUBLE', // two bedrooms
}