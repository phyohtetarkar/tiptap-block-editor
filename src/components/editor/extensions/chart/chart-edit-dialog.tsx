import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, safeParseNum, uppercaseFirstChar } from "@/lib/utils";
import { format, parse } from "date-fns";
import {
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  CalendarIcon,
  CaseSensitiveIcon,
  ChartColumnBigIcon,
  ChartLineIcon,
  ChartPieIcon,
  CheckIcon,
  ChevronDownCircleIcon,
  ChevronDownIcon,
  HashIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ChartRenderer } from "./chart-renderer";
import { ChartConfig, ChartData, parseChartData, Property } from "./common";

const defaultId = crypto.randomUUID();
const defaultData: ChartData = {
  config: {
    type: "bar",
    labelKey: defaultId,
    dataKey: undefined,
    title: undefined,
  },
  properties: [
    {
      default: true,
      id: defaultId,
      name: "Name",
      type: "text",
    },
  ],
  data: [],
} satisfies ChartData;

type FormType = {
  config: ChartConfig;
  properties: Property[];
  data: ChartData["data"];
};

export function ChartEditDialog({
  value,
  isOpen,
  onOpenChange,
  onInsert,
}: {
  value?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert?: (data: string) => void;
}) {
  const [chartData, setChartData] = useState<ChartData>();
  const [columnMenuIndex, setColumnMenuIndex] = useState<number>();
  const [error, setError] = useState<string>();

  const {
    control,
    formState: { isSubmitting },
    setValue,
    handleSubmit,
    register,
    watch,
    getValues,
  } = useForm<FormType>({
    defaultValues: { ...defaultData },
  });

  const configWatch = watch("config");
  const dataKeyWatch = watch("config.dataKey");
  const propertiesWatch = watch("properties");

  const propertiesField = useFieldArray({
    control,
    name: "properties",
    keyName: "vId",
  });

  const dataField = useFieldArray({
    control,
    name: "data",
    keyName: "vId",
  });

  const onSubmit = (values: FormType) => {
    if (values.data.length === 0) {
      return;
    }

    const result = {
      ...values,
    } satisfies ChartData;
    onInsert?.(JSON.stringify(result));
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setChartData(undefined);

    if (!value) {
      const { config, properties, data } = defaultData;
      setValue("config", { ...config });
      setValue("properties", [...properties]);
      setValue("data", [...data]);
      return;
    }

    const parsed = JSON.parse(value);
    const result = parseChartData(parsed);
    if (result.success) {
      const { config, properties, data } = result.data;
      setValue("config", config);
      setValue("properties", properties);
      setValue("data", data);

      setChartData({
        config,
        properties,
        data,
      });
    } else {
      setError(result.error.message);
    }
  }, [isOpen, value, setValue]);

  const addNextColumn = (index: number, type: Property["type"]) => {
    const isLastColumn = index === propertiesField.fields.length - 1;
    const property = {
      id: crypto.randomUUID(),
      type: type,
      name: "Name",
    } satisfies Property;

    if (isLastColumn) {
      propertiesField.append(property);
    } else {
      propertiesField.insert(index + 1, property);
    }
  };

  const deleteColumn = (index: number) => {
    const property = getValues("properties")[index];
    if (property.default) {
      return;
    }

    propertiesField.remove(index);

    const dataCopy = getValues("data");
    dataCopy.forEach((d) => {
      d[property.id] = undefined;
    });

    setValue("data", dataCopy);
    setColumnMenuIndex(undefined);
  };

  const changeColumnType = (index: number, type: Property["type"]) => {
    const property = getValues("properties")[index];
    if (property.type === type) {
      return;
    }

    propertiesField.update(index, {
      ...property,
      type,
    });

    setValue("config.labelKey", defaultData.config.labelKey);
    setValue("config.dataKey", defaultData.config.dataKey);

    const dataArray = getValues("data");
    dataArray.forEach((d, i) => {
      const value = d[property.id];
      if (type === "number") {
        dataField.update(i, {
          ...d,
          [property.id]: isNaN(+(value ?? "none")) ? undefined : value,
        });
      } else {
        dataField.update(i, {
          ...d,
          [property.id]: value,
        });
      }
    });
  };

  const addRow = () => {
    const row: FormType["data"][number] = {};
    const props = getValues("properties");
    for (const p of props) {
      row[p.id] = undefined;
    }

    dataField.append(row);
  };

  const deleteRow = (index: number) => {
    dataField.remove(index);
  };

  const renderChartIcon = (type?: ChartConfig["type"]) => {
    if (type === "bar") {
      return <ChartColumnBigIcon className="opacity-60" />;
    }
    if (type === "line") {
      return <ChartLineIcon className="opacity-60" />;
    }
    if (type === "pie") {
      return <ChartPieIcon className="opacity-60" />;
    }
    return null;
  };

  const content = () => {
    if (error) {
      return <Alert variant="destructive">{error}</Alert>;
    }

    return (
      <div className="grid grid-cols-1">
        <div className="flex items-center space-x-4 mb-2">
          <h4 className="scroll-m-20 font-medium tracking-tight grow">
            Data model
          </h4>
          <Button size="sm" onClick={addRow}>
            <PlusIcon />
            Add row
          </Button>
        </div>
        <Table containerClass={cn("max-h-[250px] border mb-4")}>
          {dataField.fields.length === 0 && (
            <TableCaption className="mb-4">
              Manage your chart data.
            </TableCaption>
          )}
          <TableHeader className="bg-accent sticky top-0 z-[1]">
            <TableRow className="divide-x">
              {propertiesField.fields.map((p, i) => {
                return (
                  <TableHead
                    key={p.vId}
                    className="min-w-[160px] h-10 p-0 hover:bg-secondary"
                  >
                    <DropdownMenu
                      onOpenChange={(op) => {
                        setColumnMenuIndex(op ? i : undefined);
                      }}
                    >
                      <DropdownMenuTrigger
                        disabled={
                          columnMenuIndex !== undefined && i !== columnMenuIndex
                        }
                        className="h-10 w-full relative"
                      >
                        {p.type === "text" && (
                          <CaseSensitiveIcon
                            className={cn(
                              "absolute left-2 top-[50%] -translate-y-[50%]",
                              "text-muted-foreground"
                            )}
                          />
                        )}
                        {p.type === "number" && (
                          <HashIcon
                            className={cn(
                              "absolute left-2 top-[50%] -translate-y-[50%]",
                              "text-muted-foreground size-5"
                            )}
                          />
                        )}
                        {p.type === "date" && (
                          <CalendarIcon
                            className={cn(
                              "absolute left-2 top-[50%] -translate-y-[50%]",
                              "text-muted-foreground size-5"
                            )}
                          />
                        )}
                        {p.type === "select" && (
                          <ChevronDownCircleIcon
                            className={cn(
                              "absolute left-2 top-[50%] -translate-y-[50%]",
                              "text-muted-foreground size-5"
                            )}
                          />
                        )}

                        <span>{watch(`properties.${i}.name`)}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="drop-shadow-2xl"
                        style={{
                          width: "var(--radix-dropdown-menu-trigger-width)",
                        }}
                      >
                        <DropdownMenuLabel className="font-normal p-1">
                          <Input {...register(`properties.${i}.name`)} />
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger hidden={p.default}>
                              <RefreshCwIcon className="text-muted-foreground" />
                              Change type
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuLabel className="font-medium">
                                  Column type
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  disabled={p.type === "text"}
                                  onClick={() => changeColumnType(i, "text")}
                                >
                                  Text
                                  <DropdownMenuShortcut
                                    hidden={p.type !== "text"}
                                  >
                                    <CheckIcon />
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={p.type === "number"}
                                  onClick={() => changeColumnType(i, "number")}
                                >
                                  Number
                                  <DropdownMenuShortcut
                                    hidden={p.type !== "number"}
                                  >
                                    <CheckIcon />
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={p.type === "date"}
                                  onClick={() => changeColumnType(i, "date")}
                                >
                                  Date
                                  <DropdownMenuShortcut
                                    hidden={p.type !== "date"}
                                  >
                                    <CheckIcon />
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <ArrowRightToLineIcon className="text-muted-foreground" />
                              Insert right
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuLabel className="font-medium">
                                  Column type
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => addNextColumn(i, "text")}
                                >
                                  Text
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => addNextColumn(i, "number")}
                                >
                                  Number
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => addNextColumn(i, "date")}
                                >
                                  Date
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger hidden={i === 0}>
                              <ArrowLeftToLineIcon className="text-muted-foreground" />
                              Insert left
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuLabel className="font-medium">
                                  Column type
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => addNextColumn(i - 1, "text")}
                                >
                                  Text
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => addNextColumn(i - 1, "number")}
                                >
                                  Number
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => addNextColumn(i - 1, "date")}
                                >
                                  Date
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator hidden={p.default} />
                          <DropdownMenuItem
                            hidden={p.default}
                            className="text-destructive hover:text-destructive focus:text-destructive"
                            onClick={() => deleteColumn(i)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                );
              })}
              <TableHead className="w-full h-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataField.fields.map((d, di) => (
              <TableRow key={d.vId} className="divide-x">
                {propertiesField.fields.map((p, pi) => {
                  // const cell = d[p.id];
                  if (p.type === "date") {
                    return (
                      <TableCell key={p.vId}>
                        <Controller
                          control={control}
                          name={`data.${di}.${p.id}`}
                          render={({ field: { value, onChange } }) => {
                            const date =
                              typeof value === "string" ? value : undefined;
                            return (
                              <DatePicker
                                value={date}
                                placeholder={watch(`properties.${pi}.name`)}
                                calendarProps={(close) => {
                                  return {
                                    mode: "single",
                                    selected: date
                                      ? parse(date, "MMM dd, yyyy", new Date())
                                      : undefined,
                                    onSelect: (date) => {
                                      if (date) {
                                        onChange(format(date, "MMM dd, yyyy"));
                                      } else {
                                        onChange(undefined);
                                      }

                                      close();
                                    },
                                  };
                                }}
                              />
                            );
                          }}
                        />
                      </TableCell>
                    );
                  }

                  if (p.type === "select") {
                    return <TableCell key={p.vId}></TableCell>;
                  }

                  return (
                    <TableCell key={p.vId}>
                      <Controller
                        control={control}
                        name={`data.${di}.${p.id}`}
                        render={({ field: { value, onChange } }) => {
                          return (
                            <Input
                              placeholder={watch(`properties.${pi}.name`)}
                              value={value ?? ""}
                              onChange={(evt) => {
                                const v = evt.target.value;
                                if (p.type === "number" && !isNaN(+v)) {
                                  onChange(safeParseNum(v));
                                } else if (p.type === "text") {
                                  onChange(v);
                                }
                              }}
                            />
                          );
                        }}
                      />
                    </TableCell>
                  );
                })}
                <TableCell>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="size-8"
                    onClick={() => deleteRow(di)}
                  >
                    <Trash2Icon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h4 className="scroll-m-20 font-medium tracking-tight mb-2">
          Chart config
        </h4>

        <div className="flex space-x-4 overflow-x-auto">
          <div className="flex flex-col w-[250px] gap-4">
            <div className="flex flex-col">
              <div className="text-sm font-medium leading-none mb-1.5">
                Title
              </div>
              <Controller
                control={control}
                name="config.title"
                render={({ field: { value, onChange } }) => {
                  return (
                    <Input
                      name="chartTitle"
                      placeholder="Chart title"
                      value={value ?? ""}
                      onChange={onChange}
                    />
                  );
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium leading-none mb-1.5">
                Type
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <Controller
                      control={control}
                      name={`config.type`}
                      render={({ field: { value } }) => {
                        return (
                          <>
                            {renderChartIcon(value)}
                            <span
                              className={cn("font-normal", {
                                "opacity-50": !value,
                              })}
                            >
                              {uppercaseFirstChar(value) || "Chart type..."}
                            </span>
                          </>
                        );
                      }}
                    />
                    <ChevronDownIcon className="ms-auto opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  style={{
                    width: "var(--radix-dropdown-menu-trigger-width)",
                  }}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => {
                        setValue(`config.type`, "bar");
                      }}
                    >
                      {renderChartIcon("bar")}
                      Bar
                      <DropdownMenuShortcut hidden={configWatch.type !== "bar"}>
                        <CheckIcon />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setValue(`config.type`, "line");
                      }}
                    >
                      {renderChartIcon("line")}
                      Line
                      <DropdownMenuShortcut
                        hidden={configWatch.type !== "line"}
                      >
                        <CheckIcon />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setValue(`config.type`, "pie");
                      }}
                    >
                      {renderChartIcon("pie")}
                      Pie
                      <DropdownMenuShortcut hidden={configWatch.type !== "pie"}>
                        <CheckIcon />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium leading-none mb-1.5">
                Label
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <Controller
                      control={control}
                      name={`config.labelKey`}
                      render={({ field: { value } }) => {
                        const property = value
                          ? propertiesWatch.find((p) => p.id === value)
                          : undefined;
                        return (
                          <span
                            className={cn("font-normal", {
                              "opacity-50": property === undefined,
                            })}
                          >
                            {property?.name || "Label column..."}
                          </span>
                        );
                      }}
                    />
                    <ChevronDownIcon className="ms-auto opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  style={{
                    width: "var(--radix-dropdown-menu-trigger-width)",
                  }}
                >
                  <DropdownMenuGroup>
                    {propertiesWatch.map((p) => {
                      return (
                        <DropdownMenuItem
                          key={p.id}
                          disabled={
                            configWatch?.dataKey === p.id || p.type === "number"
                          }
                          onClick={() => {
                            setValue(`config.labelKey`, p.id);
                          }}
                        >
                          {p.name}
                          <DropdownMenuShortcut
                            hidden={p.id !== configWatch.labelKey}
                          >
                            <CheckIcon />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium leading-none mb-1.5">
                Data
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <span className={cn("font-normal")}>
                      {propertiesWatch.find((p) => p.id === dataKeyWatch)
                        ?.name || "Count"}
                    </span>
                    <ChevronDownIcon className="ms-auto opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  style={{
                    width: "var(--radix-dropdown-menu-trigger-width)",
                  }}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => {
                        setValue(`config.dataKey`, undefined);
                      }}
                    >
                      Count
                      <DropdownMenuShortcut
                        hidden={configWatch.dataKey !== undefined}
                      >
                        <CheckIcon />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    {propertiesWatch.map((p) => {
                      return (
                        <DropdownMenuItem
                          key={p.id}
                          disabled={
                            configWatch?.labelKey === p.id ||
                            p.type !== "number"
                          }
                          onClick={() => {
                            setValue(`config.dataKey`, p.id);
                          }}
                        >
                          {p.name}
                          <DropdownMenuShortcut
                            hidden={p.id !== configWatch.dataKey}
                          >
                            <CheckIcon />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                disabled={dataField.fields.length === 0}
                onClick={() => {
                  handleSubmit((values) => {
                    setChartData({
                      config: values.config,
                      properties: values.properties,
                      data: values.data,
                    });
                  })();
                }}
              >
                Render
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setChartData(undefined);
                  setValue("config", { ...defaultData.config });
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="w-full flex justify-center items-center border">
            <ChartRenderer chartData={chartData} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        onInteractOutside={(evt) => evt.preventDefault()}
        className="sm:max-w-4xl p-0"
      >
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>Insert chart</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto px-5 py-2">
          {content()}
        </div>
        <DialogFooter className="p-5 pt-0 gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            disabled={dataField.fields.length === 0 || isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {value ? "Update" : "Insert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
