import { Outlet } from "react-router-dom";
import Header from "shared/components/Header";
import Container from "styles/app-styles";

export const App = () => {
  return (
    <Container>
      <Header />
      <div className="content">
        <Outlet />
      </div>
      <div>Footer</div>
    </Container>
  );
};

export default App;
