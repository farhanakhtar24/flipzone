"use client";
import { login } from "@/app/actions/action.auth";
// import { login } from "@/actions/auth.action";
// import Spinner from "@/app/components/Spinner/Spinner";
import { Button } from "@/app/components/ui/button";
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";

const GithubSignInBtn = () => {
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		setLoading(true);
		await login("github");
		setLoading(false);
	};

	return (
		<Button
			className="flex w-full items-center justify-center gap-2 bg-slate-800 hover:bg-slate-600"
			onClick={handleSignIn}
			disabled={loading}>
			{loading ? (
				<div className="h-5 w-5">
					{/* <Spinner /> */}
					loading...
				</div>
			) : (
				<>
					<FaGithub className="text-lg" />
					Github
				</>
			)}
		</Button>
	);
};

export default GithubSignInBtn;
