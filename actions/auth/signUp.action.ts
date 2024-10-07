import axios from "axios";
import { loginWithCreds } from "./auth.action";
export const signUp = async (name: string, email: string, password: string) => {
  try {
    await axios.post("/api/register", {
      name,
      email,
      password,
    });

    await loginWithCreds(email, password);
  } catch (error) {
    console.log(error);
  }
};
