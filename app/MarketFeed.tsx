"use client";

import { useEffect, useState } from "react";

type Market = {
  symbol: string;
  name: string;
  price: number;
  change: number;
};

export default function MarketFeed() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [state, setState] = useState<"loading" | "live" | "unavailable">("loading");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/markets", { cache: "no-store" });
        const payload = await response.json();
        if (!active) return;
        if (response.ok && payload.status === "live" && Array.isArray(payload.markets)) {
          setMarkets(payload.markets);
          setState("live");
        } else {
          setState("unavailable");
        }
      } catch {
        if (active) setState("unavailable");
      }
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="market-grid" aria-label="Loading market data">
        {[0, 1, 2].map((item) => <div className="market-card skeleton" key={item} />)}
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <div className="market-unavailable" role="status">
        <span className="status-dot" />
        Market data temporarily unavailable
      </div>
    );
  }

  return (
    <div className="market-grid">
      {markets.map((market) => {
        const up = market.change >= 0;
        return (
          <article className="market-card" key={market.symbol}>
            <div>
              <div className="market-symbol">{market.symbol}</div>
              <div className="market-name">{market.name}</div>
            </div>
            <div className="market-right">
              <div className="market-price">
                {market.price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: market.price < 1000 ? 2 : 0 })}
              </div>
              <div className={up ? "market-change positive" : "market-change negative"}>
                {up ? "+" : ""}{market.change.toFixed(2)}%
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
