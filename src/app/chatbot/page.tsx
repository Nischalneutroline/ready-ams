// app/page.tsx
import ChatBot from "@/components/chatbot/chatbot";
import ThemeSelector from "@/components/chatbot/ThemeSelector";
import { ThemeProvider } from "@/components/chatbot/context/ThemeContext";

const Home: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <ThemeSelector />
        <ChatBot
          primaryColor="#dc2626"
          backgroundColor="#f8fafc"
          textColor="#1f2937"
          userMessageColor="#3b82f6"
          botMessageColor="#6b7280"
        />
      </div>
    </ThemeProvider>
  );
};

export default Home;
