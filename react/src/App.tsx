import { useState } from "react";
import { When } from "react-if";
import { useAsyncEffect } from "use-async-effect";
import System from "./components/System";
import initWasm from "./pkg/rust";
import GlobalStyle from "./styles/global";

function App() {
  const [loading, setLoading] = useState(true)

  useAsyncEffect(async () => {
    await initWasm();
    setLoading(false)
  }, [])

  return (
    <>
      <GlobalStyle />
      <When condition={!loading}>
        <System />
      </When>
    </>
  )
}

export default App;
