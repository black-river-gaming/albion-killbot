import { Toast } from "react-bootstrap";
import styled from "styled-components";

const StyledToast = styled(Toast)`
  animation: 1s slideDown ease-in-out;

  @keyframes slideDown {
    from {
      transform: translateY(-1rem);
      opacity: 0;
    }

    to {
      transform: translateY(0rem);
      opacity: 1;
    }
  }
`;

export default StyledToast;
