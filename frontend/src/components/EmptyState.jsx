function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action ? <div style={{ marginTop: "1rem" }}>{action}</div> : null}
    </div>
  );
}

export default EmptyState;
