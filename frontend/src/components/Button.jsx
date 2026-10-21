const Button = ({ TagName = "button", children, className = "", type = "button", ...prop }) => {
  return (
    <TagName
      {...prop}
      type={type}
      className={`rounded-[4px] leading-[56px] bg-primary text-white text-center px-3 cursor-pointer ${className}`}>
      {children}
    </TagName>
  )
}
export default Button
