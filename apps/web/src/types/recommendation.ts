/** Response POST /ai/recommendation — docs/07-api-specification.md. */
export interface Recommendation {
  compatibilityScore: number;
  recommendedPreset: {
    id: string;
    name: string;
  };
  reason: string;
  alternatives: {
    id: string;
    name: string;
    compatibilityScore: number;
  }[];
}
