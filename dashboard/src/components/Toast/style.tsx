import { Toast } from "react-bootstrap";
import styled from "styled-components";

const StyledToast = styled(Toast)`
  animation: 1s slideDown ease-in-out;

  position: fixed;
  bottom: 1rem;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;

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
