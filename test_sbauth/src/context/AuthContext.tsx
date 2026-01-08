import { createContext, useEffect, useState, useContext, ReactNode } from "react";
import { supabase } from "../supabaseClient";


interface AuthContextType {
    session: any; 
}

const AuthContext = createContext<AuthContextType | null>(null);


interface AuthContextProviderProps {
    children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [session, setSession] = useState<any>(undefined); 

    //Sign up
    const signUpNewUser = async () => {
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

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })

    }, [])

    //Sign out
    const signOut = () => {
        const {error} = supabase.auth.signOut();
        if(error) {
            console.error("there was an error singing out: ", error);
        }

    };

    return (
        <AuthContext.Provider value={{ session, signUpNewUser, signOut }}>
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