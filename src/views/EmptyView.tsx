import React from "react";
import "./EmptyView.less";

const EmptyView: React.FC = () => {
	return (
		<div className="not-found">
			<h1>404 - 页面还没做</h1>
			<p>Sorry, Page not found.</p>
		</div>
	);
};

export default EmptyView;
