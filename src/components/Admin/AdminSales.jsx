import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { deleteSale, fetchAllSales } from "../../redux/slices/adminSaleSlice";
import { useEffect } from "react";

const AdminSales = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { sales, loading, error } = useSelector((state) => state.adminSales);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete the Product?")) {
      dispatch(deleteSale(id));
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      dispatch(fetchAllSales());
    }
  }, [dispatch, user, navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Sales Management</h2>
      <div className="mb-4 flex justify-end">
        <Link
          to="/admin/sales/new"
          className="mb-4 inline-block bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Add New Sale
        </Link>
      </div>

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Sale Name</th>
              <th className="py-3 px-4">Percentage</th>
              <th className="py-3 px-4">Start Date</th>
              <th className="py-3 px-4">End Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map((sale, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                    {sale.name}
                  </td>
                  <td className="p-4">{sale.discountPercentage}</td>
                  <td className="p-4">
                    {new Date(sale.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="p-4">
                    {new Date(sale.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="p-4">
                    {sale.isActive ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <span className="text-red-500">Inactive</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/admin/sales/${sale._id}/edit`}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                    <button
                      disabled={sale.isActive}
                      onClick={() => handleDelete(sale._id)}
                      className={`bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ${
                        sale.isActive ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSales;
