import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({product:"ACE Exchange",version:"6.0.0",release:"Launch Candidate",build:process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,12)||"local"},{headers:{"cache-control":"public, max-age=60"}});}
