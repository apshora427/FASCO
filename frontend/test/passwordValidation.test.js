import assert from "node:assert/strict"
import { test } from "node:test"
import { isStrongPassword } from "../src/utils/passwordValidation.js"

test("accepts browser-generated passwords longer than twelve characters", () => {
  assert.equal(isStrongPassword("G00gle_Suggested-Strong!9"), true)
  assert.equal(isStrongPassword("A8vK2sM9qR4xW7pB"), true)
  assert.equal(isStrongPassword("Strong Password1!"), true)
})

test("rejects passwords that are too short or exceed bcrypt's byte limit", () => {
  assert.equal(isStrongPassword("Abcdef12"), true)
  assert.equal(isStrongPassword("Ab1!xyz"), false)
  assert.equal(isStrongPassword("A".repeat(73)), false)
})
