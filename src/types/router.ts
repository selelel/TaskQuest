import { ReactNode } from "react";

export type RouterType = {
    authenticated: boolean;
    redirect? : string;
    children: ReactNode;
}