import React from "react";

function Entry(props) {
  return (
    <div className="term">
      <dt>
        <span>{props.title}</span>
      </dt>
      <dd>{props.name}</dd>
      <dd>{props.date}</dd>
      <dd>{props.body}</dd>
    </div>
  );
}

export default Entry;
