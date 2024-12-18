import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    console.log("[SIGNIN BODY]", body);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.log("[SIGNIN ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
