import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { useEffect, useState } from "react";

import { GoogleAuthProvider } from "firebase/auth";
 import { AuthContext } from "../../context/authContext"; 

import auth from "../../firebase/firebase.config";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const GoogleProvider = new GoogleAuthProvider();

    const createNewUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const signInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const googleSignIn = () => {
        setLoading(true);
        return signInWithPopup(auth, GoogleProvider);
    }

    const signOutUser = () => {
        setLoading(true);
        return signOut(auth);
    }

    
    const resetPassword = (email) => {
        setLoading(true);
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        }, (error) => {
            console.error("Auth state error:", error);
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
        loading,
        createNewUser,
        signInUser,
        googleSignIn,
        signOutUser,
        resetPassword,
        setLoading
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
        
    );
};

export default AuthProvider;