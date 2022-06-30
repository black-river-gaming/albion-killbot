import { Outlet, useLocation } from "react-router-dom";
import Footer from "shared/components/Footer";
import Header from "shared/components/Header";
import Paper from "shared/components/Paper";
import Container from "styles/app-styles";

export const App = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <Container>
      <Header />
      <Paper elevation={24} className="content">
        {isHome ? (
          <Outlet />
        ) : (
          <div className="container">
            <Outlet />
          </div>
        )}
      </Paper>
      <Footer />
    </Container>
  );
};

export default App;
