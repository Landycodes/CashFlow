import { useEffect, useState, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import { userContext } from "../App";
import { createPlaidLinkToken, exchangeAndSavePlaidToken } from "./API";

export function PlaidPopUp(
  id,
  //   onSuccessCallback = () => {},
  onErrorCallback = () => {}
) {
  const [linkToken, setLinkToken] = useState(null);
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();

  const createLinkToken = async () => {
    try {
      const response = await createPlaidLinkToken(id);
      setLinkToken(response.link_token);
    } catch (error) {
      console.error("Error creating Plaid link token:", error);
      onErrorCallback(error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      try {
        const updatedUser = await exchangeAndSavePlaidToken(public_token, id);
        setUser(updatedUser);
        navigate("/");
        // onSuccessCallback();
      } catch (error) {
        onErrorCallback(error);
      }
    },
    onExit: () => {
      setLinkToken(null);
    },
  });

  const openPlaidPopUp = async () => {
    if (!linkToken) {
      await createLinkToken();
    }
  };

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return { openPlaidPopUp };
}

export function fetchPlaidData(access_token) {
// TODO set up get balance and get transaction here to store the bank details to the user if last updated is null or greater then 6 hours from now
}