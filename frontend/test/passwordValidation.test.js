import assert from "node:assert/strict"
import { test } from "node:test"
import { isStrongPassword } from "../src/utils/passwordValidation.js"

test("accepts browser-generated passwords longer than twelve characters", () => {
  assert.equal(isStrongPassword("G00gle_Suggested-Strong!9"), true)
})

test("rejects passwords that are weak, too short, too long, or contain spaces", () => {
  assert.equal(isStrongPassword("Abcdef12"), false)
  assert.equal(isStrongPassword("Ab1!xyz"), false)
  assert.equal(isStrongPassword(`A1!${"a".repeat(70)}`), false)
  assert.equal(isStrongPassword("Strong Password1!"), false)
})
