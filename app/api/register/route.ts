import { db } from "@/app/util/db";
import { NextResponse } from "next/server";
import { saltAndHashPassword } from "@/app/util/helper";
import { getUserByEmail } from "@/app/actions/get/getUserByEmail.action";

export async function POST(request: Request) {
	const body = await request.json();
	const { name, email, password } = body;

	const user = await getUserByEmail(email);

	if (user) {
		return NextResponse.json({
			message: "User already exists!",
			status: 400,
		});
	}

	const hashedPassword = saltAndHashPassword(password);

	await db.user.create({
		data: {
			email,
			name,
			password: hashedPassword,
		},
	});

	return NextResponse.json({
		status: 200,
		message: "User created successfully!",
	});
}
