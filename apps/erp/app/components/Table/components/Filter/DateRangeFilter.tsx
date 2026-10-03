// SPDX-License-Identifier: AGPL-3.0-only
// Carbon (github.com/crbnos/carbon). Modified or adapted versions of this file,
// including ports, remain AGPLv3; serving them over a network requires releasing their source.

import { useDebounce } from "@carbon/react";
import type { CalendarDate } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import { useRef, useState } from "react";
import DateRangeFields, {
  type DateRangeValue
} from "~/components/DateRangeFields";
import { formatRangeFilter, parseRangeFilter } from "~/utils/query";
import { useFilters } from "./useFilters";

function toCalendarDate(value: string | null): CalendarDate | null {
  if (!value) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

type DateRangeFilterProps = {
  accessorKey: string;
};

/** `DateRangeFields` bound to the URL as `?filter=<key>:between:from,to`. */
const DateRangeFilter = ({ accessorKey }: DateRangeFilterProps) => {
  const { getFilterValue, removeKey, setFilter } = useFilters();

  const [defaultValue] = useState<DateRangeValue>(() => {
    const { from, to } = parseRangeFilter(getFilterValue(accessorKey) ?? "");
    return { from: toCalendarDate(from), to: toCalendarDate(to) };
  });

  const apply = ({ from, to }: DateRangeValue) => {
    const value = formatRangeFilter(from?.toString(), to?.toString());
    // Already what the URL says — closing the popover replays the last change
    if (value === getFilterValue(accessorKey)) return;
    if (value) {
      setFilter(accessorKey, value, "between");
    } else {
      removeKey(accessorKey);
    }
  };

  // A typed date emits every intermediate keystroke, so wait for it to
  // settle. The ref keeps the delayed call (and the flush on close) on the
  // current URL rather than the one from the render that scheduled it.
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const debouncedApply = useDebounce(
    (next: DateRangeValue) => applyRef.current(next),
    400,
    true
  );

  return (
    <DateRangeFields defaultValue={defaultValue} onChange={debouncedApply} />
  );
};

export default DateRangeFilter;
