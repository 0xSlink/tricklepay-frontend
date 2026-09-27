import { describe, expect, it } from "vitest";

import type { FormDraft } from "@/types/form";

import { validateCreateStreamForm } from "./create-stream-validation";

const validDraft: FormDraft = {
  recipient: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
  token: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
  amount: "12.5",
  start: "2026-08-27T10:00",
  end: "2026-08-27T12:00",
  cliff: "",
};

describe("validateCreateStreamForm", () => {
  it("accepts a complete valid form", () => {
    expect(validateCreateStreamForm(validDraft)).toEqual({
      recipient: undefined,
      token: undefined,
      amount: undefined,
      start: undefined,
      end: undefined,
      cliff: undefined,
    });
  });

  it("returns the existing messages for required values and date ordering", () => {
    expect(validateCreateStreamForm({ ...validDraft, amount: "", start: "", end: "" })).toMatchObject({
      amount: "Amount is required.",
      start: "Start date is required.",
      end: "End date is required.",
    });
    expect(validateCreateStreamForm({ ...validDraft, end: validDraft.start })).toMatchObject({
      end: "End must be after start.",
    });
  });

  it("rejects an end time before the start", () => {
    expect(
      validateCreateStreamForm({
        ...validDraft,
        start: "2026-08-27T12:00",
        end: "2026-08-27T10:00",
      }),
    ).toMatchObject({
      end: "End must be after start.",
    });
  });

  it("rejects a cliff outside the window", () => {
    expect(validateCreateStreamForm({ ...validDraft, cliff: "2026-08-27T09:00" })).toMatchObject({
      cliff: "Cliff must fall between start and end.",
    });
    expect(validateCreateStreamForm({ ...validDraft, cliff: "2026-08-27T13:00" })).toMatchObject({
      cliff: "Cliff must fall between start and end.",
    });
  });
});
