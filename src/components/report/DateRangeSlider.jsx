import { useMemo } from "react";
import {
  DATE_RANGE_CONSTANTS,
  ensureRangeWithinWindow,
} from "../../utils/dateRangeUtils";

const formatHumanDate = (isoDate) => {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) {
    return isoDate;
  }
  return new Date(parsed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function DateRangeSlider({ value, onChange }) {
  const normalized = useMemo(
    () => ensureRangeWithinWindow(value),
    [value?.from, value?.to]
  );

  const todayIso = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const handleInputChange = (type) => (event) => {
    const value = event.target.value;
    if (!value) return;
    const draft =
      type === "from"
        ? { from: value, to: normalized.to }
        : { from: normalized.from, to: value };
    const constrained = ensureRangeWithinWindow(draft);
    onChange?.(constrained);
  };

  return (
    <div className="date-range-slider">
      <div className="d-flex flex-column flex-lg-row align-items-lg-start gap-3">
        <div className="date-range-slider__inputs">
          <div className="date-range-input">
            <label className="muted-label text-uppercase small mb-1">From</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={normalized.from}
              min={DATE_RANGE_CONSTANTS.MIN_DATE}
              max={normalized.to}
              onChange={handleInputChange("from")}
            />
          </div>
          <div className="date-range-input">
            <label className="muted-label text-uppercase small mb-1">To</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={normalized.to}
              min={normalized.from}
              max={todayIso}
              onChange={handleInputChange("to")}
            />
          </div>
        </div>
        <div className="flex-grow-1 date-range-slider__info">
          <p className="muted-label text-uppercase small mb-1">Selected range</p>
          <div className="fw-semibold small mb-2">
            {formatHumanDate(normalized.from)} → {formatHumanDate(normalized.to)}
          </div>
          <p className="text-muted small mb-0">
            Earliest: {formatHumanDate(DATE_RANGE_CONSTANTS.MIN_DATE)} · Latest:{" "}
            {formatHumanDate(todayIso)}
          </p>
        </div>
      </div>
      <p className="text-muted small mb-0 text-end mt-2">
        Max window {DATE_RANGE_CONSTANTS.MAX_WINDOW_DAYS} days
      </p>
    </div>
  );
}

export default DateRangeSlider;
