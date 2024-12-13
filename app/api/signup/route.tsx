import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    console.log("[SIGNUP BODY]", body);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.log("[SIGNUP ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
