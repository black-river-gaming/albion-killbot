import { Toast, ToastProps } from "react-bootstrap";
import StyledToast from "./style";

const CustomToast = (props: ToastProps) => {
  return (
    <StyledToast {...props}>
      <Toast.Body>{props.children}</Toast.Body>
    </StyledToast>
  );
};

export default CustomToast;
