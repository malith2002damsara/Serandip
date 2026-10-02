import Title from '../components/Title';
import { assets } from '../assets/assets';
// import NewsletterBox from '../components/NewsletterBox';

const About = () => {
  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center pt-16 pb-8'>
          <Title text1={'ABOUT'} text2={'US'} />
          <div className='w-24 h-1 bg-black mx-auto mt-4'></div>
        </div>

        <div className="my-16 flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <img 
              src={assets.about_img} 
              alt="About CeylonWear" 
              className="w-full rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="lg:w-1/2 space-y-6">
            <div className="prose prose-lg text-gray-600 leading-relaxed space-y-4">
              <p className="text-lg">
                CeylonWear was born from a simple idea: Sri Lankan style deserves to be worn every day.
                Inspired by the island&apos;s vibrant batik, handloom traditions and tropical colours, we
                create and curate clothing for women, men and kids that is comfortable in our climate and
                proud of its roots.
              </p>
              <p className="text-lg">
                Our name says it all &ndash; <strong>Ceylon</strong> for our heritage and <strong>Wear</strong> for
                the everyday. We work with local designers and tailors, and every order is packed with care and
                delivered to your door anywhere in Sri Lanka, from Colombo to Jaffna, Kandy to Galle.
              </p>
            </div>
            <div className="border-l-4 border-black pl-6 bg-gray-50 p-6 rounded-r-lg">
              <h3 className='text-2xl font-bold text-gray-800 mb-3'>OUR MISSION</h3>
              <p className="text-gray-600 text-lg">
                To weave the spirit of Sri Lanka into modern fashion &ndash; offering quality clothing at fair
                prices while supporting local craftsmanship.
              </p>
            </div>
          </div>
        </div>

        <div className="py-16">
          <div className="text-center mb-12">
            <Title text1={'WHY'} text2={'CHOOSE US'} />
            <div className='w-24 h-1 bg-black mx-auto mt-4'></div>
          </div>
           
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-200 hover:border-black transition-colors duration-300 p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-center mb-4">Quality Assurance</h4>
              <p className='text-gray-600 text-center leading-relaxed'>Every piece is checked for fabric, stitching and colour before it leaves our store, so you receive clothing you can trust.</p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 hover:border-black transition-colors duration-300 p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-center mb-4">Convenience</h4>
              <p className='text-gray-600 text-center leading-relaxed'>Easy online shopping, secure payments in LKR and island-wide delivery &ndash; fashion that comes to you, wherever you are in Sri Lanka.</p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 hover:border-black transition-colors duration-300 p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-center mb-4">Customer Service</h4>
              <p className='text-gray-600 text-center leading-relaxed'>Our friendly Sri Lankan team is here to help with sizes, orders and exchanges. Reach us by phone, email or WhatsApp.</p>
            </div>
          </div>
        </div>
                 
        <div className="pb-16">
          {/* <NewsletterBox/> */}
        </div>
      </div>
    </div>
  )
}

export default About