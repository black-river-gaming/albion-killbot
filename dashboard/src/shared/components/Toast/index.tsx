import { Toast, ToastProps } from "react-bootstrap";
import StyledToast from "./style";

const MyToast = (props: ToastProps) => {
  return (
    <StyledToast {...props}>
      <Toast.Body>{props.children}</Toast.Body>
    </StyledToast>
  );
};

export default MyToast;
