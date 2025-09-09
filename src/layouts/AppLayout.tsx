import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Github } from "lucide-react";
import { Bot, Waypoints, LibraryBig, Settings } from "lucide-react";

import { useConfigStore } from "@/stores/configStore";
import { useDatabaseStore } from "@/stores/databaseStore";
import { useInfoStore } from "@/stores/infoStore";
import UserInfoComponent from "@/components/UserInfoComponent";
import DebugComponent from "@/components/DebugComponent";

const mainList = [
	{ name: "智能体", path: "/agent", icon: Bot },
	{ name: "图谱", path: "/graph", icon: Waypoints },
	{ name: "知识库", path: "/database", icon: LibraryBig },
];

const AppLayout: React.FC = () => {
	const { refreshConfig } = useConfigStore();
	const { getDatabaseInfo } = useDatabaseStore();
	const { organization, loadInfoConfig } = useInfoStore();

	const [githubStars, setGithubStars] = useState(0);
	const [showDebugModal, setShowDebugModal] = useState(false);
	const debugTriggerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = debugTriggerRef.current;
		if (!element) return;

		let pressTimer: ReturnType<typeof setTimeout>;

		const handleMouseDown = () => {
			pressTimer = setTimeout(() => {
				setShowDebugModal(true);
			}, 1000);
		};

		const handleMouseUp = () => {
			clearTimeout(pressTimer);
		};

		element.addEventListener("mousedown", handleMouseDown);
		element.addEventListener("mouseup", handleMouseUp);
		element.addEventListener("mouseleave", handleMouseUp);

		return () => {
			element.removeEventListener("mousedown", handleMouseDown);
			element.removeEventListener("mouseup", handleMouseUp);
			element.removeEventListener("mouseleave", handleMouseUp);
		};
	}, []);

	useEffect(() => {
		loadInfoConfig();
		refreshConfig();
		getDatabaseInfo();

		fetch("https://api.github.com/repos/xerrors/PathogenAI")
			.then((res) => res.json())
			.then((data) => setGithubStars(data.stargazers_count));
	}, [loadInfoConfig, refreshConfig, getDatabaseInfo]);

	return (
		<TooltipProvider>
			<div className="app-layout">
				<div className="header">
					<div className="logo circle">
						<NavLink to="/">
							<img src={organization().avatar} alt="logo" />
						</NavLink>
					</div>
					<div className="nav">
						{mainList.map((item) => (
							<NavLink key={item.path} to={item.path} className="nav-item">
								{() => (
									<>
										<item.icon className="icon" size={22} />
										<span className="text">{item.name}</span>
									</>
								)}
							</NavLink>
						))}
					</div>
					<div ref={debugTriggerRef} className="fill debug-trigger"></div>
					<div className="github nav-item">
						<Tooltip>
							<TooltipTrigger asChild>
								<a
									href="https://github.com/xerrors/PathogenAI"
									target="_blank"
									rel="noopener noreferrer"
									className="github-link flex flex-col items-center p-2 hover:text-primary transition-colors"
								>
									<Github className="h-6 w-6" />
									{githubStars > 0 && (
										<span className="github-stars text-xs mt-1 font-semibold">
											{(githubStars / 1000).toFixed(1)}k
										</span>
									)}
								</a>
							</TooltipTrigger>
							<TooltipContent side="right">欢迎 Star</TooltipContent>
						</Tooltip>
					</div>
					<div className="nav-item user-info">
						<Tooltip>
							<TooltipTrigger asChild>
								<UserInfoComponent />
							</TooltipTrigger>
							<TooltipContent side="right">用户信息</TooltipContent>
						</Tooltip>
					</div>
					<NavLink
						to="/setting"
						className="nav-item setting p-3 hover:text-primary transition-colors"
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<Settings className="h-6 w-6" />
							</TooltipTrigger>
							<TooltipContent side="right">设置</TooltipContent>
						</Tooltip>
					</NavLink>
				</div>
				<div className="header-mobile">
					<NavLink to="/chat" className="nav-item">
						对话
					</NavLink>
					<NavLink to="/database" className="nav-item">
						知识
					</NavLink>
					<NavLink to="/setting" className="nav-item">
						设置
					</NavLink>
				</div>
				<div id="app-router-view">
					<Outlet />
				</div>
				<Dialog open={showDebugModal} onOpenChange={setShowDebugModal}>
					<DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
						<DialogHeader>
							<DialogTitle>调试面板</DialogTitle>
						</DialogHeader>
						<DebugComponent />
					</DialogContent>
				</Dialog>
			</div>
		</TooltipProvider>
	);
};

export default AppLayout;

import "./AppLayout.css";
