import React, { useEffect, useState } from "react";
import "../assets/css/App.css";
import { Bot } from "lucide-react";
import axios from "axios";
const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .post("https://backend-gmail-crx.vercel.app/api/v1/dynamic/mail", {
        act: "GET",
        queryType: "findMany",
        select: {
          email: true,
          reply: true,
          createdAt: true,
          updatedAt: true,
          url: true,
          id: true,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className="bg-red-400">
      <h1 className="text-3xl font-bold underline">{JSON.stringify(data)}</h1>
      <Bot size={30} />
    </div>
  );
};

export default App;
