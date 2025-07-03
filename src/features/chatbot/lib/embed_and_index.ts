import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import pg from "pg";

export async function embedAndIndexPDF() {
  const loader = new PDFLoader("src/app/data/nepal.pdf");
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(docs);

  try {
    //do the open ai embedding while in production 

    /*  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAPIKEY,
    configuration: { baseURL: "https://api.openai.com/v1" },
    model: "text-embedding-3-small",
  }); */

    // Use Ollama for embeddings
    const embeddings = new OllamaEmbeddings({
      model: "mxbai-embed-large", // or another supported embedding model
      baseUrl: "http://localhost:11434", // default Ollama endpoint
    });

    // 3. Set up your Postgres client
    // Create a connection pool instead of a single client
    const pool = new pg.Pool({
      connectionString: process.env.PGVECTOR_URL,
    });

    // Pass the pool in the config object
    const vectorStore = await PGVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pool, 
        tableName: "langchain_vectors",
      }
    );
    return vectorStore;
  } catch (err) {
    console.error("Chroma indexing error:", err);
  }
}
