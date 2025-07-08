
import React, { useState, useEffect } from "react";
import BlogEntry  from "../blogs";
import Entry from "./Entry";
import SignIn from "./SignIn";
import SignUp from "./SignUp";


//1. Extract the repeated parts of the App into a Entry component.
//2. Use props to make the Entry component render different data.
//3a. Import the blogs constant.
//3b. Map through the blogs array and render Entry components.



//var post = {
//   blog_id: "1",
//    creator_name: "Elite",
//    title: "Crazy",
//    body: "Crazy? I was crazy once. They locked me in a room. A rubber room. A room filled with rats. The rats made me crazy. Crazy?", 
//    date_created:new Date(),
//    creator_user_id:"elite001"}
// }
function createEntry(post) {
  return (
    <Entry
      key={post.blog_id}
      name={post.creator_name}
      title={post.title}
      body={post.body}
      date={new Date(post.date_created).toLocaleString()}
    />
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);

  // This function runs when the user signs in
  const handleSignIn = (userData) => {
    setUser(userData);
    // ❌ Do not fetch blogs here if you're using useEffect
  };

  // ✅ This useEffect runs AFTER user logs in
useEffect(() => {
  fetch("http://localhost:5000/api/blogs")  // Ensure this is the exact route in Express
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log("Fetched blogs:", data);
      setBlogs(data);
    })
    .catch(err => console.error("Failed to fetch blogs:", err));
}, []);

  return (
    <div>
      {!user ? (
        <SignIn onSignIn={handleSignIn} />
      ) : (
        <>
          <h1>Welcome, {user.name}</h1>
          <dl className="blog">{blogs.map(createEntry)}</dl>
        </>
      )}
    </div>
  );
}
export default App;
