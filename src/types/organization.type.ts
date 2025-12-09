import type { LocalizedString } from './i18n.type';

export type OrganizationType =
  | 'cooperativa'
  | 'comite'
  | 'asociacion'
  | 'grupo'
  | 'otro';

export interface OrganizationMeta {
  orgType?: OrganizationType;
  scope?: LocalizedString;
  contactPerson?: string;
  meetingSchedule?: LocalizedString;
}
