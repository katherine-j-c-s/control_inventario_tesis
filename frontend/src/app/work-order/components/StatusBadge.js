import { getStatusBadge } from "./badges";

const StatusBadge = ({ status }) => {
  return getStatusBadge(status);
};

export default StatusBadge;
