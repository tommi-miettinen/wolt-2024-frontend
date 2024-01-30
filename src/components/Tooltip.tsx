import { useState, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

const TooltipDemo = ({ trigger, content }: { trigger: JSX.Element; content: string }) => {
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
        <Tooltip.Trigger asChild>
          <div onClick={() => setOpen((v) => !v)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className="w-min">
            {trigger}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="TooltipContent" sideOffset={5}>
            <div className="p-2 text-sm w-[400px] bg-body rounded-lg border">{content}</div>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default TooltipDemo;
