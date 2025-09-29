import React from "react";
import { useAuth } from "../../contexts/authContext";

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="text-2xl font-bold pt-14">
      {currentUser ? (
        <>
          Hello{" "}
          {currentUser.displayName
            ? currentUser.displayName
            : currentUser.email}
          , you are now logged in.
        </>
      ) : (
        <>Welcome, Guest! Please log in or register to continue.</>
      )}
    </div>
  );
};

export default Home;
