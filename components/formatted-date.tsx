"use client";

import { useEffect, useState } from "react";
import * as R from "remeda";

export default function FormattedDate({
  seconds,
  ...props
}: {
  seconds: unknown | string | number;
}) {
  const [language, setLanguage] = useState("en-US");

  useEffect(() => {
    setLanguage(window.navigator.language);
  }, []);

  if (R.isString(seconds)) {
    seconds = Number.parseInt(seconds);
  }

  if (!R.isNumber(seconds)) {
    return <div>Invalid date</div>;
  }

  const date = new Date(seconds * 1000);

  return (
    <div {...props}>
      {new Intl.DateTimeFormat(language, {
        dateStyle: "medium",
      }).format(date)}
    </div>
  );
}
