import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

// import { useInfoStore } from '@/stores/info'

// const infoStore = useInfoStore()
// infoStore.loadInfoConfig()

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
		<Toaster />
	</React.StrictMode>,
);
