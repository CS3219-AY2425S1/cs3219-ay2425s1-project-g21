const verifyJWT = async (authorizationHeader) => {
  try {
    const response = await global.fetch(
      "http://user-service:3001/auth/verify-token",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authorizationHeader}`,
        },
      }
    );
    const data = await response.json();
    if (data.message !== "Token verified") {
      throw new Error(`JWT verification failed: ${data.message}`);
    }
    return data.data; // Return user data if verification is successful
  } catch (error) {
    throw new Error("Failed to verify JWT");
  }
};

module.exports = verifyJWT;
