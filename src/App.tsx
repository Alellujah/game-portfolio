import "./App.css";
import BattleUI, { DemoPlayer, DemoEnemy } from "./components/BattleUI";

function App() {
  return <BattleUI player={DemoPlayer} enemy={DemoEnemy} />;
}

export default App;
