import React from "react";
import Entry from "./Entry";
import blogs from "../blogs";

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
      date={post.date_created.toLocaleString()}
    />
  );
}

function App() {
  return (
    <div>
      <h1>
        <span>blog</span>
      </h1>
      <dl className="dictionary">{blogs.map(createEntry)}</dl>
    </div>
  );
}

export default App;
