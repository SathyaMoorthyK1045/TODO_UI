export default function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>
      <p>You are logged in 🎉</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
