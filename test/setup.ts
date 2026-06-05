// BigInt serialization support for e2e tests
// This mirrors the setup in src/main.ts for production
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
