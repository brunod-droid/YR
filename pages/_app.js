
import "../styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const isLogged = localStorage.getItem("yr_auth");

    if (!isLogged && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [router.pathname]);

  return <Component {...pageProps} />;
}
