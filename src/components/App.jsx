import React, { useState, useEffect } from "react";
import Entry from "./Entry";
import AuthForm from "./AuthForm"; // Component to handle sign-in/sign-up

// Reusable form component for both editing and creating blogs
function BlogForm({ title, body, onChange, onSave, onCancel }) {
  return (
    <form
      className="term"
      onSubmit={e => {
        e.preventDefault();
        onSave();
      }}
    >
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={title}
        onChange={e => onChange({ title: e.target.value, body })}
        required
      />
      <textarea
        name="body"
        rows={4}
        placeholder="Content"
        value={body}
        onChange={e => onChange({ title, body: e.target.value })}
        required
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ title: "", body: "" });
  const [isPosting, setIsPosting] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: "", body: "" });

  // Load blogs when the user logs in
  useEffect(() => {
    if (user) {
      fetch("http://localhost:5000/api/blogs", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          const sorted = data.sort(
            (a, b) => new Date(b.date_created) - new Date(a.date_created)
          );
          setBlogs(sorted);
        })
        .catch(console.error);
    }
  }, [user]);

  // Handle clicking "Edit" on a blog
  function handleEditClick(blog_id) {
    const blog = blogs.find(b => b.blog_id === blog_id);
    if (!blog) return;
    setEditingId(blog_id);
    setEditingData({ title: blog.title, body: blog.body });
  }

  // Update an existing blog post
  async function handleUpdateBlog(updated) {
    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update blog");

      // Refresh blog list after update
      const updatedBlogs = await fetch("http://localhost:5000/api/blogs", {
        credentials: "include",
      }).then(res => res.json());

      const sorted = updatedBlogs.sort(
        (a, b) => new Date(b.date_created) - new Date(a.date_created)
      );
      setBlogs(sorted);
      setEditingId(null);
    } catch (error) {
      alert(error.message);
    }
  }

  // Delete a blog post
  async function handleDeleteClick(blog_id) {
    try {
      const confirmed = window.confirm("Are you sure?");
      if (!confirmed) return;

      const res = await fetch(`http://localhost:5000/api/blogs/${blog_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete blog");

      // Refresh blog list after deletion
      const updatedBlogs = await fetch("http://localhost:5000/api/blogs", {
        credentials: "include",
      }).then(res => res.json());

      const sorted = updatedBlogs.sort(
        (a, b) => new Date(b.date_created) - new Date(a.date_created)
      );
      setBlogs(sorted);
    } catch (error) {
      alert(error.message);
    }
  }

  // Create a new blog post
  async function handleCreatePost() {
    try {
      const res = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPostData),
      });

      if (!res.ok) throw new Error("Failed to post blog");

      const updatedBlogs = await fetch("http://localhost:5000/api/blogs", {
        credentials: "include",
      }).then(res => res.json());

      const sorted = updatedBlogs.sort(
        (a, b) => new Date(b.date_created) - new Date(a.date_created)
      );

      setBlogs(sorted);
      setIsPosting(false);
      setNewPostData({ title: "", body: "" });
    } catch (err) {
      alert(err.message);
    }
  }

  // Show sign-in or sign-up if not authenticated
  if (!user) {
    return <AuthForm onSignIn={setUser} />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      {/* New Post button toggles visibility */}
      <button onClick={() => setIsPosting(prev => !prev)}>
        {isPosting ? "Cancel" : "New Post"}
      </button>

      {/* Show blog creation form */}
      {isPosting && (
        <BlogForm
          title={newPostData.title}
          body={newPostData.body}
          onChange={setNewPostData}
          onSave={handleCreatePost}
          onCancel={() => {
            setIsPosting(false);
            setNewPostData({ title: "", body: "" });
          }}
        />
      )}

      {/* Blog entries list */}
      <dl className="blog">
        {blogs.map(post => (
          <div key={post.blog_id}>
            {editingId === post.blog_id ? (
              <BlogForm
                title={editingData.title}
                body={editingData.body}
                onChange={setEditingData}
                onSave={() => handleUpdateBlog(editingData)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <Entry
                blog_id={post.blog_id}
                title={post.title}
                name={post.creator_name}
                date={new Date(post.date_created).toLocaleString()}
                body={post.body}
                currentUserId={user.user_id}
                creatorUserId={post.creator_user_id}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}

export default App;
