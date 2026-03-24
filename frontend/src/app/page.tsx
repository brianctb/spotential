"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("loading...");

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error — backend not reachable"));
  }, []);

  return (
    <main>
      <h1>Spotential</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}