export type TrackId = string;

export interface Track {
  id: TrackId;
  name: string;
  src: File | string; // local file or URL
  duration?: number;
}
