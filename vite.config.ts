import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Safely handle dynamic imports for development-only packages
const loadComponentTagger = async () => {
  if (process.env.NODE_ENV === 'production') return null;
  try {
    const module = await import('lovable-tagger');
    return module.componentTagger();
  } catch (error) {
    console.warn('Failed to load lovable-tagger:', error);
    return null;
  }
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Only load the component tagger in development mode
  const componentTagger = mode === 'development' ? await loadComponentTagger() : null;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      componentTagger,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Explicitly exclude development-only dependencies from production build
    optimizeDeps: {
      exclude: mode === 'production' ? ['lovable-tagger', 'parse-gitignore'] : [],
    },
  };
})}
