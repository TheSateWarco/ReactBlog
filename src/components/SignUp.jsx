import React, { useState } from "react";

function SignUp() {
  const [formData, setFormData] = useState({ user_id: "", password: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      alert("Account created! Please sign in.");
    } else {
      alert(data.message || "Signup failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input
        name="user_id"
        value={formData.user_id}
        onChange={handleChange}
        placeholder="Username"
        required
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignUp;
