import { useState } from "react";
import { When } from "react-if";
import { useAsyncEffect } from "use-async-effect";
import System from "./components/System";
import initWasm from "./pkg/rust";

function App() {
  const [loading, setLoading] = useState(true)

  useAsyncEffect(async () => {
    await initWasm();
    setLoading(false)
  }, [])

  return (
    <When condition={!loading}>
      <System />
    </When>
  )
}

export default App;
