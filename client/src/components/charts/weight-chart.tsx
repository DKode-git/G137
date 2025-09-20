import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";

interface WeightChartProps {
  data: { date: string; weight: number }[];
}

export default function WeightChart({ data }: WeightChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: data.map(entry => new Date(entry.date).toLocaleDateString()),
        datasets: [{
          label: "Weight (lbs)",
          data: data.map(entry => entry.weight),
          borderColor: "hsl(var(--primary))",
          backgroundColor: "hsla(var(--primary), 0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "hsl(var(--primary))",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
          }
        }
      }
    };

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={canvasRef} className="w-full h-64" data-testid="chart-weight" />;
}
