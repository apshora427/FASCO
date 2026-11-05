import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { LuHeart, LuSearch, LuShoppingBag, LuUserRound } from "react-icons/lu"
import { UseStore } from "../context/StoreContext"
import { UseUser } from "../context/UserContext"

const ShopHeader = ({ onSearch }) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { cartCount, wishlistCount } = UseStore()
  const { currentUser } = UseUser()
  const navigate = useNavigate()
  const accountPath = currentUser?.role === "admin" ? "/admin" : "/account"
  const canAccessSavedItems = currentUser?.role === "user"

  const submitSearch = (event) => {
    event.preventDefault()
    if (onSearch) onSearch(query.trim())
    else navigate(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`)
    setSearchOpen(false)
  }

  return (
    <header className="header-shop lock-padding">
      <div className="header-shop__wrapper">
        <div className="header-shop__container">
          <div className="header-shop__body">
            <Link to="/" className="header-shop__logo">FASCO</Link>
            <div className="header-shop__menu menu">
              <nav className={`menu__body ${menuOpen ? "_active" : ""}`}>
                <ul className="menu__list menu__list--shop">
                  <li className="menu__item"><Link className="menu__link" to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                  <li className="menu__item"><Link className="menu__link _active" to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link></li>
                  <li className="menu__item"><Link className="menu__link" to="/shop" onClick={() => setMenuOpen(false)}>Products</Link></li>
                </ul>
              </nav>
            </div>
            <div className="header-shop__actions actions-header-shop">
              <div className={`actions-header-shop__search search-form ${searchOpen ? "_active" : ""}`}>
                <button
                  type="button"
                  className="search-form__icon"
                  aria-label="Search"
                  onClick={() => setSearchOpen((open) => !open)}
                >
                  <LuSearch size={20} aria-hidden="true" />
                </button>
                <form className="search-form__item" onSubmit={submitSearch}>
                  <button type="submit" className="search-form__btn" aria-label="Submit search">
                    <LuSearch size={18} aria-hidden="true" />
                  </button>
                  <input
                    autoComplete="off"
                    type="text"
                    name="search"
                    placeholder="Search"
                    className="search-form__input"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </form>
              </div>
              <Link
                to={currentUser ? accountPath : "/sign_up"}
                state={!currentUser ? { from: "/shop" } : undefined}
                aria-label={currentUser ? "Account" : "Sign up"}
                className={`actions-header-shop__item actions-header-shop__item_profile inline-flex items-center gap-2 ${currentUser ? "" : "whitespace-nowrap text-sm"}`}
              >
                {currentUser ? (
                  <LuUserRound size={20} aria-hidden="true" />
                ) : (
                  "Sign up"
                )}
              </Link>
              <Link
                to={canAccessSavedItems ? "/wishlist" : "/login"}
                state={!canAccessSavedItems ? { from: "/wishlist" } : undefined}
                aria-label={`Wishlist${canAccessSavedItems && wishlistCount ? `, ${wishlistCount} items` : ""}`}
                className="actions-header-shop__item actions-header-shop__item_favorites relative"
              >
                <LuHeart size={22} aria-hidden="true" />
                {canAccessSavedItems && wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff706b] px-1 text-[10px] leading-none text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <div className="actions-header-shop__item cart-header">
                <Link
                  to={canAccessSavedItems ? "/cart" : "/login"}
                  state={!canAccessSavedItems ? { from: "/cart" } : undefined}
                  aria-label={`Cart${canAccessSavedItems && cartCount ? `, ${cartCount} items` : ""}`}
                  className="cart-header__icon">
                  <LuShoppingBag size={22} aria-hidden="true" />
                  {canAccessSavedItems && cartCount > 0 && <span>{cartCount}</span>}
                </Link>
              </div>
            </div>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className={`icon-menu ${menuOpen ? "_active" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}>
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ShopHeader
