import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { useInfoStore } from "@/stores/infoStore";
import { useAgentStore } from "@/stores/agentStore";
import { healthApi } from "@/apis/system_api";
import { message } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, MessageCircle, QrCode, Zap } from "lucide-react";

const loginSchema = z.object({
	username: z.string().min(1, "请输入用户名"),
	password: z.string().min(1, "请输入密码"),
});

const initializeSchema = z
	.object({
		username: z.string().min(1, "请输入用户名"),
		password: z.string().min(1, "请输入密码"),
		confirmPassword: z.string().min(1, "请确认密码"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "两次输入的密码不一致",
		path: ["confirmPassword"],
	});

const LoginView: React.FC = () => {
	const navigate = useNavigate();
	const { login, initialize, checkFirstRun, isLoggedIn, isAdmin } =
		useUserStore();
	const { organization, branding, footer, loadInfoConfig } = useInfoStore();
	const {
		initialize: initializeAgentStore,
		defaultAgent,
		agents,
	} = useAgentStore();

	const [isFirstRun, setIsFirstRun] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [serverStatus, setServerStatus] = useState("loading");
	const [serverError, setServerError] = useState("");
	const [healthChecking, setHealthChecking] = useState(false);

	const loginForm = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const initializeForm = useForm<z.infer<typeof initializeSchema>>({
		resolver: zodResolver(initializeSchema),
		defaultValues: {
			username: "",
			password: "",
			confirmPassword: "",
		},
	});

	const loginBgImage = organization()?.login_bg || "/login-bg.jpg";

	const checkServerHealth = async () => {
		try {
			setHealthChecking(true);
			const response = await healthApi.checkHealth();
			if (response.success) {
				setServerStatus("ok");
			} else {
				setServerStatus("error");
				setServerError(response.message || "服务端状态异常");
			}
		} catch (error: any) {
			setServerStatus("error");
			setServerError(error.message || "无法连接到服务端，请检查网络连接");
		} finally {
			setHealthChecking(false);
		}
	};

	useEffect(() => {
		if (isLoggedIn()) {
			navigate("/");
			return;
		}
		checkServerHealth();
		checkFirstRun().then(setIsFirstRun);
		loadInfoConfig();
	}, [isLoggedIn, navigate, checkFirstRun, loadInfoConfig]);

	const handleLogin = async (values: z.infer<typeof loginSchema>) => {
		try {
			setLoading(true);
			setErrorMessage("");
			await login(values);
			message.success("登录成功");
			const redirectPath = sessionStorage.getItem("redirect") || "/";
			sessionStorage.removeItem("redirect");

			if (redirectPath === "/") {
				if (isAdmin()) {
					navigate("/agent");
					return;
				}
				await initializeAgentStore();
				const agent = defaultAgent();
				if (agent) {
					navigate(`/agent/${agent.id}`);
				} else {
					const agentIds = Object.keys(agents);
					if (agentIds.length > 0) {
						navigate(`/agent/${agentIds[0]}`);
					} else {
						navigate("/");
					}
				}
			} else {
				navigate(redirectPath);
			}
		} catch (error: any) {
			setErrorMessage(error.message || "登录失败，请检查用户名和密码");
		} finally {
			setLoading(false);
		}
	};

	const handleInitialize = async (values: z.infer<typeof initializeSchema>) => {
		try {
			setLoading(true);
			setErrorMessage("");
			await initialize(values);
			message.success("管理员账户创建成功");
			navigate("/");
		} catch (error: any) {
			setErrorMessage(error.message || "初始化失败，请重试");
		} finally {
			setLoading(false);
		}
	};

	const showDevMessage = () => {
		message.info("该功能正在开发中，敬请期待！");
	};

	return (
		<div className={`min-h-screen ${serverStatus === "error" ? "pt-16" : ""}`}>
			{serverStatus === "error" && (
				<div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50">
					<div className="flex items-center justify-between max-w-7xl mx-auto">
						<div className="flex items-center gap-3">
							<AlertCircle className="h-5 w-5" />
							<div>
								<div className="font-semibold">服务端连接失败</div>
								<div className="text-sm">{serverError}</div>
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={checkServerHealth}
							disabled={healthChecking}
							className="text-white hover:bg-white/20"
						>
							{healthChecking ? "检查中..." : "重试"}
						</Button>
					</div>
				</div>
			)}
			<div className="flex h-screen">
				{/* Background image section - hidden on small screens */}
				<div className="hidden lg:flex flex-1 relative">
					<img
						src={loginBgImage}
						alt="登录背景"
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-8">
						<div className="text-white">
							<h1 className="text-4xl font-bold">
								{branding()?.name || "PathogenAI"}
							</h1>
							<p className="text-xl mt-2 text-gray-300">
								{branding()?.subtitle || "大模型驱动的知识库管理工具"}
							</p>
							<p className="mt-4 text-gray-300">
								{branding()?.description ||
									"结合知识库与知识图谱，提供更准确、更全面的回答"}
							</p>
						</div>
						<div className="text-gray-300 text-sm">
							<p>
								{footer()?.copyright || "PathogenAI"}.{" "}
								{branding()?.copyright || "版权所有"}
							</p>
						</div>
					</div>
				</div>

				{/* Login form section */}
				<div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white">
					<div className="w-full max-w-md">
						<div className="text-center mb-8">
							<h1 className="text-2xl font-bold text-gray-900">
								欢迎登录 {branding()?.name}
							</h1>
						</div>
						{isFirstRun ? (
							<div className="space-y-6">
								<div className="text-center">
									<h2 className="text-xl font-semibold text-gray-900">
										系统初始化
									</h2>
									<p className="text-gray-600 mt-2">
										系统首次运行，请创建超级管理员账户：
									</p>
								</div>
								<Form {...initializeForm}>
									<form
										onSubmit={initializeForm.handleSubmit(handleInitialize)}
										className="space-y-4"
									>
										<FormField
											control={initializeForm.control}
											name="username"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-700">
														用户名
													</FormLabel>
													<FormControl>
														<Input
															placeholder="请输入用户名"
															{...field}
															className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={initializeForm.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-700">密码</FormLabel>
													<FormControl>
														<Input
															type="password"
															placeholder="请输入密码"
															{...field}
															className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={initializeForm.control}
											name="confirmPassword"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-700">
														确认密码
													</FormLabel>
													<FormControl>
														<Input
															type="password"
															placeholder="请确认密码"
															{...field}
															className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="submit"
											className="w-full bg-blue-600 hover:bg-blue-700 text-white"
											disabled={loading}
										>
											{loading ? "创建中..." : "创建管理员账户"}
										</Button>
									</form>
								</Form>
							</div>
						) : (
							<div className="space-y-6">
								<Form {...loginForm}>
									<form
										onSubmit={loginForm.handleSubmit(handleLogin)}
										className="space-y-4"
									>
										<FormField
											control={loginForm.control}
											name="username"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-700">
														用户名
													</FormLabel>
													<FormControl>
														<Input
															placeholder="请输入用户名"
															{...field}
															className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={loginForm.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-700">密码</FormLabel>
													<FormControl>
														<Input
															type="password"
															placeholder="请输入密码"
															{...field}
															className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<Checkbox
													id="remember"
													onCheckedChange={showDevMessage}
												/>
												<label
													htmlFor="remember"
													className="text-sm text-gray-700 cursor-pointer"
												>
													记住我
												</label>
											</div>
											<button
												type="button"
												onClick={showDevMessage}
												className="text-sm text-blue-600 hover:underline"
											>
												忘记密码?
											</button>
										</div>
										<Button
											type="submit"
											className="w-full bg-blue-600 hover:bg-blue-700 text-white"
											disabled={loading}
										>
											{loading ? "登录中..." : "登录"}
										</Button>
									</form>
								</Form>
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-300" />
									</div>
									<div className="relative flex justify-center text-xs uppercase">
										<span className="bg-white px-2 text-gray-500">
											其他登录方式
										</span>
									</div>
								</div>
								<div className="flex justify-center gap-4">
									<Button
										variant="outline"
										size="icon"
										onClick={showDevMessage}
										className="border-gray-300 text-gray-700 hover:bg-gray-50"
									>
										<MessageCircle className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										onClick={showDevMessage}
										className="border-gray-300 text-gray-700 hover:bg-gray-50"
									>
										<QrCode className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										onClick={showDevMessage}
										className="border-gray-300 text-gray-700 hover:bg-gray-50"
									>
										<Zap className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}
						{errorMessage && (
							<div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
								{errorMessage}
							</div>
						)}
						<div className="mt-8 flex justify-center gap-6 text-sm text-gray-600">
							<a
								href="https://github.com/xerrors"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-blue-600 hover:underline"
							>
								联系我们
							</a>
							<a
								href="https://github.com/xerrors/PathogenAI"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-blue-600 hover:underline"
							>
								使用帮助
							</a>
							<a
								href="https://github.com/xerrors/PathogenAI/blob/main/LICENSE"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-blue-600 hover:underline"
							>
								隐私政策
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginView;
