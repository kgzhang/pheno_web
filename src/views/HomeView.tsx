import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { useInfoStore } from "@/stores/infoStore";
import { useAgentStore } from "@/stores/agentStore";
import UserInfoComponent from "@/components/UserInfoComponent";

const HomeView: React.FC = () => {
	const navigate = useNavigate();
	const { isLoggedIn, isAdmin } = useUserStore();
	const { organization, branding, features, footer, loadInfoConfig } =
		useInfoStore();
	const { defaultAgent } = useAgentStore();

	const goToChat = async () => {
		if (!isLoggedIn()) {
			sessionStorage.setItem("redirect", "/");
			navigate("/login");
			return;
		}
		if (isAdmin()) {
			navigate("/agent");
			return;
		}
		try {
			const agent = defaultAgent();
			if (agent) {
				navigate(`/agent/${agent.id}`);
			}
		} catch (error) {
			console.error("跳转到智能体页面失败:", error);
			navigate("/");
		}
	};

	useEffect(() => {
		loadInfoConfig();
	}, [loadInfoConfig]);

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
			{/* Background elements */}
			<div className="absolute inset-0 overflow-hidden z-0">
				<div className="absolute w-40 h-40 bg-blue-200 rounded-full top-10 left-10 opacity-20 animate-pulse"></div>
				<div className="absolute w-24 h-24 bg-blue-300 rounded-full bottom-20 left-1/4 opacity-20 animate-pulse"></div>
				<div className="absolute w-20 h-20 bg-blue-400 rounded-full top-20 right-10 opacity-20 animate-pulse"></div>
				<div className="absolute w-32 h-32 bg-blue-300 rounded-full bottom-16 right-20 opacity-20 animate-pulse"></div>
			</div>

			<div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				{/* Glass header */}
				<div className="flex justify-between items-center w-full py-4 bg-white/30 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-20">
					<div className="flex items-center">
						<Link to="/" className="flex items-center">
							<img
								src={organization().logo}
								alt={organization().name}
								className="h-10 w-10 rounded-md mr-3"
							/>
							<span className="text-xl font-bold text-gray-900">
								{organization().name}
							</span>
						</Link>
					</div>
					
					<nav className="hidden md:flex items-center space-x-1">
						{isLoggedIn() && isAdmin() && (
							<>
								<Link
									to="/agent"
									className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg transition-colors duration-200"
								>
									智能体
								</Link>
								<Link
									to="/graph"
									className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg transition-colors duration-200"
								>
									知识图谱
								</Link>
								<Link
									to="/database"
									className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg transition-colors duration-200"
								>
									知识库
								</Link>
								<Link
									to="/setting"
									className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg transition-colors duration-200"
								>
									设置
								</Link>
							</>
						)}
					</nav>
					
					<div className="flex items-center space-x-4">
						<a
							href="https://github.com/xerrors/PathogenAI"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
						>
							<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
							</svg>
						</a>
						<UserInfoComponent showButton={true} />
					</div>
				</div>

				{/* Hero section */}
				<div className="flex flex-col items-center justify-center flex-1 py-12">
					<div className="text-center max-w-3xl">
						<h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
							{branding().title}
						</h1>
						<p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
							{branding().subtitle}
						</p>
						<div className="mb-12">
							<div className="flex flex-wrap justify-center gap-3">
								{features().map((feature, index) => (
									<span
										key={index}
										className="px-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-full text-gray-700 font-medium shadow-sm"
									>
										{feature}
									</span>
								))}
							</div>
						</div>
						<button
							onClick={goToChat}
							className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 ease-in-out"
						>
							开始对话
						</button>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 py-6 relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-center text-gray-600 text-sm">
						{footer()?.copyright || "© 2025 All rights reserved"}
					</p>
				</div>
			</footer>
		</div>
	);
};

export default HomeView;
