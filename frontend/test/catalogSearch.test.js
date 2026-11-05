import assert from "node:assert/strict"
import { test } from "node:test"
import { productMatchesSearch } from "../src/utils/catalogSearch.js"

const product = {
  title: "Linen Shirt",
  brand: "FASCO",
  category: "Women",
  tag: "New Arrival",
  price: 45,
  stock: 8,
  sizes: ["S", "M"],
  colors: ["Blue", "White"],
}

test("searches across catalog details and accent/case differences", () => {
  assert.equal(productMatchesSearch(product, "fasco women blue m"), true)
  assert.equal(productMatchesSearch({ ...product, title: "Café Linen Shirt" }, "cafe"), true)
  assert.equal(productMatchesSearch(product, "black"), false)
})

test("combines keywords with natural price and stock filters", () => {
  assert.equal(productMatchesSearch(product, "blue shirt under $50 in stock"), true)
  assert.equal(productMatchesSearch(product, "linen between $40 and $50"), true)
  assert.equal(productMatchesSearch(product, "linen over $50"), false)
  assert.equal(productMatchesSearch(product, "linen out of stock"), false)
  assert.equal(productMatchesSearch({ ...product, stock: 0 }, "linen out of stock"), true)
})
