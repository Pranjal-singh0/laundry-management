function StatusBadge({ value }) {
  return (
    <span className={`status-badge status-${String(value).toLowerCase()}`}>
      {value}
    </span>
  );
}

export default StatusBadge;
