const Input = ({ type = "text", placeholder, className = "", ...props }) => {
  return (
    <input
      {...props}
      type={type}
      placeholder={placeholder}
      className={`bg-transparent border-b border-line text-black dark:text-white
      dark:placeholder-gray-400 focus:outline-none leading-[56px] px-2 w-full transition-colors ${className}`} />
  )
}
export default Input
