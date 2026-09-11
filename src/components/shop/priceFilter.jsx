import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const MIN_VAL = 0;
const MAX_VAL = 500000;

export default function PriceFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initMin = Number(searchParams.get("min_price") || MIN_VAL);
  const initMax = Number(searchParams.get("max_price") || MAX_VAL);

  const [minVal, setMinVal] = useState(initMin);
  const [maxVal, setMaxVal] = useState(initMax);
  const rangeRef = useRef(null);

  /* keep local state in sync when URL params change externally */
  useEffect(() => {
    setMinVal(Number(searchParams.get("min_price") || MIN_VAL));
    setMaxVal(Number(searchParams.get("max_price") || MAX_VAL));
  }, [searchParams.get("min_price"), searchParams.get("max_price")]);

  const minPct = ((minVal - MIN_VAL) / (MAX_VAL - MIN_VAL)) * 100;
  const maxPct = ((maxVal - MIN_VAL) / (MAX_VAL - MIN_VAL)) * 100;

  const apply = () => {
    const p = new URLSearchParams(searchParams);
    if (minVal > MIN_VAL) p.set("min_price", String(minVal));
    else p.delete("min_price");
    if (maxVal < MAX_VAL) p.set("max_price", String(maxVal));
    else p.delete("max_price");
    setSearchParams(p, { replace: true });
  };

  return (
    <li className="pf-item">
      <style>{`
        /* ── Price Filter ────────────────────────────────────── */
        .pf-item { list-style: none; padding: 14px 14px 16px; }

        .pf-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 14px;
        }
        .pf-title {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .pf-apply {
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 700;
          color: #e18f27;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.15s ease;
        }
        .pf-apply:hover { opacity: 0.7; }

        /* dual-thumb track */
        .pf-track-wrap {
          position: relative;
          height: 6px;
          margin: 10px 4px 20px;
        }
        .pf-track-bg {
          position: absolute;
          inset: 0;
          border-radius: 3px;
          background: #e5e7eb;
        }
        .pf-track-fill {
          position: absolute;
          top: 0; bottom: 0;
          border-radius: 3px;
          background: #e18f27;
        }

        /* range inputs sit on top of the track */
        .pf-range {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: none;
        }
        .pf-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #e18f27;
          border: 2px solid #fff;
          box-shadow: 0 1px 6px rgba(225,143,39,0.4);
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.15s ease;
        }
        .pf-range::-webkit-slider-thumb:hover  { transform: scale(1.15); }
        .pf-range::-moz-range-thumb {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #e18f27;
          border: 2px solid #fff;
          box-shadow: 0 1px 6px rgba(225,143,39,0.4);
          cursor: pointer;
        }

        /* number inputs row */
        .pf-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .pf-input {
          flex: 1;
          padding: 7px 10px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          background: #fff;
          text-align: center;
          transition: border-color 0.15s ease;
          min-width: 0;
        }
        .pf-input:focus {
          outline: none;
          border-color: #e18f27;
          box-shadow: 0 0 0 2px rgba(225,143,39,0.15);
        }
        /* hide number spin arrows */
        .pf-input::-webkit-outer-spin-button,
        .pf-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .pf-input[type=number] { -moz-appearance: textfield; }

        .pf-sep {
          font-size: 13px;
          color: #9ca3af;
          flex-shrink: 0;
        }
      `}</style>

      {/* Header */}
      <div className="pf-header">
        <span className="pf-title">Price (UGX)</span>
        <button className="pf-apply" onClick={apply} type="button">
          Apply
        </button>
      </div>

      {/* Dual-range slider */}
      <div className="pf-track-wrap" ref={rangeRef}>
        <div className="pf-track-bg" />
        <div
          className="pf-track-fill"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        {/* min thumb */}
        <input
          type="range"
          className="pf-range"
          min={MIN_VAL}
          max={MAX_VAL}
          step={1000}
          value={minVal}
          onChange={e => {
            const v = Math.min(Number(e.target.value), maxVal - 1000);
            setMinVal(v);
          }}
        />
        {/* max thumb */}
        <input
          type="range"
          className="pf-range"
          min={MIN_VAL}
          max={MAX_VAL}
          step={1000}
          value={maxVal}
          onChange={e => {
            const v = Math.max(Number(e.target.value), minVal + 1000);
            setMaxVal(v);
          }}
        />
      </div>

      {/* Number inputs */}
      <div className="pf-inputs">
        <input
          type="number"
          className="pf-input"
          value={minVal}
          min={MIN_VAL}
          max={maxVal - 1000}
          step={1000}
          onChange={e => setMinVal(Math.min(Number(e.target.value), maxVal - 1000))}
          onBlur={apply}
          aria-label="Minimum price"
        />
        <span className="pf-sep">-</span>
        <input
          type="number"
          className="pf-input"
          value={maxVal}
          min={minVal + 1000}
          max={MAX_VAL}
          step={1000}
          onChange={e => setMaxVal(Math.max(Number(e.target.value), minVal + 1000))}
          onBlur={apply}
          aria-label="Maximum price"
        />
      </div>
    </li>
  );
}
