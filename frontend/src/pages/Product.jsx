import  { useContext, useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import {assets} from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts';


const Product = () => {

const {productId}=useParams();
//console.log(productId);
const {products,currency,addToCart} =useContext(ShopContext);
const [productData,setProductData]=useState(false);
const [image,setImage]=useState('')
const [size,setSize]=useState('');

const fetchProductData = useCallback(async()=>{
    products.map((item)=>{
      if(item._id==productId){
        setProductData(item)
        setImage(item.image[0])
        // console.log(item);
        return null;
      }
    })
}, [products, productId]);

useEffect(()=>{
  fetchProductData();
},[fetchProductData])



  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>

      {/* ------------------product data ------------------------ */}
      
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
      
          {/* product --------------------------------     images */}
      
          <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row px-5 ">
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full ">
           {
            productData.image.map((item,index)=>(
              <img onClick={()=>setImage(item)} src={item} key={index} alt="" className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer" />
            ))
           }

            </div>
            <div className="w-full sm:w-[80%]">
              <img  src={image} alt="" className="w-full h-auto" />
            </div>
          </div>

{/* -------------product info -------------------------- */}

<div className="flex-1 px-5">
  <h1 className="font-medium text-2xl mt-2">
{productData.name}
  </h1>
  <div className="flex items-center gap-1 mt-2">
    <img src={assets.star_icon} alt="" className="w-3 5" />
    <img src={assets.star_icon} alt="" className="w-3 5" />
    <img src={assets.star_icon} alt="" className="w-3 5" />
    <img src={assets.star_icon} alt="" className="w-3 5" />
    <img src={assets.star_dull_icon} alt="" className="w-3 5" />
    <p className="pl-2">(122)</p>
  </div>
  <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
  <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
  <div className="flex flex-col gap-4 my-8">
    <p>Select Size</p>
    <div className="flex gap-2">
      {productData.sizes.map((item,index)=>(

         <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item==size ? 'border-orange-500' : ''}`} key={index}>{item} </button>

      ))}
    </div>
  </div>
  <button onClick={()=>addToCart(productData._id,size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
  <hr className="mt-8 sm:w-4/5" />
  <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
    <p>100% original product.</p>
    <p>cash on delivery is available policy within 7 days.</p>
    <p>Easy return and exchange policy </p>
  </div>
</div>

      </div>
      {/* ---------------Descrption & Review Section -------------------- */}
        
        <div className="mt-20 px-5">
          <div className="flex">
           <p className="border px-5 py-3 text-sm">Reviews (122)</p>
          </div>
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>Reverse Hash Lookup tries to reveal the original plaintext messages from specified hash values of
several cryptographic hash functions. Online Reverse Hash Lookup Tools works with several online
databases containing millions of hash values as well as engines using rainbow tables that can retrieve
the plaintext messages in more sophisticated wa</p>
<p>This issue can be solved with salting. A salt randomizes each hash by adding random data that is
unique to each user to their plaintext hash, so even the same plaintext has a unique hash. If someone
tried to compare hashes in a database, none of the hashes would match, even if the passwords were
the same</p>
          </div>
        </div>

        {/* -------------display related products ---------------- */}

        <RelatedProducts category={productData.category} subCategory={productData.subcategory}/>

    </div>
  ) : <div className="opacity-0"></div>
}

export default Product