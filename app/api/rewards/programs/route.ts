import{NextResponse}from"next/server";import{fundingView}from"../../../../lib/reward-funding";export function GET(){return NextResponse.json({status:"simulation",programs:fundingView().programs})}
