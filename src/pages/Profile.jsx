import { useDispatch, useSelector } from "react-redux";
import MyOrdersPage from "./MyOrdersPage";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { logout, saleNotification } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  const handleSaleNotificationChange = (e) => {
    dispatch(
      saleNotification({
        saleNotification: e.target.checked,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Sale notification preference updated!", {
          duration: 1000,
        });
      })
      .catch(() => {
        toast.error("Failed to update sale notification preference", {
          duration: 1000,
        });
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Left Section */}
          <div className="w-full md:w-1/3 lg:w-1/4 shadow-md border rounded-lg p-6 flex flex-col justify-between">
            <div className="">
              <h1 className="text-lg md:text-xl">{user?.name}</h1>
              <p className="text-gray-600 mb-4 truncate">{user?.email}</p>
              {/* checkbox for sale notification allow */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="saleNotification"
                  className="mr-2 cursor-pointer"
                  checked={user?.saleNotification}
                  onChange={handleSaleNotificationChange}
                />
                <label
                  htmlFor="saleNotification"
                  className="cursor-pointer text-sm"
                >
                  Allow Sale Notifications
                </label>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          {/* Right Section: Orders table */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <MyOrdersPage />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
