import { useState, useEffect, useCallback } from "react";
import "../assets/css/App.css";
import { Bot, Loader, CheckCircle } from "lucide-react";
import { fetchEmailReply } from "../lib/ai";
import axios from "axios";

const App = () => {
  const [data, setData] = useState<any>({});
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emotionTone, setEmotionTone] = useState("neutral");
  const [formalityLevel, setFormalityLevel] = useState(3);

  useEffect(() => {
    const handleMessage = ({ email, url, title }: any) => {
      setData({ email, url, title });
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const postReplyData = useCallback(
    async (reply: string) => {
      try {
        await axios.post("https://backend-gmail-crx.vercel.app/api/v1/dynamic/mail", {
          act: "CREATE",
          data_body: { reply, ...data },
          queryType: "create",
        });
        chrome.runtime.sendMessage({ type: "reply", reply });
      } catch (err) {
        console.error(err);
      }
    },
    [data]
  );

  const generateReply = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const generatedReply = await fetchEmailReply(
        data.email,
        emotionTone,
        formalityLevel
      );
      setReply(generatedReply);
      setSuccess(true);
      await postReplyData(generatedReply);
    } catch (err) {
      setError("Failed to generate reply. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [data, emotionTone, formalityLevel, postReplyData]);

  if (!data.email) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <Loader className="animate-spin w-20 h-20 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-md mx-auto mt-10">
      <h1 className="text-4xl font-bold text-center mb-4 text-blue-600">
        Email Reply Assistant
      </h1>
      <div className="flex flex-col items-center mb-4">
        <Bot size={40} className="text-blue-500 mb-2" />
      </div>

      <label htmlFor="emotionTone" className="text-gray-700">
        Emotion Tone:
      </label>
      <select
        id="emotionTone"
        value={emotionTone}
        onChange={(e) => setEmotionTone(e.target.value)}
        className="mb-4 mt-2 w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
      >
        {["neutral", "happy", "sad", "angry"].map((tone) => (
          <option key={tone} value={tone}>
            {tone.charAt(0).toUpperCase() + tone.slice(1)}
          </option>
        ))}
      </select>

      <label htmlFor="formalityLevel" className="text-gray-700">
        Formality Level: {formalityLevel}
      </label>
      <input
        type="range"
        id="formalityLevel"
        min="1"
        max="5"
        value={formalityLevel}
        onChange={(e) => setFormalityLevel(parseInt(e.target.value))}
        className="mb-4 mt-2 w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer range-slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 ${
            ((formalityLevel - 1) / 4) * 100
          }%, #e5e7eb ${((formalityLevel - 1) / 4) * 100}%)`,
        }}
      />

      <button
        onClick={generateReply}
        disabled={loading}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform duration-300 transform ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
        }`}
      >
        {loading ? "Generating Reply..." : "Generate Reply"}
      </button>

      {error && <p className="text-red-500 mt-3 font-semibold">{error}</p>}
      {success && (
        <div className="mt-4 p-4 border border-green-500 rounded-md bg-green-50 shadow-inner flex items-center">
          <CheckCircle className="text-green-600 mr-2" />
          <p className="text-green-800 font-semibold">
            Reply generated successfully!
          </p>
        </div>
      )}

      {reply && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50 shadow-inner">
          <h2 className="font-semibold text-lg mb-2 text-blue-600">
            Generated Reply:
          </h2>
          <p className="text-gray-800">{reply}</p>
        </div>
      )}

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        Open Options Page
      </button>
    </div>
  );
};

export default App;
