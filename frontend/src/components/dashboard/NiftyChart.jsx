import { useEffect, useRef } from "react";
import Card from "../ui/Card";

export default function NiftyChart() {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = "";

    const script = document.createElement("script");

    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
     symbol: "BSE:INFY",
  autosize: false,
  width: "100%",
  height: 400,
      interval: "D",
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    container.current.appendChild(script);
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Market Overview
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          NIFTY 50 Index
        </h2>

        <p className="text-sm text-slate-400">
          Live market benchmark
        </p>
      </div>

    <div
  ref={container}
  className="tradingview-widget-container min-h-[650px] overflow-hidden rounded-xl"
/>
    </Card>
  );
}