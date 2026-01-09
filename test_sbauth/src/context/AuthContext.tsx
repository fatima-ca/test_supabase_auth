import { createContext, useEffect, useState, useContext, ReactNode } from "react";
import { supabase } from "../supabaseClient";


interface AuthContextType {
    session: any; 
    signUpNewUser: (email: string, password: string) => Promise<any>;
    signInUser: (email: string, password: string) => Promise<any>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);


interface AuthContextProviderProps {
    children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [session, setSession] = useState<any>(undefined); 

    //Sign up
    const signUpNewUser = async (email: string, password: string) => {
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if(error) {
            console.error("there was a problem signing up:", error);
            return { success: false, error};
        }
        return { success: true, data};
    }

    //Sign in
    const signInUser = async (email: string, password: string) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('sign in error occurred:', error);
                return {success: false, error: error.message};
            }
            console.log("sign-in success: ", data);
            return {success: true, data: data};
        } catch(error) {
            console.error("an error occurred: ", error);
        }
    };


    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })

    }, [])

    //Sign out
    const signOut = async () => {
        const {error} = await supabase.auth.signOut();
        if(error) {
            console.error("there was an error singing out: ", error);
        }

    };

    return (
        <AuthContext.Provider 
            value={{ session, signUpNewUser, signInUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("UserAuth must be used within AuthContextProvider");
    }
    return context;
};