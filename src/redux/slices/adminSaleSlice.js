import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all sales (admin only)
export const fetchAllSales = createAsyncThunk(
  "adminSales/fetchAllSales",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/sales`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data.sales;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch a single sale
export const fetchSale = createAsyncThunk(
  "adminSales/fetchSale",
  async (id) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/sales/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  }
);

// Create a new sale
export const createSale = createAsyncThunk(
  "adminSales/createSale",
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/sales`,
        saleData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update a sale
export const updateSale = createAsyncThunk(
  "adminSales/updateSale",
  async ({ id, saleData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/sales/${id}`,
        saleData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete a sale
export const deleteSale = createAsyncThunk(
  "adminSales/deleteSale",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/sales/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const adminSaleSlice = createSlice({
  name: "adminSales",
  initialState: {
    sales: [],
    sale: null,
    totalSales: 0,
    loading: false,
    error: null,
  },
  reducers: {
    resetSelectedSale: (state) => {
      state.sale = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
        state.totalSales = action.payload.length;
      })
      .addCase(fetchAllSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sale = action.payload;
      })
      .addCase(fetchSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.push(action.payload);
        state.totalSales += 1;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(
          (sale) => sale._id === action.payload._id
        );
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(
          (sale) => sale._id === action.payload
        );
        if (index !== -1) {
          state.sales.splice(index, 1);
        }
        state.totalSales -= 1;
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSelectedSale } = adminSaleSlice.actions;
export default adminSaleSlice.reducer;
