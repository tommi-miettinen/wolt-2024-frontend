import { useState, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

const CustomTooltip = ({ trigger, content }: { trigger: JSX.Element; content: string }) => {
  const [open, setOpen] = useState(false);

  const handleOutsideAction = (event: TouchEvent | MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target || !target.closest(".TooltipContent")) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleOutsideAction);
      document.addEventListener("touchstart", handleOutsideAction);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideAction);
      document.removeEventListener("touchstart", handleOutsideAction);
    };
  }, [open]);

  return (
    <Tooltip.Provider>
      <Tooltip.Root open={open}>
        <Tooltip.Trigger
          tabIndex={-1}
          aria-label="tooltip trigger"
          className="p-0 m-0 rounded-full outline-none border-none"
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {trigger}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="TooltipContent p-2 text-sm max-w-[400px] bg-body rounded-lg shadow border border-borderColor"
            sideOffset={5}
          >
            {content}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default CustomTooltip;
