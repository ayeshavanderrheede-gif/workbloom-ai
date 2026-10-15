import { describe, expect, it } from "vitest";
import { validateEmail, validatePlanner } from "@/lib/validation";

describe("validation", () => {
  it("planner asks for a time estimate on every named task before generating", () => {
    const e = validatePlanner({
      mode: "daily",
      dates: "Mon",
      hours: "9-5",
      commitments: "",
      tasks: [{ name: "Report", deadline: "", duration: "", priority: "high" }],
    });
    expect(e["duration-0"]).toBeDefined();
  });
  it("email requires recipient relationship and tone", () => {
    const e = validateEmail({ recipientName: "", relationship: "", purpose: "x", details: "", tone: "", senderName: "" });
    expect(Object.keys(e).sort()).toEqual(["relationship", "tone"]);
  });
});
