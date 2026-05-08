/**
 * Describes the relationship between a Contact and a Property.
 * OWNER  — the person who owns the property.
 * AGENT  — a broker/agent managing the property on behalf of the owner.
 *
 * Set when creating the Contact record. A single contact can be both an
 * owner of some properties and an agent for others, but each individual
 * Contact record has one declared role.
 */
export enum ContactRole {
  OWNER = 'OWNER',
  AGENT = 'AGENT',
}