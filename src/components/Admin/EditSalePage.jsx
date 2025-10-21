import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSale,
  fetchSale,
  resetSelectedSale,
  updateSale,
} from "../../redux/slices/adminSaleSlice";
import { useEffect } from "react";
import { toast } from "sonner";
import { useState } from "react";

const defaultSaleData = {
  name: "",
  discountPercentage: 0,
  startDate: new Date(),
  endDate: new Date(),
  isActive: false,
};

const EditSalePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { sale, loading, error } = useSelector((state) => state.adminSales);

  const [saleData, setSaleData] = useState(defaultSaleData);

  useEffect(() => {
    if (id) {
      dispatch(fetchSale(id));
    } else {
      dispatch(resetSelectedSale());
    }
    return () => {
      dispatch(resetSelectedSale());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (sale) {
      setSaleData(sale);
    }
  }, [sale]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaleData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      dispatch(updateSale({ id, saleData }))
        .unwrap()
        .then(() => {
          toast.success("Sale updated successfully");
          navigate("/admin/sales");
        })
        .catch((error) => {
          toast.error(error.message || "Failed to update sale");
        });
    } else {
      dispatch(createSale(saleData))
        .unwrap()
        .then(() => {
          toast.success("Sale created successfully");
          navigate("/admin/sales");
        })
        .catch((error) => {
          toast.error(error.message || "Failed to create sale");
        });
    }
  };

  const calculateEndMinDate = () => {
    const today = new Date().toISOString().split("T")[0];
    if (today > saleData.startDate) return today;
    else return saleData.startDate;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-3xl font-bold mb-6">Edit Sale</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Sale Name</label>
          <input
            type="text"
            name="name"
            value={saleData.name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Discount Percentage
          </label>
          <input
            type="number"
            name="discountPercentage"
            value={saleData.discountPercentage}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Start Date</label>
          <input
            disabled={saleData.isActive}
            type="date"
            name="startDate"
            value={new Date(saleData.startDate).toISOString().split("T")[0]}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            value={new Date(saleData.endDate).toISOString().split("T")[0]}
            onChange={handleChange}
            min={calculateEndMinDate()}
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {id ? "Update Sale" : "Create Sale"}
        </button>
      </form>
    </div>
  );
};

export default EditSalePage;
