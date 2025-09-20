import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";

interface WorkoutChartProps {
  data: { day: string; sets: number; duration: number }[];
}

export default function WorkoutChart({ data }: WorkoutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: data.map(entry => entry.day),
        datasets: [{
          label: "Sets",
          data: data.map(entry => entry.sets),
          backgroundColor: "hsl(var(--primary))",
          yAxisID: "y"
        }, {
          label: "Duration (min)",
          data: data.map(entry => entry.duration),
          backgroundColor: "hsl(var(--secondary))",
          yAxisID: "y1"
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
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Sets"
            }
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Duration (min)"
            },
            grid: {
              drawOnChartArea: false,
            }
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

  return <canvas ref={canvasRef} className="w-full h-64" data-testid="chart-workout" />;
}
