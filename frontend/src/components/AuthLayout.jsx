import { Link } from "react-router"

const AuthLayout = ({ variant, image, children }) => (
  <div className="fasco-ref">
    <main className="page">
      <section className={`page__sign sign _${variant}`}>
        <div className="sign__container">
          <div className="sign__image">
            <img src={image} alt="" />
          </div>
          <div className="sign__body">
            <Link to="/" className="sign__logo">FASCO</Link>
            {children}
            <div className="sign__terms">
              <a href="#">FASCO Terms &amp; Codnitions</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
)

export default AuthLayout
