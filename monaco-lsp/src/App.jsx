import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

function App() {
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const initializedRef = useRef(false); 
  const fileUri = "hello.py";

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;


    const editor = monaco.editor.create(editorRef.current, {
      value: "def hello():\n    print('Hello World')",
      language: "python",
      theme: "vs-dark",
      automaticLayout: true,
    });

 
    const socket = new WebSocket("ws://localhost:3001");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to backend");

    
      socket.send(JSON.stringify({ type: "init" }));

     
      socket.send(
        JSON.stringify({
          type: "didOpen",
          path: fileUri,
          content: editor.getValue(),
        })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from backend:", data);

      if (data.jsonrpc) {
        console.log("Pyright JSON-RPC:", data);
      }
    };

    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => console.log("WebSocket disconnected");

    let version = 1;

    editor.onDidChangeModelContent(() => {
      version += 1;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "didChange",
            path: fileUri,
            version: version,
            content: editor.getValue(),
          })
        );
      }
    });

    return () => {
      editor.dispose();
      socket.close();
    };
  }, []);

  return <div ref={editorRef} style={{ height: "100vh", width: "100vw" }} />;
}

export default App;
