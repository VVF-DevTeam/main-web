import Footer from './_components/footer'
import Navbar from './_components/navbar'
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative h-full min-h-screen w-full bg-[#EFB9A2]/20">

      <div>
        <Navbar />
      </div>
      <div className="min-h-screen">{children}</div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}

export default Layout
