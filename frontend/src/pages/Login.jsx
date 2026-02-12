import { useEffect, useState, useContext } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from '../config/axiosConfig';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    return '';
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Minimum 8 characters';
    return '';
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return { level: score, text: 'Weak', color: 'text-red-500' };
    if (score < 5) return { level: score, text: 'Medium', color: 'text-yellow-500' };
    return { level: score, text: 'Strong', color: 'text-green-500' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate fields in real-time
    if (name === 'email') {
      setEmailError(validateEmail(value));
    } else if (name === 'password' && currentState === 'Sign Up') {
      setPasswordError(validatePassword(value));
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Final validation
    const emailErr = validateEmail(formData.email);
    const passwordErr = currentState === 'Sign Up' ? validatePassword(formData.password) : '';
    
    setEmailError(emailErr);
    if (currentState === 'Sign Up') setPasswordError(passwordErr);
    
    if (emailErr || passwordErr) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setIsLoading(true);
    try {
      const endpoint = currentState === 'Sign Up' ? '/register' : '/login';
      const payload = currentState === 'Sign Up' 
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };
      
      const response = await axios.post(`${backendUrl}/api/user${endpoint}`, payload);
      
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success(currentState === 'Login' ? 'Logged in successfully!' : 'Account created!');
      } else {
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex mt-10 justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
          {/* Header */}
          <div className="text-center mb-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentState}
              </h2>
              <div className="h-[2px] w-8 bg-gray-800"></div>
            </div>
            <p className="text-gray-600 text-sm">
              {currentState === 'Login' 
                ? 'Welcome back to Ceylon' 
                : 'Create your account'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-4">
            {/* Name Field - Only for Sign Up */}
            {currentState === 'Sign Up' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className={`w-full px-3 py-2 border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all`}
                placeholder="your@email.com"
                required
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-3 py-2 pr-10 border ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.536 8.464M14.12 14.12l1.415 1.415M14.12 14.12a3 3 0 01-4.243.007m6.02-4.127a10.05 10.05 0 01-1.563 3.029M21 3l-18 18"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {currentState === 'Sign Up' && formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span>Password Strength:</span>
                    <span className={getPasswordStrength(formData.password).color}>
                      {getPasswordStrength(formData.password).text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        getPasswordStrength(formData.password).color.replace('text-', 'bg-')
                      }`}
                      style={{ width: `${(getPasswordStrength(formData.password).level / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            {/* Action Links */}
            <div className="flex justify-between text-sm pt-2">
              {currentState === 'Login' ? (
                <button
                  type="button"
                  onClick={() => setCurrentState('Sign Up')}
                  className="text-gray-600 hover:text-black underline"
                >
                  Create account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentState('Login')}
                  className="text-gray-600 hover:text-black underline"
                >
                  Already have an account?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || emailError || (currentState === 'Sign Up' && passwordError)}
              className="w-full bg-black text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                currentState === 'Login' ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;