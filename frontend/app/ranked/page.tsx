"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";

const Status = {
  Idle: "Idle",
  Loading: "Loading",
  Authenticated: "Authenticated",
  Unauthenticated: "Unauthenticated",
  Error: "Error",
};

export default function RankedPage() {
  const [status, setStatus] = useState(Status.Idle);

  const checkAuth = async () => {
    setStatus(Status.Loading);

    const sessionToken = localStorage.getItem("session_token");
    if (!sessionToken) {
      setStatus(Status.Unauthenticated);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setStatus(Status.Unauthenticated);
        return;
      }

      const data = await res.json();
      console.log(`Auth check data: ${JSON.stringify(data, null, 2)}`);
      if (data && data.player) {
        setStatus(Status.Authenticated);
      } else {
        setStatus(Status.Unauthenticated);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setStatus(Status.Error);
    }
  };

  // biome-ignore-start lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため
  useEffect(() => {
    checkAuth();
  }, []);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため

  return (
    <div className={styles.container}>
      {status === Status.Error && (
        <p>Error occurred. Please try again later.</p>
      )}
      {status === Status.Unauthenticated && (
        <>
          <h1>Ranked Page</h1>
          <p>To access this page, you need to login!</p>
          <Link className={styles.login} href="/account">
            Login
          </Link>
        </>
      )}
      {status === Status.Authenticated && (
        <>
          <h1>Ranked Page</h1>
          <p>Welcome to the ranked page! You are successfully authenticated.</p>
        </>
      )}
      {status === Status.Loading && <p>Loading...</p>}
      {status === Status.Idle && <p>Checking authentication...</p>}
    </div>
  );
}
