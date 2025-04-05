import PublicRoute from "./routers/publicRoute";
import { useEffect, useState } from "react";
import POCpage from '@/page/poc';
import POCCalendarSchedulerpage from '@/page/poc/poc-calendar-scheduler';
import PrivateRoute from "./routers/privateRoute";
import { Route, Routes } from "react-router-dom";
import SignInPage from "@/page/auth/signin"
import SignUpPage from "@/page/auth/signup"
import { auth } from "@/~core/firebase/client";

function RoutesComponent() {
    const [userSignedIn, setUserSignedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUserSignedIn(!!user);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Routes>
            <Route 
                path="/poc" 
                element={<PrivateRoute authenticated={userSignedIn}><POCpage /></PrivateRoute>} 
            />
            <Route 
                path="/poc-calendar-scheduler" 
                element={<POCCalendarSchedulerpage />} 
            />
            <Route 
                path="/" 
                element={<PublicRoute authenticated={userSignedIn}><>Index</></PublicRoute>} 
            />
            <Route 
                path="/signin" 
                element={<PublicRoute authenticated={userSignedIn}><SignInPage/></PublicRoute>} 
            />
            <Route 
                path="/signup" 
                element={<PublicRoute authenticated={userSignedIn}><SignUpPage/></PublicRoute>} 
            />
        </Routes>
    );
}

export default RoutesComponent;
