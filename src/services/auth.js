import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();

    localStorage.setItem("jwt", token);

    return {
      displayName: result.user.displayName,
      email: result.user.email,
      token: token,
    };
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
  localStorage.removeItem("jwt");
  localStorage.removeItem("userName");
};
