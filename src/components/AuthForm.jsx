import React, { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

function AuthForm({ onSignIn }) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div>
      {isSignUp ? (
        <>
          <SignUp />
          <p>
            Already have an account?{" "}
            <button onClick={() => setIsSignUp(false)}>Sign In</button>
          </p>
        </>
      ) : (
        <>
          <SignIn onSignIn={onSignIn} />
          <p>
            Don't have an account?{" "}
            <button onClick={() => setIsSignUp(true)}>Sign Up</button>
          </p>
        </>
      )}
    </div>
  );
}

export default AuthForm;
