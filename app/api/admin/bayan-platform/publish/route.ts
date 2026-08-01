import { NextResponse } from "next/server";
import type { BayanStudioProject } from "../../../../learn/arabic-b/lib/bayan-studio-schema";
import { publishProject, saveDraft } from "../../../../learn/arabic-b/lib/bayan-platform-repository";
export const runtime = "nodejs";
export async function POST(r:Request){ try { const b=await r.json() as {project:BayanStudioProject}; if(!b.project) return NextResponse.json({error:"invalid"},{status:400}); await saveDraft(b.project); const releaseId=await publishProject(b.project); return NextResponse.json({ok:true,releaseId}); } catch(e){ return NextResponse.json({error:e instanceof Error?e.message:"publish failed"},{status:500}); } }
