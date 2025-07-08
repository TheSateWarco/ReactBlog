import React, { useState } from "react";

function SignUp() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Call backend API
    fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Account created!");
        } else {
          alert("Signup failed.");
        }
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" />
      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignUp;
