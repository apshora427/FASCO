const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const parseSearch = (value) => {
  let text = normalizeSearchText(value)
  let minPrice = null
  let maxPrice = null
  let availability = null

  const between = text.match(/(?:between\s+)?\$?(\d+(?:\.\d+)?)\s*(?:-|to|and)\s*\$?(\d+(?:\.\d+)?)/)
  if (between) {
    minPrice = Number(between[1])
    maxPrice = Number(between[2])
    text = text.replace(between[0], " ")
  }

  const under = text.match(/(?:under|below|less than|up to|max(?:imum)?)\s*\$?(\d+(?:\.\d+)?)/)
  if (under) {
    maxPrice = Number(under[1])
    text = text.replace(under[0], " ")
  }

  const over = text.match(/(?:over|above|more than|at least)\s*\$?(\d+(?:\.\d+)?)/)
  if (over) {
    minPrice = Number(over[1])
    text = text.replace(over[0], " ")
  }

  if (/\bout of stock\b|\bunavailable\b/.test(text)) {
    availability = "out-of-stock"
    text = text.replace(/\bout of stock\b|\bunavailable\b/g, " ")
  } else if (/\bin stock\b|\bavailable\b/.test(text)) {
    availability = "in-stock"
    text = text.replace(/\bin stock\b|\bavailable\b/g, " ")
  }

  return {
    terms: text.split(/\s+/).filter(Boolean),
    minPrice,
    maxPrice,
    availability,
  }
}

export const productMatchesSearch = (product, search) => {
  const parsed = parseSearch(search)
  if (parsed.minPrice !== null && product.price < parsed.minPrice) return false
  if (parsed.maxPrice !== null && product.price > parsed.maxPrice) return false
  if (parsed.availability === "in-stock" && product.stock <= 0) return false
  if (parsed.availability === "out-of-stock" && product.stock > 0) return false

  const searchableText = normalizeSearchText([
    product.title,
    product.brand,
    product.category,
    product.tag,
    product.discount,
    product.sizes?.join(" "),
    product.colors?.join(" "),
  ].filter(Boolean).join(" "))
  return parsed.terms.every((term) => searchableText.includes(term))
}
