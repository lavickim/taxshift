import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Receipt } from '../../types/Receipt';
import { getApiUrl, API_ENDPOINTS } from '../../config/api';

interface ReceiptState {
  receipts: Receipt[];
  currentReceipt: Receipt | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: ReceiptState = {
  receipts: [],
  currentReceipt: null,
  loading: false,
  uploading: false,
  error: null,
};

// Async thunks
export const uploadReceipt = createAsyncThunk(
  'receipt/upload',
  async ({ imageUri, userId }: { imageUri: string; userId: string }) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    } as any);
    formData.append('userId', userId);

    const response = await fetch(getApiUrl(API_ENDPOINTS.RECEIPT_UPLOAD), {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
);

export const fetchReceipts = createAsyncThunk(
  'receipt/fetchAll',
  async (userId: string) => {
    const response = await fetch(getApiUrl(API_ENDPOINTS.RECEIPTS), {
      headers: {
        'Authorization': `Bearer ${userId}`, // TODO: Use proper JWT token
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch receipts');
    }

    return response.json();
  }
);

const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReceipt: (state, action: PayloadAction<Receipt | null>) => {
      state.currentReceipt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload receipt
      .addCase(uploadReceipt.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadReceipt.fulfilled, (state, action) => {
        state.uploading = false;
        state.receipts.unshift(action.payload);
      })
      .addCase(uploadReceipt.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message || 'Upload failed';
      })
      // Fetch receipts
      .addCase(fetchReceipts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = action.payload;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch receipts';
      });
  },
});

export const { clearError, setCurrentReceipt } = receiptSlice.actions;
export default receiptSlice.reducer;