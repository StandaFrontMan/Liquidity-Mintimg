import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          "vendor-wagmi": ["wagmi", "viem"],

          "vendor-metamask": ["@metamask/sdk"],

          "vendor-utils": [
            "@tanstack/react-query",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "sonner",
          ],

          "vendor-ui": ["lucide-react", "next-themes", "radix-ui"],
        },

        chunkFileNames: "assets/[hash].js",
        entryFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash].[ext]",
      },
    },

    minify: "esbuild",

    target: "es2020",
    sourcemap: false,
    reportCompressedSize: false,
  },

  server: {
    open: true,
    cors: true,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "wagmi",
      "viem",
      "@metamask/sdk",
      "lucide-react",
    ],
    exclude: ["@tanstack/react-query"],
  },
});
