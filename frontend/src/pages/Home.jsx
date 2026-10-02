import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
// import NewsletterBox from '../components/NewsletterBox'

const Home = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section - Full width without horizontal padding */}
      <div className='w-full'>
        <Hero/>
      </div>
      
      {/* Content sections with responsive padding and spacing */}
      <div className='px-3 sm:px-6 lg:px-8 xl:px-12 max-w-8xl mx-auto'>
        <div className='space-y-12 sm:space-y-16 lg:space-y-20 py-8 sm:py-12 lg:py-16'>
          {/* Welcome / Sri Lanka intro */}
          <section className='text-center max-w-3xl mx-auto px-2'>
            <p className='text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-500 mb-3'>
              Threads of Sri Lanka
            </p>
            <h2 className='prata-regular text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4'>
              Welcome to CeylonWear
            </h2>
            <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
              From colourful batik to comfortable everyday wear, CeylonWear brings Sri Lankan style
              to your wardrobe. Shop the latest fashion with island-wide delivery and prices in LKR.
            </p>
            <div className='mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700'>
              <div className='bg-white border rounded-xl py-4 px-3 shadow-sm'>🇱🇰 Island-wide delivery</div>
              <div className='bg-white border rounded-xl py-4 px-3 shadow-sm'>🧵 Batik &amp; local style</div>
              <div className='bg-white border rounded-xl py-4 px-3 shadow-sm'>💳 Secure payments in LKR</div>
            </div>
          </section>
          <LatestCollection/>
          <BestSeller/>
          <OurPolicy/>
          {/* <NewsletterBox/> */}
        </div>
      </div>
    </div>
  )
}

export default Home