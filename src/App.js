import React from "react";
import DataTable from "./components/DataTable";
import "bootstrap/dist/css/bootstrap.min.css";
//import Visualization from "./components/Visualization";

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Water Quality Data Analysis</h1>
//       </header>
//       <main>
//         <DataTable />
//       </main>
//     </div>
//   );
// }

// export default App;

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <DataTable />
    </div>
  );
}

export default App;

