import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SafeBrawl",
    short_name: "SafeBrawl",
    description: "avoid cheaters, enjoy Brawl Stars",
    start_url: "/",
    // display: "standalone",
    display: "browser",
    background_color: "#181818",
    theme_color: "#181818",
    icons: [
      {
        src: "/192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
