import { useState } from "react"
import { Link, useNavigate } from "react-router"
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
                  className="search-form__icon _icon-search"
                  aria-label="Search"
                  onClick={() => setSearchOpen((open) => !open)}
                />
                <form className="search-form__item" onSubmit={submitSearch}>
                  <button type="submit" className="search-form__btn _icon-search" aria-label="Submit search" />
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
                to={currentUser ? accountPath : "/login"}
                state={!currentUser ? { from: "/account" } : undefined}
                aria-label="Account"
                className="actions-header-shop__item actions-header-shop__item_profile _icon-profile"
              />
              <Link
                to={currentUser ? "/wishlist" : "/login"}
                state={!currentUser ? { from: "/wishlist" } : undefined}
                aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
                className="actions-header-shop__item actions-header-shop__item_favorites _icon-favorite"
              >
                {wishlistCount > 0 && <span className="ml-1 rounded-full bg-[#ff706b] px-1 text-[10px] text-white">{wishlistCount}</span>}
              </Link>
              <div className="actions-header-shop__item cart-header">
                <Link to="/cart" aria-label="Cart" className="cart-header__icon _icon-shopCart">
                  {cartCount > 0 && <span>{cartCount}</span>}
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
