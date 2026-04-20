import React from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  TimeScale
} from "chart.js";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  TimeScale,
  CandlestickController,
  CandlestickElement
);

const CandlestickChart = ({ ohlcData, symbol }) => {
  const data = {
    datasets: [
      {
        label: `${symbol} Candlestick`,
        data: ohlcData.map((bar) => ({
          x: new Date(bar.ts),
          o: bar.open,
          h: bar.high,
          l: bar.low,
          c: bar.close,
        })),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      x: { type: "time", time: { unit: "minute" }, title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "Price" } },
    },
  };

  return <Chart type="candlestick" data={data} options={options} />;
};

export default CandlestickChart;
