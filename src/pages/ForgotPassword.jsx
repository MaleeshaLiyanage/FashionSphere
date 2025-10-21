import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../redux/slices/authSlice";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSent, setIsSent] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  const handleSentOTP = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }))
      .unwrap()
      .then(() => {
        setIsSent(true);
        toast.success("OTP sent successfully. Please check your email.", {
          duration: 1000,
        });
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to send OTP. Please try again.", {
          duration: 1000,
        });
      });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      toast.error("Passwords do not match.", {
        duration: 1000,
      });
      return;
    }
    dispatch(
      resetPassword({
        email,
        resetToken: otp,
        newPassword: password,
        repeatPassword,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Password reset successfully.", {
          duration: 1000,
        });
        navigate("/login");
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to reset password. Please try again.",
          {
            duration: 1000,
          }
        );
      });
  };

  return (
    <div className="flex w-full justify-center py-32">
      {!isSent && (
        <form
          onSubmit={handleSentOTP}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">FashionSphere</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Hey there! 👋🏻</h2>
          <p className="text-center mb-6">
            Enter your email address to reset your password.
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
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "loading..." : "Send OTP"}
          </button>
          <p className="mt-6 text-center text-sm">
            Go back to{" "}
            <Link to={`/login`} className="text-blue-500">
              Login
            </Link>
          </p>
        </form>
      )}

      {isSent && (
        <form
          onSubmit={handleResetPassword}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm mt-6"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">FashionSphere</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Hey there! 👋🏻</h2>
          <p className="text-center mb-6">
            Enter the OTP sent to your email address.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">OTP</label>
            <input
              type="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter the OTP"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your new password"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Repeat Password
            </label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Repeat your new password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "loading..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
