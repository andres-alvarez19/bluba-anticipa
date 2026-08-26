import assert from "node:assert/strict";
import test from "node:test";

test("keeps insufficient data distinct from risk levels", () => {
  const prediction = {
    status: "insufficient_data",
    risk: null
  };

  assert.equal(prediction.status, "insufficient_data");
  assert.equal(prediction.risk, null);
});
