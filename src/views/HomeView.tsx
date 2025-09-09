import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { useInfoStore } from "@/stores/infoStore";
import { useAgentStore } from "@/stores/agentStore";
import UserInfoComponent from "@/components/UserInfoComponent";
import "./HomeView.less";

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
		<div className="home-container">
			<div className="background-elements">
				<div className="circle circle-1"></div>
				<div className="circle circle-2"></div>
				<div className="circle circle-3"></div>
				<div className="circle circle-4"></div>
			</div>
			<div className="hero-section">
				<div className="glass-header">
					<div className="logo">
						<img
							src={organization().logo}
							alt={organization().name}
							className="logo-img"
						/>
						<span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
							{organization().name}
						</span>
					</div>
					<nav className="nav-links">
						{isLoggedIn() && isAdmin() && (
							<>
								<Link to="/agent" className="nav-link">
									<span>智能体</span>
								</Link>
								<Link to="/graph" className="nav-link">
									<span>知识图谱</span>
								</Link>
								<Link to="/database" className="nav-link">
									<span>知识库</span>
								</Link>
								<Link to="/setting" className="nav-link">
									<span>设置</span>
								</Link>
							</>
						)}
					</nav>
					<div className="header-actions">
						<div className="github-link">
							<a
								href="https://github.com/xerrors/PathogenAI"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg height="20" width="20" viewBox="0 0 16 16" version="1.1">
									<path
										fillRule="evenodd"
										d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
									></path>
								</svg>
							</a>
						</div>
						<UserInfoComponent showButton={true} />
					</div>
				</div>

				<div className="hero-content">
					<h1 className="title">{branding().title}</h1>
					<div className="description">
						<p className="subtitle">{branding().subtitle}</p>
						<p className="features">
							{features().map((feature) => (
								<span key={feature}>{feature}</span>
							))}
						</p>
					</div>
					<button className="start-button" onClick={goToChat}>
						开始对话
					</button>
				</div>
			</div>

			<footer className="footer">
				<div className="footer-content">
					<p className="copyright">
						{footer()?.copyright || "© 2025 All rights reserved"}
					</p>
				</div>
			</footer>
		</div>
	);
};

export default HomeView;
