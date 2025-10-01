import React from "react";
import { useAuth } from "../../contexts/authContext";

const Home = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="text-2xl font-bold pt-14">
        Welcome, Guest! Please log in or register to continue.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-14">
      {currentUser.photoURL && (
        <img
          src={currentUser.photoURL}
          alt="Profile"
          className="w-24 h-24 rounded-full mb-4"
        />
      )}
      <h1 className="text-2xl font-bold">
        Hello{" "}
        {currentUser.displayName ? currentUser.displayName : currentUser.email},
        you are now logged in.
      </h1>
    </div>
  );
};

export default Home;
