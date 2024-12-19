import Footer from './_components/footer'
import Header from './_components/header'
import Navbar from './_components/navbar'
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full bg-[#EFB9A2]/20">
      <div>
        <Header />
      </div>
      <div>
        <Navbar />
      </div>
      <div>{children}</div>
      <div>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
