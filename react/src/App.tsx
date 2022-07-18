import System from "./components/System";
import initWasm, { greet } from "./pkg/rust";

function App() {
  initWasm().then(() => {
    greet();
  }).catch(e => {
    console.error(e);
  })


  return (
    <>
      <System />
    </>
  )
}

export default App;
