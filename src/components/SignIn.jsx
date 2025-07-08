import React, { useState } from "react";

function SignIn({ onSignIn }) {
  const [formData, setFormData] = useState({ user_id: "", password: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      onSignIn(data.user, data.blogs); // pass user and blogs to parent
    } else {
      alert(data.message || "Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign In</h2>
      <input
        name="user_id"
        value={formData.user_id}
        onChange={handleChange}
        placeholder="Username"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <button type="submit">Sign In</button>
    </form>
  );
}

export default SignIn;
