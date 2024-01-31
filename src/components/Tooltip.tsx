import { useState, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import useWindowSize from "../hooks/useWindowSize";

const CustomTooltip = ({ trigger, content, triggerAriaLabel }: { trigger: JSX.Element; content: string; triggerAriaLabel: string }) => {
  const [open, setOpen] = useState(false);

  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 640;

  const handleOutsideAction = () => setOpen(false);

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
          aria-label={triggerAriaLabel}
          id={`tooltip-trigger-${triggerAriaLabel.toLowerCase().replace(" ", "-")}`}
          tabIndex={-1}
          className="p-0 m-0 rounded-full border-none focus:!ring-transparent"
          onClick={isMobile ? () => setOpen((v) => !v) : undefined}
          onMouseEnter={!isMobile ? () => setOpen(true) : undefined}
          onMouseLeave={!isMobile ? () => setOpen(false) : undefined}
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
