// src/components/LiveChart.jsx
import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const LiveChart = ({ events, lineColor = "rgba(75,192,192,1)" }) => {
  const prices = events.map((t) => t.price);

  const data = {
    labels: events.map((t) => new Date(t.ts || Date.now()).toLocaleTimeString()),
    datasets: [
      {
        label: "Price",
        data: prices,
        borderColor: lineColor,
        backgroundColor: lineColor.replace("1)", "0.2)"),
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: {
        title: { display: true, text: "Price" },
        beginAtZero: false,
        suggestedMin: prices.length ? Math.min(...prices) * 0.99 : undefined,
        suggestedMax: prices.length ? Math.max(...prices) * 1.01 : undefined,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default LiveChart;
