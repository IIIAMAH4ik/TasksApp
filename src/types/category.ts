export type CategoryKey =
  | 'work'
  | 'sport'
  | 'study'
  | 'food'
  | 'health'
  | 'prayer'
  | string;

export type Category = {
  key: CategoryKey;
  name: string;
  color: string;
  isDefault: boolean;
};