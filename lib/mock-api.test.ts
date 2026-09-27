import { describe, expect, it } from "vitest";

import { parseStreamListResponse, parseStreamView } from "./api-schema";
import { mockGetStream, mockListStreams } from "./mock-api";

describe("mock API", () => {
  it("returns responses matching the API response types", () => {
    const page = mockListStreams();
    expect(() => parseStreamListResponse(page)).not.toThrow();
    expect(parseStreamListResponse(page)).toEqual(page);

    for (const stream of page.streams) {
      expect(() => parseStreamView(stream)).not.toThrow();
    }

    const first = page.streams[0];
    const single = mockGetStream(first.id);
    expect(single).not.toBeNull();
    expect(() => parseStreamView(single)).not.toThrow();
    expect(single).toEqual(first);
  });

  it("covers more than one stream status", () => {
    const statuses = new Set(mockListStreams().streams.map((s) => s.status));
    expect(statuses.size).toBeGreaterThan(1);
    expect(statuses.has("streaming")).toBe(true);
    expect(mockListStreams({ status: "streaming" }).streams.length).toBeGreaterThan(0);
    expect(mockListStreams({ status: "pending" }).streams.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown stream id", () => {
    expect(mockGetStream("does-not-exist")).toBeNull();
  });
});
