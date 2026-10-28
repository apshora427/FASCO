import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { products } from "../data/products";
import { UseUser } from "./UserContext";

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

  // reload the right history whenever the identity changes (login / logout / guest)
  useEffect(() => {
    setStore({
      key: identityKey,
      wishlistIds: readStorage(wishlistKey),
      cartItems: readStorage(cartKey),
    })
  }, [identityKey])

  // persist only when the current state actually belongs to this identity
  useEffect(() => {
    if (store.key !== identityKey) return
    writeStorage(wishlistKey, store.wishlistIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.wishlistIds, identityKey, store.key, wishlistKey])

  useEffect(() => {
    if (store.key !== identityKey) return
    writeStorage(cartKey, store.cartItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.cartItems, identityKey, store.key, cartKey])

  const { wishlistIds, cartItems } = store

  // rehydrate full products from the data layer (replaced by the API later)
  const wishlist = wishlistIds.map((id) => products.find((p) => p.id === id)).filter(Boolean)
  const cart = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.id)
      return product ? { ...product, quantity: item.quantity, size: item.size, color: item.color } : null
    })
    .filter(Boolean)

  const toggleWishlist = (product) => {
    if (!product) return
    const exists = wishlistIds.includes(product.id)
    setStore((prev) => ({
      ...prev,
      wishlistIds: prev.wishlistIds.includes(product.id)
        ? prev.wishlistIds.filter((id) => id !== product.id)
        : [...prev.wishlistIds, product.id],
    }))
    toast.success(exists ? "Removed from wishlist" : "Added to wishlist")
  }

  const removeFromWishlist = (id) => {
    setStore((prev) => ({ ...prev, wishlistIds: prev.wishlistIds.filter((item) => item !== id) }))
  }

  // `variant` (size/colour chosen on the product page) rides along with the cart
  // line so the mini cart drawer can show exactly what was picked.
  const addToCart = (product, qty = 1, variant = {}) => {
    if (!product) return
    setStore((prev) => {
      const exists = prev.cartItems.find((item) => item.id === product.id)
      if (exists) {
        return {
          ...prev,
          cartItems: prev.cartItems.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + qty, ...variant } : item
          ),
        }
      }
      return { ...prev, cartItems: [...prev.cartItems, { id: product.id, quantity: qty, ...variant }] }
    })
    toast.success("Added to cart")
    // quick-view drawer slides in after every add (product page, wishlist moves, …)
    window.dispatchEvent(new CustomEvent("fasco:minicart:open"))
  }

  const moveToCart = (product) => {
    if (!product) return
    addToCart(product)
    removeFromWishlist(product.id)
  }

  const moveAllToCart = () => {
    if (wishlistIds.length === 0) {
      toast.info("Your wishlist is empty")
      return
    }
    setStore((prev) => {
      const merged = [...prev.cartItems]
      prev.wishlistIds.forEach((id) => {
        const index = merged.findIndex((item) => item.id === id)
        if (index !== -1) {
          merged[index] = { ...merged[index], quantity: merged[index].quantity + 1 }
        } else {
          merged.push({ id, quantity: 1 })
        }
      })
      return { ...prev, cartItems: merged, wishlistIds: [] }
    })
    toast.success("Moved all items to cart")
  }

  const removeFromCart = (id) => {
    setStore((prev) => ({ ...prev, cartItems: prev.cartItems.filter((item) => item.id !== id) }))
  }

  const updateQuantity = (id, qty) => {
    setStore((prev) => ({
      ...prev,
      cartItems: prev.cartItems.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, qty) } : item)),
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
