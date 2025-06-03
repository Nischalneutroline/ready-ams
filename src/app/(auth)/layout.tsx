import React from "react"
import AuthFeature from "./_component/auth-feature-section"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <AuthFeature />
      {/* <div>{children}</div> */}
    </>
  )
}

export default Layout
