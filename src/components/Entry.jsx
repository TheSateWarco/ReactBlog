function Entry({ blog_id, title, name, date, body, onEditClick, onDeleteClick, currentUserId, creatorUserId }) {
  const isOwner = currentUserId === creatorUserId;

  return (
    <div className="term">
      <dt><span>{title}</span></dt>
      <dd>By: {name}</dd>
      <dd>Date: {date}</dd>
      <dd>{body}</dd>

      {isOwner && (
        <div style={{ marginTop: "10px" }}>
          <button onClick={() => onEditClick(blog_id)}>Edit</button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure?")) {
                onDeleteClick(blog_id);
              }
            }}
            style={{ marginLeft: "8px" }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Entry;