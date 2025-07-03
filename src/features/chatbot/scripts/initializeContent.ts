import { embedAndIndexAllContent } from "../lib/embed_and_indexes";

embedAndIndexAllContent({ forceReindex: true })
  .then(() => {
    console.log("Initial embedding and indexing complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Indexing failed:", err);
    process.exit(1);
  });
