import Container from "@mui/material/Container";
import { BrowserRouter } from "react-router-dom";
import MainRoutes from "routes";

export const App = () => {
  return (
    <Container>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </Container>
  );
};

export default App;
