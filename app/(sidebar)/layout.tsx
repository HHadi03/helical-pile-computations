export default function SidebarLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      
        {children}
        {modal}
        
      
    </>
  )
}