const OutlineButton = ({ TagName = "button", children, className = "", type = "button", ...prop }) => {
  return (
    <TagName
      {...prop}
      type={type}
      className={`flex justify-center gap-[16px] items-center px-[86px]
      rounded-[4px] leading-[56px] bg-transparent text-black dark:text-white
      cursor-pointer border border-line hover:bg-muted transition-colors ${className}`}>
      {children}
    </TagName>
  )
}
export default OutlineButton
