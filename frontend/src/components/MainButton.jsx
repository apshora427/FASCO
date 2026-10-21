import { Link } from 'react-router'

const MainButton = ({ text, className = "", to }) => {
  if (to) {
    return (
      <Link
        to={to}
        className={`py-[16px] px-[48px] font-Poppins font-medium text-[16px] leading-[24px] cursor-pointer inline-block ${className}`}>
        {text}
      </Link>
    )
  }
  return (
    <button className={`py-[16px] px-[48px] font-Poppins font-medium text-[16px] leading-[24px] cursor-pointer ${className}`}>{text}</button>
  )
}
export default MainButton
