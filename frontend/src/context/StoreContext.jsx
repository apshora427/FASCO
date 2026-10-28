import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { products, resolveImage } from "../data/products";
import { UseUser } from "./UserContext";
import { getProducts, getWishlist, saveWishlist } from "../api/backend";

export const StoreContext = createContext()

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]")
  } catch {
    return []
  }
}

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable — keep the session working in memory
  }
}

const StoreProvider = ({ children }) => {
  const { currentUser, isGuest } = UseUser()
  const [catalog, setCatalog] = useState(products)
  const [wishlistReadyFor, setWishlistReadyFor] = useState("")
  const wishlistQueue = useRef(Promise.resolve())
  const storeRef = useRef(null)

  // each identity keeps its own history — a logged-in account gets its own cart &
  // wishlist, a fresh account starts empty, and guests get a separate guest basket
  const identityKey = currentUser?.email || (isGuest ? "guest" : "anonymous")
  const wishlistKey = `fasco_wishlist_${identityKey}`
  const cartKey = `fasco_cart_${identityKey}`

  // single state object tagged with the identity it was loaded for — this prevents
  // a stale cart/wishlist from ever being saved under a different user's key
  const [store, setStore] = useState({
    key: identityKey,
    wishlistIds: readStorage(wishlistKey),
    cartItems: readStorage(cartKey),
  })
  storeRef.current = store
  const userId = currentUser?.id || currentUser?._id || ""

  // reload the right history whenever the identity changes (login / logout / guest)
  useEffect(() => {
    setStore({
      key: identityKey,
      wishlistIds: readStorage(wishlistKey),
      cartItems: readStorage(cartKey),
    })
  }, [identityKey, wishlistKey, cartKey])

  useEffect(() => {
    setWishlistReadyFor("")
    if (!userId) return undefined
    let active = true
    const syncInitialWishlist = async () => {
      const response = await getWishlist()
      if (!active) return
      if (!response?.success || !Array.isArray(response.wishlistIds)) {
        console.warn("[wishlist] Could not load the account wishlist; keeping the browser copy")
        setWishlistReadyFor(userId)
        return
      }
      const localIds = storeRef.current?.key === identityKey ? storeRef.current.wishlistIds : []
      const wishlistIds = [...new Set([...response.wishlistIds, ...localIds])]
      setStore((previous) => ({
        ...previous,
        key: identityKey,
        wishlistIds,
      }))
      const saved = await saveWishlist(wishlistIds)
      if (!saved?.success) {
        console.warn("[wishlist] Could not sync local wishlist to the account");
      }
      if (active) setWishlistReadyFor(userId)
    }
    syncInitialWishlist()
    return () => { active = false }
  }, [identityKey, userId])

  useEffect(() => {
    const migrateAccountData = (event) => {
      const { oldEmail, newEmail } = event.detail || {}
      if (!oldEmail || !newEmail || oldEmail === newEmail) return
      const oldWishlistKey = `fasco_wishlist_${oldEmail}`
      const oldCartKey = `fasco_cart_${oldEmail}`
      const newWishlistKey = `fasco_wishlist_${newEmail}`
      const newCartKey = `fasco_cart_${newEmail}`
      let wishlistIds = readStorage(oldWishlistKey)
      let cartItems = readStorage(oldCartKey)
      try {
        const existingWishlist = localStorage.getItem(newWishlistKey)
        const existingCart = localStorage.getItem(newCartKey)
        if (existingWishlist !== null) wishlistIds = readStorage(newWishlistKey)
        else writeStorage(newWishlistKey, wishlistIds)
        if (existingCart !== null) cartItems = readStorage(newCartKey)
        else writeStorage(newCartKey, cartItems)
        localStorage.removeItem(oldWishlistKey)
        localStorage.removeItem(oldCartKey)
      } catch {
        // The account remains valid even when browser storage is unavailable.
      }
      setStore({ key: newEmail, wishlistIds, cartItems })
    }
    window.addEventListener("fasco:account:email-changed", migrateAccountData)
    return () => window.removeEventListener("fasco:account:email-changed", migrateAccountData)
  }, [])

  // persist only when the current state actually belongs to this identity
  useEffect(() => {
    if (store.key !== identityKey) return
    writeStorage(wishlistKey, store.wishlistIds)
  }, [store.wishlistIds, identityKey, store.key, wishlistKey])

  useEffect(() => {
    if (store.key !== identityKey) return
    writeStorage(cartKey, store.cartItems)
  }, [store.cartItems, identityKey, store.key, cartKey])

  const { wishlistIds, cartItems } = store

  const requireAccount = () => {
    if (currentUser) return true
    window.dispatchEvent(new CustomEvent("fasco:auth:required", {
      detail: { from: `${window.location.pathname}${window.location.search}${window.location.hash}` },
    }))
    return false
  }

  useEffect(() => {
    if (cartItems.length === 0 && wishlistIds.length === 0) return
    let active = true
    const refreshCatalog = async () => {
      const items = await getProducts()
      if (!active || !Array.isArray(items)) return
      setCatalog(items.map((item) => ({
        ...item,
        image: resolveImage(item.image),
        images: Array.isArray(item.images) ? item.images.map(resolveImage) : [],
      })))
    }
    const onCatalogUpdated = () => refreshCatalog()
    refreshCatalog()
    window.addEventListener("fasco:catalog:updated", onCatalogUpdated)
    return () => {
      active = false
      window.removeEventListener("fasco:catalog:updated", onCatalogUpdated)
    }
  }, [cartItems.length, wishlistIds.length])

  // Rehydrate stored cart and wishlist ids against the live catalogue.
  const wishlist = wishlistIds.map((id) => catalog.find((p) => p.id === id)).filter(Boolean)
  const cart = cartItems
    .map((item) => {
      const product = catalog.find((p) => p.id === item.id)
      return product ? { ...product, quantity: item.quantity, size: item.size, color: item.color } : null
    })
    .filter(Boolean)

  const getLineKey = (item) => JSON.stringify([item.id, item.size || "", item.color || ""])

  const syncWishlist = (ids) => {
    if (!userId || wishlistReadyFor !== userId) return
    wishlistQueue.current = wishlistQueue.current
      .catch(() => undefined)
      .then(async () => {
        const response = await saveWishlist(ids)
        if (!response?.success) {
          console.warn("[wishlist] Account sync failed; the browser copy is retained");
          toast.error("Wishlist saved on this device, but account sync failed")
        }
      })
  }

  const toggleWishlist = (product) => {
    if (!product) return
    if (!requireAccount()) return
    const exists = wishlistIds.includes(product.id)
    const nextIds = exists
      ? wishlistIds.filter((id) => id !== product.id)
      : [...wishlistIds, product.id]
    setStore((prev) => ({
      ...prev,
      wishlistIds: nextIds,
    }))
    syncWishlist(nextIds)
    toast.success(exists ? "Removed from wishlist" : "Added to wishlist")
  }

  const removeFromWishlist = (id) => {
    const nextIds = wishlistIds.filter((item) => item !== id)
    setStore((prev) => ({ ...prev, wishlistIds: nextIds }))
    syncWishlist(nextIds)
  }

  // `variant` (size/colour chosen on the product page) rides along with the cart
  // line so the mini cart drawer can show exactly what was picked.
  const addToCart = (product, qty = 1, variant = {}) => {
    if (!product) return
    if (!requireAccount()) return false
    if (!Number.isSafeInteger(qty) || qty < 1) {
      toast.error("Choose a valid item quantity")
      return false
    }
    const stock = Number.isSafeInteger(product.stock) ? product.stock : Number.POSITIVE_INFINITY
    const key = getLineKey({ id: product.id, ...variant })
    const totalQuantity = cartItems
      .filter((item) => item.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (stock <= 0) {
      toast.error("This product is out of stock")
      return false
    }
    if (totalQuantity + qty > stock) {
      toast.error(`Only ${Math.max(0, stock - totalQuantity)} more available`)
      return false
    }
    const catalogProduct = {
      ...product,
      image: resolveImage(product.image),
      images: Array.isArray(product.images) ? product.images.map(resolveImage) : [],
    }
    setCatalog((current) => [
      ...current.filter((item) => item.id !== product.id),
      catalogProduct,
    ])
    setStore((prev) => {
      const exists = prev.cartItems.find((item) => getLineKey(item) === key)
      if (exists) {
        return {
          ...prev,
          cartItems: prev.cartItems.map((item) =>
            getLineKey(item) === key ? { ...item, quantity: item.quantity + qty, ...variant } : item
          ),
        }
      }
      return { ...prev, cartItems: [...prev.cartItems, { id: product.id, quantity: qty, ...variant }] }
    })
    toast.success("Added to cart")
    // quick-view drawer slides in after every add (product page, wishlist moves, …)
    window.dispatchEvent(new CustomEvent("fasco:minicart:open"))
    return true
  }

  const moveToCart = (product) => {
    if (!product) return
    if (addToCart(product)) removeFromWishlist(product.id)
  }

  const moveAllToCart = () => {
    if (!requireAccount()) return
    if (wishlistIds.length === 0) {
      toast.info("Your wishlist is empty")
      return
    }
    let merged = [...cartItems]
    const movedIds = []
    wishlistIds.forEach((id) => {
      const product = catalog.find((item) => item.id === id)
      if (!product) return
      const stock = Number.isSafeInteger(product.stock) ? product.stock : Number.POSITIVE_INFINITY
      const index = merged.findIndex((item) => item.id === id && !item.size && !item.color)
      const totalQuantity = merged
        .filter((item) => item.id === id)
        .reduce((sum, item) => sum + item.quantity, 0)
      if (totalQuantity >= stock) return
      const quantity = index === -1 ? 0 : merged[index].quantity
      if (index === -1) merged.push({ id, quantity: 1 })
      else merged[index] = { ...merged[index], quantity: quantity + 1 }
      movedIds.push(id)
    })
    if (movedIds.length === 0) {
      toast.error("No wishlist items are available in stock")
      return
    }
    setStore((prev) => ({
      ...prev,
      cartItems: merged,
      wishlistIds: prev.wishlistIds.filter((id) => !movedIds.includes(id)),
    }))
    syncWishlist(wishlistIds.filter((id) => !movedIds.includes(id)))
    toast.success(`Moved ${movedIds.length} item${movedIds.length === 1 ? "" : "s"} to cart`)
  }

  const removeFromCart = (id, size = "", color = "") => {
    const key = getLineKey({ id, size, color })
    setStore((prev) => ({ ...prev, cartItems: prev.cartItems.filter((item) => getLineKey(item) !== key) }))
  }

  const updateQuantity = (id, qty, size = "", color = "") => {
    const key = getLineKey({ id, size, color })
    const product = catalog.find((item) => item.id === id)
    const max = Number.isSafeInteger(product?.stock) ? product.stock : Number.POSITIVE_INFINITY
    if (!Number.isSafeInteger(qty)) {
      toast.error("Choose a valid item quantity")
      return
    }
    const nextQuantity = Math.max(1, qty)
    const otherVariantsQuantity = cartItems
      .filter((item) => item.id === id && getLineKey(item) !== key)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (nextQuantity + otherVariantsQuantity > max) {
      toast.error(`Only ${Math.max(0, max - otherVariantsQuantity)} available`)
      return
    }
    setStore((prev) => ({
      ...prev,
      cartItems: prev.cartItems.map((item) =>
        getLineKey(item) === key ? { ...item, quantity: nextQuantity } : item
      ),
    }))
  }

  const clearCart = () => {
    setStore((prev) => ({ ...prev, cartItems: [] }))
  }

  const isInWishlist = (id) => wishlistIds.includes(id)

  const wishlistCount = wishlistIds.length
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <StoreContext.Provider
      value={{
        wishlist,
        cart,
        wishlistCount,
        cartCount,
        cartSubtotal,
        toggleWishlist,
        removeFromWishlist,
        addToCart,
        moveToCart,
        moveAllToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInWishlist,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
export default StoreProvider

export const UseStore = () => useContext(StoreContext)
