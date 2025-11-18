import { Chart, ChartConfiguration, ChartData } from "chart.js";
import { useEffect, useState } from "react";
import { ChartData as ChartConfigData } from "./common";
import { useTheme } from "next-themes";

function calculateChartData(chartConfigData: ChartConfigData) {
  const { config, data } = chartConfigData;

  const { labelKey, dataKey } = config;

  const labelListRaw = data.map((d) => {
    return `${d[labelKey] ?? "undefined"}`;
  });

  const labelList = [...new Set(labelListRaw)];

  let dataList: number[] = [];

  if (dataKey) {
    const sumsObject = data.reduce<{ [key: string]: number }>((acc, v) => {
      let newValue = v[dataKey];
      if (typeof newValue !== "number") {
        newValue = 0;
      }

      const key = `${v[labelKey]}`;
      const oldValue = acc[key];
      acc[key] = (oldValue ?? 0) + newValue;
      return acc;
    }, {});

    dataList = labelList.map((l) => sumsObject[l]);
  } else {
    const countsObject = labelListRaw.reduce<{ [key: string]: number }>(
      (acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      },
      {}
    );
    dataList = labelList.map((l) => countsObject[l]);
  }

  return {
    labelList,
    dataList,
  };
}

function ChartRenderer({ chartData }: { chartData?: ChartConfigData }) {
  if (!chartData) {
    return null;
  }

  const { config } = chartData;
  if (config.type === "bar") {
    return <BarChartRenderer chartData={chartData} />;
  }

  if (config.type === "line") {
    return <LineChartRenderer chartData={chartData} />;
  }

  if (config.type === "pie") {
    return <PieChartRenderer chartData={chartData} />;
  }

  return null;
}

function BarChartRenderer({
  chartData: chartConfigData,
}: {
  chartData?: ChartConfigData;
}) {
  const { theme } = useTheme();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: Chart<"bar"> | undefined = undefined;

    if (!canvas || !chartConfigData) {
      return;
    }

    const style = getComputedStyle(document.body);
    const primaryColor = style.getPropertyValue("--primary");
    const tickColor = theme === "dark" ? "rgba(180, 180, 180, 0.2)" : undefined;

    const { labelList, dataList } = calculateChartData(chartConfigData);

    const chartData: ChartData<"bar"> = {
      labels: labelList,
      datasets: [
        {
          data: dataList,
          backgroundColor: `color-mix(in oklch, ${primaryColor}, transparent 70%)`,
          borderColor: primaryColor,
          borderWidth: 1,
        },
      ],
    };

    const chartConfig: ChartConfiguration<"bar"> = {
      type: "bar",
      data: chartData,
      options: {
        scales: {
          x: {
            grid: {
              color: tickColor,
            },
            ticks: {
              padding: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: tickColor,
            },
          },
        },
        layout: {
          padding: 24,
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: chartConfigData.config.title ?? "Bar Chart",
            padding: {
              bottom: 10,
            },
          },
        },
      },
    };

    chart = new Chart(canvas, chartConfig);

    return () => {
      chart?.destroy();
    };
  }, [canvas, chartConfigData, theme]);

  return <canvas ref={setCanvas} />;
}

function LineChartRenderer({
  chartData: chartConfigData,
}: {
  chartData?: ChartConfigData;
}) {
  const { theme } = useTheme();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: Chart<"line"> | undefined = undefined;
    if (!canvas || !chartConfigData) {
      return;
    }

    const style = getComputedStyle(document.body);
    const primaryColor = style.getPropertyValue("--primary");
    const tickColor = theme === "dark" ? "rgba(180, 180, 180, 0.2)" : undefined;

    const { labelList, dataList } = calculateChartData(chartConfigData);

    const chartData: ChartData<"line"> = {
      labels: labelList,
      datasets: [
        {
          data: dataList,
          backgroundColor: `color-mix(in oklch, ${primaryColor}, transparent 80%)`,
          borderColor: primaryColor,
          pointBackgroundColor: primaryColor,
          pointBorderColor: primaryColor,
          fill: true,
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 3.5,
        },
      ],
    };

    const chartConfig: ChartConfiguration<"line"> = {
      type: "line",
      data: chartData,
      options: {
        scales: {
          x: {
            grid: {
              color: tickColor,
            },
            ticks: {
              padding: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: tickColor,
            },
          },
        },
        layout: {
          padding: 24,
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: chartConfigData.config.title ?? "Line Chart",
            padding: {
              bottom: 10,
            },
          },
        },
      },
    };

    chart = new Chart(canvas, chartConfig);

    return () => {
      chart?.destroy();
    };
  }, [canvas, chartConfigData, theme]);

  return <canvas ref={setCanvas} />;
}

function PieChartRenderer({
  chartData: chartConfigData,
}: {
  chartData?: ChartConfigData;
}) {
  const { theme } = useTheme();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: Chart<"doughnut"> | undefined = undefined;
    if (!canvas || !chartConfigData) {
      return;
    }

    const { labelList, dataList } = calculateChartData(chartConfigData);

    const chartData: ChartData<"doughnut"> = {
      labels: labelList,
      datasets: [
        {
          data: dataList,
          hoverOffset: 10,
          offset: 5,
          hoverBorderWidth: 0,
          borderWidth: 0,
        },
      ],
    };

    const chartConfig: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: chartData,
      options: {
        maintainAspectRatio: true,
        aspectRatio: 16 / 9,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            align: "center",
            position: "top",
          },
          title: {
            display: true,
            text: chartConfigData.config.title ?? "Pie Chart",
            padding: {
              top: 20,
            },
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                const value = context.parsed;
                if (value !== null) {
                  const dataArr = context.chart.data.datasets[0].data;
                  const sum = dataArr
                    .filter((data) => typeof data === "number")
                    .reduce((acc, v) => {
                      return acc + v;
                    }, 0);
                  const percentage = Math.round((value * 100) / sum) + "%";

                  label += `${value} (${percentage})`;
                }
                return label;
              },
            },
          },
        },
      },
    };

    chart = new Chart(canvas, chartConfig);

    return () => {
      chart?.destroy();
    };
  }, [canvas, chartConfigData, theme]);

  return <canvas ref={setCanvas} />;
}

export { ChartRenderer };
