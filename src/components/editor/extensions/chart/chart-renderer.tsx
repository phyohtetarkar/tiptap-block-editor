import { Chart, ChartConfiguration, ChartData, ChartType } from "chart.js";
import { useEffect, useState } from "react";
import { ChartData as ChartConfigData } from "./common";
import { useTheme } from "next-themes";

const colors = [
  "#4361ee",
  "#ea6759",
  "#f3c65f",
  "#8bc28c",
  "#f18aad",
  "#f88f58",
  "#7a7a7a",
];

function calculateChartData(chartConfigData: ChartConfigData) {
  const { config, data, properties } = chartConfigData;

  const { labelKey, dataKey, groupKey } = config;

  const labelListRaw = data.map((d) => {
    return `${d[labelKey] ?? "undefined"}`;
  });

  const labelList = [...new Set(labelListRaw)];

  const dataList: { label: string; values: number[] }[] = [];

  const defaultGroupKey =
    properties.find((p) => p.id === dataKey)?.name ?? "Count";
  const group = data.reduce<Map<string, typeof data>>((acc, v) => {
    let key = defaultGroupKey;
    if (groupKey) {
      key = `${v[groupKey]}`;
    }

    const oldValue = acc.get(key) ?? [];
    acc.set(key, [...oldValue, v]);
    return acc;
  }, new Map());

  for (const [key, values] of group) {
    if (dataKey) {
      const sumsObject = values.reduce<{ [key: string]: number }>((acc, v) => {
        let newValue = v[dataKey];
        if (typeof newValue !== "number") {
          newValue = 0;
        }

        const key = `${v[labelKey]}`;
        const oldValue = acc[key];
        acc[key] = (oldValue ?? 0) + newValue;
        return acc;
      }, {});

      dataList.push({
        label: key,
        values: labelList.map((l) => sumsObject[l]),
      });
    } else {
      const countsObject = labelListRaw.reduce<{ [key: string]: number }>(
        (acc, v) => {
          acc[v] = (acc[v] || 0) + 1;
          return acc;
        },
        {}
      );
      dataList.push({
        label: key,
        values: labelList.map((l) => countsObject[l]),
      });
    }
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
    return <PieChartRenderer chartData={chartData} type="pie" />;
  }

  if (config.type === "doughnut") {
    return <PieChartRenderer chartData={chartData} type="doughnut" />;
  }

  if (config.type === "polar") {
    return <PieChartRenderer chartData={chartData} type="polarArea" />;
  }

  if (config.type === "radar") {
    return <RadarChartRenderer chartData={chartData} />;
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
    const type = "bar" as ChartType;
    type Type = typeof type;
    let chart: Chart<Type> | undefined = undefined;

    if (!canvas || !chartConfigData) {
      return;
    }

    // const style = getComputedStyle(document.body);
    // const primaryColor = style.getPropertyValue("--primary");
    const tickColor = theme === "dark" ? "rgba(180, 180, 180, 0.2)" : undefined;

    const { labelList, dataList } = calculateChartData(chartConfigData);

    const chartData: ChartData<Type> = {
      labels: labelList,
      datasets: dataList.map(({ label, values }, i) => {
        const color = colors[i];
        return {
          label: label,
          data: values,
          backgroundColor: color,
          hoverBackgroundColor: color,
          borderRadius: {
            topLeft: 4,
            topRight: 4,
          },
        };
      }),
    };

    const title = chartConfigData.config.title ?? "Bar Chart";
    const chartConfig: ChartConfiguration<Type> = {
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
        plugins: {
          title: {
            display: true,
            text: title,
            padding: {
              top: 10,
            },
            position: "bottom",
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
    const type = "line" as ChartType;
    type Type = typeof type;
    let chart: Chart<Type> | undefined = undefined;
    if (!canvas || !chartConfigData) {
      return;
    }

    // const style = getComputedStyle(document.body);
    // const primaryColor = style.getPropertyValue("--primary");
    const tickColor = theme === "dark" ? "rgba(180, 180, 180, 0.2)" : undefined;

    const { labelList, dataList } = calculateChartData(chartConfigData);

    const chartData: ChartData<Type> = {
      labels: labelList,
      datasets: dataList.map(({ label, values }, i) => {
        const color = colors[i];
        return {
          label: label,
          data: values,
          backgroundColor: `color-mix(in srgb, ${color}, transparent 70%)`,
          borderColor: color,
          pointBackgroundColor: color,
          fill: true,
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 3.5,
        };
      }),
    };

    const title = chartConfigData.config.title ?? "Line Chart";
    const chartConfig: ChartConfiguration<Type> = {
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
        plugins: {
          title: {
            display: true,
            text: title,
            padding: {
              top: 10,
            },
            position: "bottom",
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
  type,
  chartData: chartConfigData,
}: {
  type: "doughnut" | "pie" | "polarArea";
  chartData?: ChartConfigData;
}) {
  const { theme } = useTheme();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    type Type = typeof type;
    let chart: Chart<Type> | undefined = undefined;
    if (!canvas || !chartConfigData) {
      return;
    }

    const tickColor = theme === "dark" ? "rgba(180, 180, 180, 0.2)" : undefined;

    const { labelList, dataList } = calculateChartData(chartConfigData);

    const chartData: ChartData<Type> = {
      labels: labelList,
      datasets: dataList.map(({ values }) => {
        return {
          data: values,
          hoverOffset: 10,
          offset: 5,
          hoverBorderWidth: 0,
          borderWidth: 0,
          backgroundColor: values.map((_, i) => colors[i]),
        };
      }),
    };

    const title =
      chartConfigData.config.title ??
      `${type === "doughnut" ? "Doughnut" : "Pie"} Chart`;

    const chartConfig: ChartConfiguration<Type> = {
      type: type,
      data: chartData,
      options: {
        aspectRatio: 16 / 9,
        scales:
          type === "polarArea"
            ? {
                r: {
                  beginAtZero: true,
                  grid: {
                    color: tickColor,
                  },
                  angleLines: {
                    color: tickColor,
                  },
                },
              }
            : undefined,
        plugins: {
          legend: {
            align: "center",
            position: "top",
          },
          title: {
            display: true,
            text: title,
            padding: {
              top: 10,
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

                  if (type === "polarArea") {
                    const percentage = Math.round((value.r * 100) / sum) + "%";
                    label += `${value.r} (${percentage})`;
                  } else {
                    const percentage = Math.round((value * 100) / sum) + "%";
                    label += `${value} (${percentage})`;
                  }
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
  }, [canvas, chartConfigData, type, theme]);

  return <canvas ref={setCanvas} />;
}

function RadarChartRenderer({
  chartData: chartConfigData,
}: {
  chartData?: ChartConfigData;
}) {
  const { theme } = useTheme();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const type = "radar" as ChartType;
    type Type = typeof type;
    let chart: Chart<Type> | undefined = undefined;
    if (!canvas || !chartConfigData) {
      return;
    }

    const tickColor =
      theme === "dark" ? "rgba(180, 180, 180, 0.2)" : "rgba(0, 0, 0, 0.1)";

    const { labelList, dataList } = calculateChartData(chartConfigData);

    const chartData: ChartData<Type> = {
      labels: labelList,
      datasets: dataList.map(({ label, values }, i) => {
        const color = colors[i];
        return {
          label: label,
          data: values,
          backgroundColor: `color-mix(in srgb, ${color}, transparent 70%)`,
          borderColor: color,
          pointBackgroundColor: color,
          fill: true,
        };
      }),
    };

    const title = chartConfigData.config.title ?? `Radar Chart`;

    const chartConfig: ChartConfiguration<Type> = {
      type: type,
      data: chartData,
      options: {
        aspectRatio: 16 / 9,
        elements: {
          line: {
            borderWidth: 3,
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: tickColor,
            },
            angleLines: {
              color: tickColor,
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: title,
            padding: {
              top: 10,
            },
            position: "bottom",
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
