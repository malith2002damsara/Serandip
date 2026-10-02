import Title from '../components/Title'
import {assets} from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-16 pb-8">
          <Title text1={'CONTACT'} text2={'US'} />
          <div className='w-24 h-1 bg-black mx-auto mt-4'></div>
          <p className="text-gray-600 mt-4 text-lg">Get in touch with the CeylonWear team for any queries, orders or support</p>
        </div>
        
        <div className="my-16 flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/2">
            <img 
              src={assets.contact_img} 
              alt="Contact CeylonWear" 
              className="w-full rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-transform duration-500" 
            />
          </div>
          
          <div className="lg:w-1/2 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 00-2-2H8a2 2 0 00-2 2v9m8 0V9a2 2 0 012-2h2a2 2 0 012 2v12m-6 0h2m-2 0h-2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">OUR STORE</h3>
              </div>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-lg">CeylonWear Store<br />Colombo, Sri Lanka</p>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-lg">+94 77 627 0882 (Call / WhatsApp)</p>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg">malithdamsara76@gmail.com</p>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg">Mon &ndash; Sat: 9.00 AM &ndash; 6.00 PM (Sri Lanka Time)</p>
                </div>
              </div>
            </div>

            {/* <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Careers at CeylonWear</h3>
              </div>
              <p className="text-gray-600 text-lg mb-6">Join the CeylonWear family and help us bring Sri Lankan fashion to the world. We&apos;re always looking for talented designers, tailors and sales staff.</p>
              <button className='bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl'>
                Explore Jobs
              </button>
            </div> */}
          </div>
        </div>
        
        <div className="pb-16">
          <NewsletterBox/>
        </div>
      </div>
    </div>
  )
}

export default Contact