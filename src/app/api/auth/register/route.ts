import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/types";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(req: NextRequest) {
  try {
    const parsedData = registerSchema.safeParse(req.json());
    if (!parsedData) {
      throw new Error("please fill all fields");
    }
    if (parsedData.data?.password) {
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPasword = await bcrypt.hash(parsedData.data?.password!, salt);

    const userExists = await prisma.user.findFirst({
      where: {
        email: parsedData.data?.email,
      },
    });
    if (userExists) {
      return NextResponse.json(
        {
          error: "User already exists",
        },
        { status: 403 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name: parsedData.data?.name!,
        email: parsedData.data?.email!,
        password: hashedPasword,
      },
    });
    if (!newUser) {
      return NextResponse.json(
        { error: "Unable to Register the User" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "User Registered Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    throw new Error("Unable to Register the User");
  }
}
