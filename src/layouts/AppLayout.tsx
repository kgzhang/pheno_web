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
		<div className="flex flex-row w-full h-screen min-w-[450px]">
			<div className="hidden md:flex flex-col flex-shrink-0 w-[60px] justify-start items-center bg-gray-50 h-full border-r border-gray-300">
				<div className="w-10 h-10 mx-2 my-2">
					<NavLink to="/">
						<img src={organization().avatar} alt="logo" className="w-full h-full rounded" />
					</NavLink>
				</div>
				<div className="flex flex-col justify-center items-center relative gap-4">
					{mainList.map((item) => (
						<NavLink
							key={item.path}
							to={item.path}
							className={({ isActive }) =>
								`flex flex-col items-center justify-center w-13 p-1 pt-2.5 border border-transparent rounded-md bg-transparent text-gray-800 text-lg transition-colors hover:text-blue-600 ${
									isActive ? "text-blue-600 font-bold text-shadow-[0_0_15px_rgba(130,195,214,0.5)]" : ""
								}`
							}
						>
							{({ isActive }) => (
								<>
									<item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : ""}`} />
									<span className="text-xs mt-1 text-center">{item.name}</span>
								</>
							)}
						</NavLink>
					))}
				</div>
				<div ref={debugTriggerRef} className="flex-grow min-h-5"></div>
				<div className="w-auto text-lg text-gray-800 mb-2 p-4 hover:cursor-pointer hover:text-blue-600">
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href="https://github.com/xerrors/PathogenAI"
								target="_blank"
								rel="noopener noreferrer"
								className="flex flex-col items-center p-2 hover:text-blue-600 transition-colors"
							>
								<Github className="h-6 w-6" />
								{githubStars > 0 && (
									<span className="flex items-center text-xs mt-1 font-semibold">
										{(githubStars / 1000).toFixed(1)}k
									</span>
								)}
							</a>
						</TooltipTrigger>
						<TooltipContent side="right">欢迎 Star</TooltipContent>
					</Tooltip>
				</div>
				<div className="w-13 p-1 pt-2.5">
					<Tooltip>
						<TooltipTrigger asChild>
							<UserInfoComponent />
						</TooltipTrigger>
						<TooltipContent side="right">用户信息</TooltipContent>
					</Tooltip>
				</div>
				<NavLink
					to="/setting"
					className="w-auto text-lg text-gray-800 mb-2 p-4 hover:text-blue-600 transition-colors hover:cursor-pointer"
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<Settings className="h-6 w-6" />
						</TooltipTrigger>
						<TooltipContent side="right">设置</TooltipContent>
					</Tooltip>
				</NavLink>
			</div>
			<div className="md:hidden flex flex-row w-full px-5 justify-around items-center flex-shrink-0 h-10 border-r-0">
				<NavLink to="/chat" className="text-gray-900 text-base font-bold transition-all hover:text-black">
					对话
				</NavLink>
				<NavLink to="/database" className="text-gray-900 text-base font-bold transition-all hover:text-black">
					知识
				</NavLink>
				<NavLink to="/setting" className="text-gray-900 text-base font-bold transition-all hover:text-black">
					设置
				</NavLink>
			</div>
			<div id="app-router-view" className="flex-1 max-w-full h-full overflow-y-auto">
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
