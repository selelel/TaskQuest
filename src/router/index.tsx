
import PublicRoute from "./routers/publicRoute";
import { useState } from "react";
import POCpage from '@/page/poc';
import PrivateRoute from "./routers/privateRoute";
import { Route, Routes as _Routes_ } from "react-router-dom";
import SignInPage from "@/page/auth/signin"

function RoutesComponent() {
    const [auth, __] = useState(false);

    return (
        <_Routes_> {/* Use Routes instead of __Routes__ */}
            <Route 
                path="/poc" 
                element={<PrivateRoute authenticated={auth}><POCpage /></PrivateRoute>} 
            />
            <Route 
                path="/" 
                element={<PublicRoute authenticated={auth}><>Index</></PublicRoute>} 
            />
            <Route 
                path="/signin" 
                element={<PublicRoute authenticated={auth}><SignInPage/></PublicRoute>} 
            />
            <Route 
                path="/signup" 
                element={<PublicRoute authenticated={auth}><>Sign Up</></PublicRoute>} 
            />
        </_Routes_>
    );
}

export default RoutesComponent;
