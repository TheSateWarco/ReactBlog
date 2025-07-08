
import React, { useState } from "react";
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

function App() {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  
  function handleSignIn(userData, blogsData) {
    setUser(userData);
    setBlogs(blogsData || []); // fallback to empty array
  }

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

  return (
    <div>
      {!user ? (
        <SignIn onSignIn={handleSignIn} />
      ) : (
        <>
          <h1>Welcome, {user.name}</h1>
          <dl className="blog">{Array.isArray(blogs) ? blogs.map(createEntry) : null}</dl>
        </>
      )}
    </div>
  );
}

export default App;
