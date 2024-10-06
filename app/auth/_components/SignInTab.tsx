"use client";
import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { TabsContent } from "@/app/components/ui/tabs";
import { Separator } from "@/app/components/ui/separator";
import GithubSignInBtn from "./GithubSignInBtn";
import { loginWithCreds } from "@/app/actions/auth/auth.action";
// import Spinner from "@/components/Spinner/Spinner";

const SignInTab = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		setLoading(true);
		await loginWithCreds(email, password);
		setLoading(false);
	};

	return (
		<TabsContent value="sign-in">
			<Card>
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>
						Sign In to your account to continue browsing.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="space-y-1">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							placeholder="PedroDuarte@xyz.com"
							type="email"
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							placeholder="@peduarte"
							type="password"
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-6">
					<Button
						className="flex w-full gap-2"
						onClick={handleSignIn}
						disabled={loading || !email || !password}>
						{loading ? (
							<div className="h-5 w-5">
								loading...
								{/* <Spinner /> */}
							</div>
						) : (
							"Sign In"
						)}
					</Button>
					<Separator />
					<GithubSignInBtn />
				</CardFooter>
			</Card>
		</TabsContent>
	);
};

export default SignInTab;
