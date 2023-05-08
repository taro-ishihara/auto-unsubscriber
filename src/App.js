import "./App.css";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import {decode} from 'base-64';

function App() {
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
      setToken(tokenResponse.access_token);
    },
    scope: "https://www.googleapis.com/auth/gmail.readonly",
  });
  return (
    <div className="App">
      <button onClick={login}>ログインボタン</button>
      <button
        onClick={async () => {
          setMessages([]);
          const response = await fetch(
            "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10",
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );
          const data = await response.json();
          data.messages.map(async (message) => {
            const response = await fetch(
              `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
              {
                headers: {
                  Authorization: "Bearer " + token,
                },
              }
            );
            const data = await response.json();
            let newMessage = [];
            //newMessage = atob(data.raw.replace(/-/g, "+").replace(/_/g, "/"));
            // newMessage = decode(data.raw.replace(/-/g, '+').replace(/_/g, '/'))
            // 
            // console.log(newMessage)
            if (data.payload.mimeType.startsWith("multipart")) {
              const htmlMessage = data.payload.parts.filter(
                (part) => part.mimeType === "text/html"
              );
              newMessage = decode(htmlMessage[0].body.data.replace(/-/g, '+').replace(/_/g, '/'))
            } else {
              newMessage = decode(data.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
            }
            // const hrefValues = Array.from(newMessage.matchAll(/<link.+?href=["'](.+?)["']/gi), match => match[1]);
            const regex = /(?:http|https):\/\/[\w\-_]+(?:\.[\w\-_]+)+[\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#]/g;
            const matches = newMessage.match(regex);
            const urls = matches.map((url) => {
              return decodeURIComponent(url).split('?')[0]
            }).filter(url => {
              return !/\.[^/.]+$/.test(url)
            })
            setMessages((prevMessages) => [...prevMessages, urls]);
          });
        }}
      >
        このボタンを教えてください
      </button>
      {messages.length}
      {messages.map((message) => {
        return (
          <>
            <p>区切り</p>
            <ul>
              {message.map((url)=>{
                return <>
                  <li>{url}</li>
                </>
              })}
            </ul>

          </>
        );
      })}
    </div>
  );
}

export default App;
