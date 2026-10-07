"use client";

import { useState, useEffect } from "react";

export function CopyrightYear() {
  const [year, setYear] = useState(2025);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year}</>;
}
