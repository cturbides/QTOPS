const validateUsername = (username: string) => {
    // At least 3 characters, no spaces, and no special characters
    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    return usernameRegex.test(username);
}

export default validateUsername;