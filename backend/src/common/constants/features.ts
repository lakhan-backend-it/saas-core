/** Canonical feature keys — keep in sync with seed + requireFeature() / usage. */
export const FEATURES = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  ADVANCED_REPORTS: 'advanced_reports',
  FILE_UPLOADS: 'file_uploads',
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];
