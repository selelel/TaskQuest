import { RouterType } from "@/types/router";
import { Navigate } from "react-router-dom";

export default function PublicRoute({
    authenticated,
    redirect = "/poc",
    children
}: RouterType) {
    if (authenticated) return <Navigate to={redirect} replace />;

    return children;
}