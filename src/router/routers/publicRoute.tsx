import { RouterType } from "@/types/router";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PublicRoute({
    authenticated,
    redirect = "/poc",
    children
}: RouterType) {
    const navigate = useNavigate();
    
    useEffect(() => {
        if (authenticated) {
            navigate(redirect, { replace: true }); 
        }
    }, [authenticated, navigate, redirect]);

    return !authenticated ? children : null;
}