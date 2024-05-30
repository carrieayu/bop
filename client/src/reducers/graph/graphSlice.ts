import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import CardEntity from '../../entity/cardEntity'
import { OtherPlanningEntity } from '../../entity/otherPlanningEntity'

interface GraphDataState {
  isLoading: boolean;
  totalSalesByDate: Record<string, number>;
  totalOperatingProfitByDate: Record<string, number>;
  totalGrossProfitByDate: Record<string, number>;
  totalNetProfitPeriodByDate: Record<string, number>;
  totalGrossProfitMarginByDate: Record<string, number>;
  totalOperatingProfitMarginByDate: Record<string, number>;
  datePlanning: string[];
}

const initialState: GraphDataState = {
  isLoading: false,
  totalSalesByDate: {},
  totalOperatingProfitByDate: {},
  totalGrossProfitByDate: {},
  totalNetProfitPeriodByDate: {},
  totalGrossProfitMarginByDate: {},
  totalOperatingProfitMarginByDate: {},
  datePlanning: [],
}

export const fetchGraphData = createAsyncThunk('graphData/fetch', async () => {
  const response = await api.get<CardEntity[]>(`http://127.0.0.1:8000/api/planningprojects/`)
  const cards = response.data.map((data) => new CardEntity(data))

  const aggregatedData: Partial<GraphDataState> = {
    totalSalesByDate: {},
    totalOperatingProfitByDate: {},
    totalGrossProfitByDate: {},
    totalNetProfitPeriodByDate: {},
    totalGrossProfitMarginByDate: {},
    totalOperatingProfitMarginByDate: {},
    datePlanning: [],
  }

  cards.forEach(card => {
    const date = card.planning || "unknown";
    if (!aggregatedData.totalSalesByDate![date]) {
      aggregatedData.totalSalesByDate![date] = 0;
      aggregatedData.totalOperatingProfitByDate![date] = 0;
      aggregatedData.totalGrossProfitByDate![date] = 0;
      aggregatedData.totalNetProfitPeriodByDate![date] = 0;
      aggregatedData.totalGrossProfitMarginByDate![date] = 0;
      aggregatedData.totalOperatingProfitMarginByDate![date] = 0;
      aggregatedData.datePlanning!.push(date);
    }

    aggregatedData.totalSalesByDate![date] += card.sales_revenue || 0;
    aggregatedData.totalOperatingProfitByDate![date] += card.operating_profit || 0;
    aggregatedData.totalGrossProfitByDate![date] += getSum(card.other_planning.map(op => op.gross_profit));
    aggregatedData.totalNetProfitPeriodByDate![date] += getSum(card.other_planning.map(op => op.net_profit_for_the_period));
    aggregatedData.totalGrossProfitMarginByDate![date] += getSum(card.other_planning.map(op => op.gross_profit_margin));
    aggregatedData.totalOperatingProfitMarginByDate![date] += getSum(card.other_planning.map(op => op.operating_profit_margin));
  });

  return aggregatedData;
});

function getSum(data: number[] | (number | undefined)[]) {
  return data?.reduce((accumulator: number, currentValue: number | undefined): number => {
    return accumulator + (currentValue || 0)
  }, 0)
}

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchGraphData.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchGraphData.fulfilled, (state, action) => {
        state.isLoading = false
        state.totalSalesByDate = action.payload.totalSalesByDate || {}
        state.totalOperatingProfitByDate = action.payload.totalOperatingProfitByDate || {}
        state.totalGrossProfitByDate = action.payload.totalGrossProfitByDate || {}
        state.totalNetProfitPeriodByDate = action.payload.totalNetProfitPeriodByDate || {}
        state.totalGrossProfitMarginByDate = action.payload.totalGrossProfitMarginByDate || {}
        state.totalOperatingProfitMarginByDate = action.payload.totalOperatingProfitMarginByDate || {}
        state.datePlanning = action.payload.datePlanning || []
      })
      .addCase(fetchGraphData.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export default graphSlice.reducer
