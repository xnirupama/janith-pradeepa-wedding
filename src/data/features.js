// Optional guest features have no backend yet and remain hidden by default.
export const guestFeatures = {
  seatingLookup: false,
  guestUploads: false,
};

/**
 * Future backend contract (no endpoint or guest data is fabricated):
 * SeatingLookupRequest: { event: "wedding" | "homecoming", guestName: string }
 * SeatingLookupResponse: { found: boolean, tableName?: string, seats?: number }
 * GuestUploadRequest: { event: "wedding" | "homecoming", guestName: string,
 *   files: Array<{ name: string, type: string, size: number }> }
 * GuestUploadResponse: { uploadId: string, uploadUrls: string[] }
 * A future upload service should return authorized, short-lived upload URLs.
 */
