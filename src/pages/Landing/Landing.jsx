import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/Hero/Hero'
import Features from '../../components/Features/Features'
import AIFeatures from '../../components/AIFeatures/AIFeatures'
import WhyChoose from '../../components/WhyChoose/WhyChoose'
import About from '../../components/About/About'
import Contact from '../../components/Contact/Contact'
import Footer from '../../components/Footer/Footer'

function Landing() {
  useScrollAnimation()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AIFeatures />
        <WhyChoose />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default Landing
