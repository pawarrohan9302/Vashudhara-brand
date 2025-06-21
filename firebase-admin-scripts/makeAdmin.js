// firebase-admin-scripts/makeAdmin.js

// 1. Import the Firebase Admin SDK
const admin = require("firebase-admin");

// 2. Import your Firebase Service Account Key
//    🔥 IMPORTANT: This line assumes your 'serviceAccountKey.json' file is
//    located in the SAME directory as this 'makeAdmin.js' script.
//    If it's elsewhere, you MUST update this path accordingly.
const serviceAccount = require("./serviceAccountKey.json"); // <--- CONFIRM THIS PATH!

// 3. Initialize the Firebase Admin SDK
//    This connects your script securely to your Firebase project.
//    The 'databaseURL' is essential if you interact with the Realtime Database
//    or if your project uses it for default initialization.
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://vashudharabrand-default-rtdb.firebaseio.com" // <--- VERIFY THIS IS YOUR CORRECT DATABASE URL
});

// 4. Define the email of the user you want to make an administrator.
//    🔥 CRITICAL: REPLACE THIS EMAIL with the ACTUAL EMAIL ADDRESS of
//    the user you wish to grant admin privileges.
//    This user must already exist in your Firebase Authentication.
const targetEmail = "pawarrohan18869@gmail.com"; // <--- CHANGE THIS TO YOUR ADMIN USER'S EMAIL!

/**
 * Sets the 'isAdmin: true' custom claim for a specified user in Firebase Authentication.
 * This function should be run in a secure, server-side environment (like this Node.js script).
 *
 * After this claim is set, your React application's AuthContext, which uses
 * 'getIdTokenResult(true)', will recognize the user as an admin after their
 * next login or token refresh.
 */
async function setAdminClaim() {
    try {
        console.log(`\nAttempting to set admin claim for user: ${targetEmail}`);

        // Fetch the user record from Firebase Authentication by their email.
        // This confirms the user exists in your Firebase project.
        const user = await admin.auth().getUserByEmail(targetEmail);
        console.log(`User found: UID = ${user.uid}, Email = ${user.email}`);

        // Set the custom claim 'isAdmin' to true for this user's ID token.
        // This is the core action that grants admin privilege.
        await admin.auth().setCustomUserClaims(user.uid, { isAdmin: true });

        console.log(`\n✅ Success! The 'isAdmin: true' claim has been set for: ${user.email}`);
        console.log(`The user will now be recognized as an admin by your application.`);
        console.log(`They might need to log out and log back in for changes to take full effect.`);

        process.exit(0); // Exit the script successfully
    } catch (error) {
        console.error("\n❌ An error occurred while setting the admin claim:");
        if (error.code === 'auth/user-not-found') {
            console.error(`Error: User with email "${targetEmail}" was not found in Firebase Authentication.`);
            console.error(`Please ensure the email address is correct and the user account exists in your Firebase project.`);
        } else {
            console.error(`An unexpected error occurred: ${error.message}`);
        }
        process.exit(1); // Exit the script with an error code to indicate failure
    }
}

// Execute the function to start the process when the script is run.
setAdminClaim();