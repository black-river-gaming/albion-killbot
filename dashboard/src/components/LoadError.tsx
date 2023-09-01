import { faBug } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Stack } from "react-bootstrap";

const LoadError = () => {
  return (
    <Stack gap={2} className="justify-content-center h-100">
      <FontAwesomeIcon size="3x" icon={faBug} />
      <div className="lead text-center">
        Failed to load page. Please try again later.
      </div>
    </Stack>
  );
};

export default LoadError;
