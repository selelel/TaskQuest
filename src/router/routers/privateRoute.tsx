import { RouterType } from "@/types/router";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PrivateRoute({
    authenticated,
    redirect = "/signin",
    children
}: RouterType) {
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!authenticated) {
            navigate(redirect, { replace: true }); 
        }
    }, [authenticated, navigate, redirect]);

    return <>{children}</>;
}
