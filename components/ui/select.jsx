import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils";

const SelectContext = React.createContext({});

export function Select({ children, value, onValueChange, ...props }) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value);

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, handleSelect }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder, ...props }) {
  const { selectedValue } = React.useContext(SelectContext);
  const childrenArray = React.Children.toArray(props.children);
  const selectedChild = childrenArray.find(
    (child) => child?.props?.value === selectedValue
  );

  // If no children were provided to SelectValue (common usage),
  // fall back to showing the selectedValue itself.
  const label = selectedChild
    ? selectedChild.props.children
    : (childrenArray.length === 0 && selectedValue)
      ? selectedValue
      : placeholder;

  return (
    <span {...props}>
      {label}
    </span>
  );
}

export const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      <SelectContext.Provider value={React.useContext(SelectContext)}>
        {children}
      </SelectContext.Provider>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { handleSelect, selectedValue } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      onClick={() => handleSelect(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";
