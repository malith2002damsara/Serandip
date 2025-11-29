import jwt from 'jsonwebtoken'

const authUser = async (req,res,next)=>{
  const { token } = req.headers;

  console.log('Auth Middleware - Token received:', token ? 'yes' : 'no');
  console.log('Auth Middleware - JWT_SECRET:', process.env.JWT_SECRET ? 'configured' : 'missing');

  if(!token){
    console.log('Auth Middleware - No token provided');
    return res.status(401).json({success:false,message:"No token provided. Please login."})
  }

  try{
    console.log('Auth Middleware - Attempting to verify token...');
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Auth Middleware - Token verified successfully, userId:', token_decode.id);
    req.body.userId = token_decode.id
    next()
  }catch(error){
    console.log('Auth Middleware - Token verification failed:', error.message);
    console.log('Auth Middleware - Error name:', error.name);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({success:false,message:"Invalid token. Please login again."})
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({success:false,message:"Token expired. Please login again."})
    }
    return res.status(401).json({success:false,message:"Authentication failed. Please login again."})
  }

}

export default authUser