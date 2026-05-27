
export default function Login() {
  async function handleLogin(e) {
    e.preventDefault();
    const password = e.target.password.value;

    if (password === process.env.NEXT_PUBLIC_YR_PASSWORD) {
      localStorage.setItem("yr_auth", "true");
      window.location.href = "/";
    } else {
      alert("Wrong password");
    }
  }

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"#f5f5f5"
    }}>
      <form onSubmit={handleLogin} style={{
        background:"#fff",
        padding:40,
        borderRadius:20,
        width:320
      }}>
        <h1>Yves Rocher Hub</h1>

        <input
          name="password"
          type="password"
          placeholder="Password"
          style={{
            width:"100%",
            padding:12,
            marginTop:20
          }}
        />

        <button style={{
          width:"100%",
          marginTop:20,
          padding:12
        }}>
          Login
        </button>
      </form>
    </div>
  );
}
