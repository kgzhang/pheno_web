import React from "react";

const EmptyView: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-50">
			<h1 className="text-3xl font-bold text-gray-900 mb-2">404 - 页面还没做</h1>
			<p className="text-gray-600">Sorry, Page not found.</p>
		</div>
	);
};

export default EmptyView;
