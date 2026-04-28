function Loader({ label = "Loading", fullscreen = false }) {
  const className = fullscreen ? "loader-screen" : "loader-inline";

  return (
    <div className={className}>
      <span className="spinner" />
      <span>{label}...</span>
    </div>
  );
}

export default Loader;
