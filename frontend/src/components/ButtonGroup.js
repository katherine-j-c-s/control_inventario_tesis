import { FileEdit, FileUp } from "lucide-react";

export function ButtonGroupSeparatorDemo({ text, secondtext, activeMode, onSelectManual, onSelectPdf }) {
  return (
    <div className="flex justify-start  w-full mb-6">
      <div className="inline-flex rounded-lg border border-border bg-muted p-1 shadow-sm w-[50%]">
        <button
          onClick={onSelectManual}
          className={`
             text-centeritems-center  py-1.5 w-full rounded-md font-medium text-sm
            transition-all duration-200 ease-in-out 
            ${activeMode === "manual" 
              ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }
          `}
        >
          {/* <FileEdit className="h-4 w-4" /> */}
          {text}
        </button>
        
        <button
          onClick={onSelectPdf}
          className={`
             text-center items-center gap-2 py-1.5 w-full rounded-md font-medium text-sm
            transition-all duration-200 ease-in-out 
            ${activeMode === "pdf" 
              ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }
          `}
        >
          {/* <FileUp className="h-4 w-4" /> */}
          {secondtext}
        </button>
      </div>
    </div>
  );
}
