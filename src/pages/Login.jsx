import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import login from "../assets/login.webp";
import { loginUser, verifyUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slices/cartSlice";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const [isVerified, setIsVerified] = useState(true);

  // Get redirect parameter and check if it's checkout or something
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  // show error message if login fails
  const handleError = (error) => {
    toast.error(error, {
      duration: 1000,
    });
  };

  useEffect(() => {
    if (user) {
      if (cart?.products.length > 0 && guestId) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? "/checkout" : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .catch((error) => {
        handleError(error?.message || "Login failed. Please try again.");
        if (error?.isVerified === false) {
          setIsVerified(false);
        }
      });
  };

  const handleVerify = (e) => {
    e.preventDefault();
    dispatch(verifyUser({ email, verificationCode: otp }))
      .unwrap()
      .then(() => {
        setIsVerified(true);
        navigate("/");
      })
      .catch(() => {
        toast.error("Verification failed. Please try again.", {
          duration: 1000,
        });
      });
  };

  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        {isVerified && (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
          >
            <div className="flex justify-center mb-6">
              <h2 className="text-xl font-medium">FashionSphere</h2>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">
              Hey there! 👋🏻
            </h2>
            <p className="text-center mb-6">
              Enter your username and password to Login.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your email address"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 flex justify-between">
                Password
                <Link
                  to="/forgot-password"
                  className="text-blue-500 font-normal text-xs"
                >
                  Forgot Password?
                </Link>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              {loading ? "loading..." : "Sign In"}
            </button>
            <p className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to={`/register?redirect=${encodeURIComponent(redirect)}`}
                className="text-blue-500"
              >
                Register
              </Link>
            </p>
          </form>
        )}

        {/* verification form */}
        {!isVerified && (
          <form
            onSubmit={handleVerify}
            className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm mt-6"
          >
            <div className="flex justify-center mb-6">
              <h2 className="text-xl font-medium">FashionSphere</h2>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">
              Hey there! 👋🏻
            </h2>
            <p className="text-center mb-6">
              Enter verification code sent to your email address.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">OTP</label>
              <input
                type="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your otp"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              {loading ? "loading..." : "Verify"}
            </button>
          </form>
        )}
      </div>

      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={login}
            alt="Login to Account"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
export default Login;
