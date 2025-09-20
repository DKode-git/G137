import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";

interface NutritionChartProps {
  data: { day: string; calories: number }[];
}

export default function NutritionChart({ data }: NutritionChartProps) {
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
        labels: data.map(entry => entry.day),
        datasets: [{
          label: "Calories",
          data: data.map(entry => entry.calories),
          borderColor: "hsl(var(--accent))",
          backgroundColor: "hsla(var(--accent), 0.1)",
          fill: true,
          tension: 0.4
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

  return <canvas ref={canvasRef} className="w-full h-48" data-testid="chart-nutrition" />;
}
