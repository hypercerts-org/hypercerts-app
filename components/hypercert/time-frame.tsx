"use client";
import * as R from "remeda";
import { useEffect, useState } from "react";
import { fromUnixTime } from "date-fns";

export default function TimeFrame({
  from,
  to,
}: {
  from: string | undefined | null;
  to: string | undefined | null;
}) {
  const [language, setLanguage] = useState("en-US");

  useEffect(() => {
    setLanguage(window.navigator.language);
  }, []);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
    }).format(date);

  if (!from || !to) {
    return null;
  }

  const intFrom = Number.parseInt(from);
  const intTo = Number.parseInt(to);

  if (!R.isNumber(intFrom || !R.isNumber(intTo))) {
    return null;
  }

  let dateFrom = fromUnixTime(intFrom);
  let dateTo = fromUnixTime(intTo);

  const workTimeFrame = `${formatDate(dateFrom)} — ${formatDate(dateTo)}`;

  return (
    <div className="space-y-2 w-full">
      <p className="text-sm text-gray-600 font-medium">
        {workTimeFrame ?? "--"}
      </p>
    </div>
  );
}
