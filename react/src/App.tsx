import System from "./components/System";
import init, { greet } from "./pkg/rust";

function App() {
  init().then(() => {
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
