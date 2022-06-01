import { Outlet } from "react-router-dom";
import Header from "shared/components/Header";
import Paper from "shared/components/Paper";
import Container from "styles/app-styles";

export const App = () => {
  return (
    <Container>
      <Header />
      <Paper elevation={24} className="content">
        <div className="container">
          <Outlet />
        </div>
      </Paper>
      <div>Footer</div>
    </Container>
  );
};

export default App;
