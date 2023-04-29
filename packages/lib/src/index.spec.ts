import { expect } from "chai"
import "mocha"

describe("This", () => {
  describe("should", () => {
    it("always pass", () => {
      expect(true).to.equal(true)
    })
  })
})

describe("This", () => {
  describe("should", () => {
    it("always equal 42", () => {
      expect(21 + 21).to.equal(42)
    })
  })
})
