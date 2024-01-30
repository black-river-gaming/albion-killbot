import { useAppDispatch, useAppSelector } from "helpers/hooks";
import { Toast, ToastContainer } from "react-bootstrap";
import { removeToast } from "store/toast";

const Toasts = () => {
  const toasts = useAppSelector((state) => state.toast);
  const dispatch = useAppDispatch();

  const handleClose = (toast: typeof toasts[number]) => {
    dispatch(removeToast(toast.id));
  };

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast
          show
          autohide
          key={toast.id}
          bg={toast.theme}
          onClose={() => handleClose(toast)}
        >
          <Toast.Header>{toast.message}</Toast.Header>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default Toasts;
