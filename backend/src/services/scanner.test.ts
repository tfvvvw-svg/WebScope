import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectTechnologies } from "./scanner.js";

describe("detectTechnologies", () => {
  it("does not flag Angular from plain prose", () => {
    const result = detectTechnologies(
      "<html><body><p>This page mentions the word angular in a sentence.</p></body></html>",
      {},
    );

    assert.equal(
      result.includes("Angular"),
      false,
    );
  });

  it("does not flag Shopify from plain prose", () => {
    const result = detectTechnologies(
      "<html><body><p>This page mentions shopify in an example sentence.</p></body></html>",
      {},
    );

    assert.equal(
      result.includes("Shopify"),
      false,
    );
  });

  it("detects Angular from Angular-specific markers", () => {
    const result = detectTechnologies(
      '<html><body><div ng-app="app"></div><script src="/angular.min.js"></script></body></html>',
      {},
    );

    assert.equal(
      result.includes("Angular"),
      true,
    );
  });

  it("detects Shopify from Shopify storefront markers", () => {
    const result = detectTechnologies(
      '<html><body><script src="https://cdn.shopify.com/s/files/1/0000/0000/t/1/assets/theme.js"></script><div id="shopify-section-header"></div></body></html>',
      {},
    );

    assert.equal(
      result.includes("Shopify"),
      true,
    );
  });
});
