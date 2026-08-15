import { forwardRef } from "react";
import GediPassTicket, { type GediPassTicketData } from "./GediPassTicket";
import GediBrandLockup from "./GediBrandLockup";

// Fixed-size, off-screen-rendered composition used only as the source node
// for image export (see lib/ticketExport.ts). 520x650 at pixelRatio ~2.077
// rasterizes to the recommended 1080x1350 share-image size.
export const EXPORT_WIDTH = 520;
export const EXPORT_HEIGHT = 650;
export const EXPORT_PIXEL_RATIO = 1080 / EXPORT_WIDTH;

interface GediPassExportCanvasProps {
  data: GediPassTicketData;
}

const GediPassExportCanvas = forwardRef<HTMLDivElement, GediPassExportCanvasProps>(
  function GediPassExportCanvas({ data }, ref) {
    return (
      <div
        ref={ref}
        style={{ width: EXPORT_WIDTH, height: EXPORT_HEIGHT }}
        className="relative flex flex-col items-center justify-center overflow-hidden bg-gedi-black"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 30%, #201410 0%, #0c0705 60%, #050506 100%)",
          }}
        />
        <div className="relative z-10 mb-8">
          <GediBrandLockup subtitle="PUNJAB • AFTER DARK" />
        </div>

        <div className="relative z-10">
          <GediPassTicket {...data} />
        </div>

        <p className="relative z-10 mt-8 text-[11px] font-semibold tracking-[0.3em] text-gedi-offwhite/45">
          PUNJABI GEDI • NON-STOP
        </p>
      </div>
    );
  }
);

export default GediPassExportCanvas;
